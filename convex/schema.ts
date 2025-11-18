import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { vEmailId } from "@convex-dev/resend";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  emails: defineTable({
    userId: v.id("users"),
    emailId: v.optional(vEmailId), // Optional for failed emails
    campaignId: v.optional(v.id("emailCampaigns")),
    recipientEmail: v.string(),
    subject: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("sending"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("bounced"),
      v.literal("failed"),
      v.literal("complained"),
    ),
    errorMessage: v.optional(v.string()),
    opened: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("campaignId", ["campaignId"])
    .index("status", ["status"])
    .index("createdAt", ["createdAt"]),
  
  // Contacts/Users for email lists
  contacts: defineTable({
    userId: v.id("users"), // Owner/admin who created this contact
    email: v.string(),
    name: v.optional(v.string()),
    properties: v.optional(v.any()), // Custom properties as JSON
    unsubscribed: v.boolean(),
    createdAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("email", ["email"])
    .index("unsubscribed", ["unsubscribed"]),
  
  // Lists/Newsletters that contacts can belong to
  lists: defineTable({
    userId: v.id("users"), // Owner/admin
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("userId", ["userId"]),
  
  // Many-to-many relationship: contacts can belong to multiple lists
  listMemberships: defineTable({
    listId: v.id("lists"),
    contactId: v.id("contacts"),
    addedAt: v.number(),
  })
    .index("listId", ["listId"])
    .index("contactId", ["contactId"])
    .index("listId_contactId", ["listId", "contactId"]),
  
  // Email campaigns for batch sending
  emailCampaigns: defineTable({
    userId: v.id("users"),
    name: v.string(),
    subject: v.string(),
    body: v.string(),
    listId: v.optional(v.id("lists")), // If sending to a list
    recipientEmails: v.optional(v.array(v.string())), // If sending to specific emails
    status: v.union(
      v.literal("draft"),
      v.literal("queued"),
      v.literal("sending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    totalRecipients: v.number(),
    sentCount: v.number(),
    deliveredCount: v.number(),
    failedCount: v.number(),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("userId", ["userId"])
    .index("status", ["status"])
    .index("createdAt", ["createdAt"]),
});
