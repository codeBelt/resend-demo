import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const createList = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    return await ctx.db.insert("lists", {
      userId,
      name: args.name,
      description: args.description,
      createdAt: Date.now(),
    });
  },
});

export const listLists = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const lists = await ctx.db
      .query("lists")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Get member counts for each list
    const listsWithCounts = await Promise.all(
      lists.map(async (list) => {
        const memberships = await ctx.db
          .query("listMemberships")
          .withIndex("listId", (q) => q.eq("listId", list._id))
          .collect();

        return {
          ...list,
          memberCount: memberships.length,
        };
      }),
    );

    return listsWithCounts;
  },
});

export const deleteList = mutation({
  args: { listId: v.id("lists") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const list = await ctx.db.get(args.listId);
    if (!list || list.userId !== userId) {
      throw new Error("List not found");
    }

    // Delete all memberships
    const memberships = await ctx.db
      .query("listMemberships")
      .withIndex("listId", (q) => q.eq("listId", args.listId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    await ctx.db.delete(args.listId);
  },
});

export const addContactToList = mutation({
  args: {
    listId: v.id("lists"),
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const list = await ctx.db.get(args.listId);
    if (!list || list.userId !== userId) {
      throw new Error("List not found");
    }

    const contact = await ctx.db.get(args.contactId);
    if (!contact || contact.userId !== userId) {
      throw new Error("Contact not found");
    }

    // Check if already in list
    const existing = await ctx.db
      .query("listMemberships")
      .withIndex("listId_contactId", (q) =>
        q.eq("listId", args.listId).eq("contactId", args.contactId),
      )
      .first();

    if (existing) {
      throw new Error("Contact already in list");
    }

    await ctx.db.insert("listMemberships", {
      listId: args.listId,
      contactId: args.contactId,
      addedAt: Date.now(),
    });
  },
});

export const removeContactFromList = mutation({
  args: {
    listId: v.id("lists"),
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const membership = await ctx.db
      .query("listMemberships")
      .withIndex("listId_contactId", (q) =>
        q.eq("listId", args.listId).eq("contactId", args.contactId),
      )
      .first();

    if (membership) {
      await ctx.db.delete(membership._id);
    }
  },
});

export const getListContacts = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const list = await ctx.db.get(args.listId);
    if (!list || list.userId !== userId) {
      return [];
    }

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

    return contacts.filter((contact) => contact !== null);
  },
});

