import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const createContact = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    properties: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    // Check if contact already exists for this user
    const existing = await ctx.db
      .query("contacts")
      .withIndex("email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) {
      throw new Error("Contact already exists");
    }

    return await ctx.db.insert("contacts", {
      userId,
      email: args.email,
      name: args.name,
      properties: args.properties,
      unsubscribed: false,
      createdAt: Date.now(),
    });
  },
});

export const listContacts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const contacts = await ctx.db
      .query("contacts")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return contacts;
  },
});

export const deleteContact = mutation({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const contact = await ctx.db.get(args.contactId);
    if (!contact || contact.userId !== userId) {
      throw new Error("Contact not found");
    }

    // Delete all list memberships for this contact
    const memberships = await ctx.db
      .query("listMemberships")
      .withIndex("contactId", (q) => q.eq("contactId", args.contactId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    await ctx.db.delete(args.contactId);
  },
});

export const updateContact = mutation({
  args: {
    contactId: v.id("contacts"),
    name: v.optional(v.string()),
    properties: v.optional(v.any()),
    unsubscribed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const contact = await ctx.db.get(args.contactId);
    if (!contact || contact.userId !== userId) {
      throw new Error("Contact not found");
    }

    await ctx.db.patch(args.contactId, {
      name: args.name,
      properties: args.properties,
      unsubscribed: args.unsubscribed ?? contact.unsubscribed,
    });
  },
});

