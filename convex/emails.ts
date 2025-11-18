import { components, internal } from "./_generated/api";
import { Resend, vEmailEvent, vEmailId } from "@convex-dev/resend";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const resend: Resend = new Resend(components.resend, {
  testMode: true,
  onEmailEvent: internal.emails.handleEmailEvent,
});

export const sendEmail = mutation({
  args: {
    to: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const me = await ctx.db.get(userId);
    if (!me) throw new Error("User not found");

    const emailId = await resend.sendEmail(ctx, {
      from: `${me.name ?? "Me"} <${me.email}>`,
      to: args.to,
      subject: args.subject,
      text: args.body,
    });
    await ctx.db.insert("emails", {
      userId,
      emailId,
      recipientEmail: args.to,
      subject: args.subject,
      status: "queued",
      createdAt: Date.now(),
    });
  },
});

export const listMyEmailsAndStatuses = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const emails = await ctx.db
      .query("emails")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    const emailAndStatuses = await Promise.all(
      emails.map(async (email) => {
        let resendStatus = email.status;
        let opened = email.opened;
        let complained = false;
        let errorMessage = email.errorMessage;

        if (email.emailId) {
          const emailData = await resend.get(ctx, email.emailId);
          const resendStatusValue = emailData?.status;
          // Map Resend statuses to our schema statuses
          if (resendStatusValue) {
            if (resendStatusValue === "sent" || resendStatusValue === "delivered" || resendStatusValue === "bounced" || resendStatusValue === "failed") {
              resendStatus = resendStatusValue;
            } else {
              resendStatus = email.status;
            }
          }
          opened = emailData?.opened ?? email.opened;
          complained = emailData?.complained ?? false;
          errorMessage = emailData?.errorMessage ?? email.errorMessage;
        }

        return {
          _id: email._id,
          emailId: email.emailId,
          campaignId: email.campaignId,
          recipientEmail: email.recipientEmail,
          subject: email.subject,
          status: email.status,
          resendStatus,
          opened,
          complained,
          errorMessage,
          sentAt: email.createdAt,
        };
      }),
    );

    return emailAndStatuses;
  },
});

export const handleEmailEvent = internalMutation({
  args: {
    id: vEmailId,
    event: vEmailEvent,
  },
  handler: async (ctx, args) => {
    console.log("Email event:", args.id, args.event);
    
    // Find email record and update status
    const email = await ctx.db
      .query("emails")
      .filter((q) => q.eq(q.field("emailId"), args.id))
      .first();

    if (email) {
      let status: "queued" | "sending" | "sent" | "delivered" | "bounced" | "failed" | "complained" = email.status;
      let opened = email.opened;

      if (args.event.type === "email.sent") {
        status = "sent";
      } else if (args.event.type === "email.delivered") {
        status = "delivered";
      } else if (args.event.type === "email.bounced") {
        status = "bounced";
      } else if (args.event.type === "email.opened") {
        opened = true;
      } else if (args.event.type === "email.complained") {
        status = "complained";
      }

      const updateData: {
        status: typeof status;
        opened?: boolean;
      } = {
        status,
      };
      
      if (opened !== undefined) {
        updateData.opened = opened;
      }
      
      await ctx.db.patch(email._id, updateData);
    }
  },
});
