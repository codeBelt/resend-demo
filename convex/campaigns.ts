import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { resend } from "./emails";

export const createCampaign = mutation({
  args: {
    name: v.string(),
    subject: v.string(),
    body: v.string(),
    listId: v.optional(v.id("lists")),
    recipientEmails: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const me = await ctx.db.get(userId);
    if (!me) throw new Error("User not found");

    let recipients: string[] = [];
    if (args.listId) {
      // Get contacts from list
      const memberships = await ctx.db
        .query("listMemberships")
        .withIndex("listId", (q) => q.eq("listId", args.listId))
        .collect();

      const contacts = await Promise.all(
        memberships.map(async (membership) => {
          const contact = await ctx.db.get(membership.contactId);
          return contact;
        }),
      );

      recipients = contacts
        .filter((contact) => contact && !contact.unsubscribed)
        .map((contact) => contact!.email);
    } else if (args.recipientEmails) {
      recipients = args.recipientEmails;
    } else {
      throw new Error("Must provide either listId or recipientEmails");
    }

    const campaignId = await ctx.db.insert("emailCampaigns", {
      userId,
      name: args.name,
      subject: args.subject,
      body: args.body,
      listId: args.listId,
      recipientEmails: args.recipientEmails,
      status: "draft",
      totalRecipients: recipients.length,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      createdAt: Date.now(),
    });

    return campaignId;
  },
});

export const sendCampaign = mutation({
  args: { campaignId: v.id("emailCampaigns") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== userId) {
      throw new Error("Campaign not found");
    }

    if (campaign.status !== "draft") {
      throw new Error("Campaign already sent");
    }

    const me = await ctx.db.get(userId);
    if (!me) throw new Error("User not found");

    // Update campaign status
    await ctx.db.patch(args.campaignId, {
      status: "queued",
      startedAt: Date.now(),
    });

    // Get recipients
    let recipients: string[] = [];
    if (campaign.listId) {
      const memberships = await ctx.db
        .query("listMemberships")
        .withIndex("listId", (q) => q.eq("listId", campaign.listId!))
        .collect();

      const contacts = await Promise.all(
        memberships.map(async (membership) => {
          const contact = await ctx.db.get(membership.contactId);
          return contact;
        }),
      );

      recipients = contacts
        .filter((contact) => contact && !contact.unsubscribed)
        .map((contact) => contact!.email);
    } else if (campaign.recipientEmails) {
      recipients = campaign.recipientEmails;
    }

    // Update status to sending
    await ctx.db.patch(args.campaignId, {
      status: "sending",
    });

    // Send emails
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        const emailId = await resend.sendEmail(ctx, {
          from: `${me.name ?? "Me"} <${me.email}>`,
          to: recipient,
          subject: campaign.subject,
          text: campaign.body,
        });

        await ctx.db.insert("emails", {
          userId,
          emailId,
          campaignId: args.campaignId,
          recipientEmail: recipient,
          subject: campaign.subject,
          status: "queued",
          createdAt: Date.now(),
        });

        sentCount++;
      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
        failedCount++;

        // For failed emails, we don't have an emailId
        // Store the failure record without emailId
        await ctx.db.insert("emails", {
          userId,
          campaignId: args.campaignId,
          recipientEmail: recipient,
          subject: campaign.subject,
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          createdAt: Date.now(),
        });
      }
    }

    // Update campaign with final counts
    await ctx.db.patch(args.campaignId, {
      status: "completed",
      sentCount,
      failedCount,
      completedAt: Date.now(),
    });

    return { sentCount, failedCount };
  },
});

export const listCampaigns = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const campaigns = await ctx.db
      .query("emailCampaigns")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return campaigns;
  },
});

export const getCampaignEmails = query({
  args: { campaignId: v.id("emailCampaigns") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== userId) {
      return [];
    }

    const emails = await ctx.db
      .query("emails")
      .withIndex("campaignId", (q) => q.eq("campaignId", args.campaignId))
      .order("desc")
      .collect();

    // Get email status from Resend
    const emailsWithStatus = await Promise.all(
      emails.map(async (email) => {
        if (email.emailId) {
          const emailData = await resend.get(ctx, email.emailId);
          return {
            ...email,
            resendStatus: emailData?.status,
            opened: emailData?.opened ?? email.opened,
            complained: emailData?.complained,
            errorMessage: emailData?.errorMessage ?? email.errorMessage,
          };
        }
        return email;
      }),
    );

    return emailsWithStatus;
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const emails = await ctx.db
      .query("emails")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const campaigns = await ctx.db
      .query("emailCampaigns")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const contacts = await ctx.db
      .query("contacts")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const lists = await ctx.db
      .query("lists")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    // Get email statuses from Resend
    const emailsWithStatus = await Promise.all(
      emails.map(async (email) => {
        if (email.emailId) {
          const emailData = await resend.get(ctx, email.emailId);
          return {
            ...email,
            resendStatus: emailData?.status,
            opened: emailData?.opened ?? email.opened,
            complained: emailData?.complained,
          };
        }
        return email;
      }),
    );

    const stats = {
      totalEmails: emails.length,
      queued: emailsWithStatus.filter((e) => e.status === "queued").length,
      sent: emailsWithStatus.filter((e) => e.status === "sent" || e.resendStatus === "sent").length,
      delivered: emailsWithStatus.filter((e) => e.status === "delivered" || e.resendStatus === "delivered").length,
      bounced: emailsWithStatus.filter((e) => e.status === "bounced" || e.resendStatus === "bounced").length,
      failed: emailsWithStatus.filter((e) => e.status === "failed").length,
      opened: emailsWithStatus.filter((e) => e.opened).length,
      complained: emailsWithStatus.filter((e) => e.complained).length,
      totalCampaigns: campaigns.length,
      totalContacts: contacts.length,
      totalLists: lists.length,
    };

    return stats;
  },
});

