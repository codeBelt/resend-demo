# Multi-Tenant Notification SaaS Application - Planning Document

## Overview
Building a multi-tenant notification SaaS application to compete with Courier. This document tracks requirements, features, UX decisions, and architecture planning.

## Competitive Analysis: Courier
Courier provides:
- Unified sending layer across email, SMS, push, chat, and in-app channels
- In-app notification center (Courier Inbox)
- Visual design studio and embeddable designer (Courier Create)
- Automation platform with event/time-based triggers
- Managed user preferences system
- Multi-provider support (SendGrid, Mailgun, AWS SES, Resend, Twilio, etc.)

## Requirements & Decisions

### Target Market & Positioning
- ✅ **Primary Customer**: Startups adding notification functionality to their SaaS applications
- ✅ **Value Proposition**: Better UX and developer experience compared to Courier
- ⏸️ **Pricing Model**: To be determined later (focus on building first)

### Core Features & Channels
- ✅ **MVP Channels**: Email, In-App, Slack, Teams integrations
- ❌ **Not in MVP**: SMS, Push notifications
- ✅ **Provider Strategy**: One provider per channel initially
  - Email: Resend
  - In-App: Custom implementation
  - Slack: Slack API
  - Teams: Microsoft Teams API

### Multi-Tenancy Model
- ✅ **Tenant Isolation**: Data isolation based on user authentication
- ✅ **User-Organization Model**: Users can belong to multiple organizations (tenants)
- ✅ **White-Labeling**: Full white-labeling required
  - End users will not know they're using this application
  - Custom email addresses (from addresses)
  - In-app notifications have no branding
  - Complete white-label experience

### User Experience & Interface
- ✅ **Primary Users**: Developers (junior developer friendly)
- ✅ **UI Complexity**: Easy for junior developers to use
- ✅ **Onboarding Flow**: User creates account → can invite team members
- ✅ **Single View**: One unified view for all users (developers and marketers)

### Template & Design System
- ✅ **Template System**: Visual designer + SDKs
- ✅ **Template Approach**: Visual designer from day one
- ⏸️ **Template Versioning**: To be determined
- ⏸️ **Template Marketplace**: To be determined

### Automation & Workflows
- ✅ **Automation Capabilities**: Both event-driven and scheduled (powered by Convex)
- ✅ **Workflow Builder**: Visual workflow builder + API from MVP
- ✅ **Backend**: Convex for real-time capabilities and scheduled functions

### User Preferences & Compliance
- ✅ **Reference**: Learn from [Resend's Audience system](https://resend.com/docs/dashboard/audiences/introduction) for contacts, segments, topics, and subscription management
- [ ] How will you handle user preferences and opt-outs?
- [ ] What compliance requirements? (GDPR, CAN-SPAM, TCPA?)
- [ ] Do you need a hosted preferences center?

### Analytics & Observability
- [ ] What metrics are most important? (Delivery rates, open rates, click rates, cost per message?)
- [ ] Real-time vs. batch analytics?
- [ ] How will tenants access their analytics?

### Integration & Developer Experience
- [ ] What SDKs/libraries are priorities? (JavaScript, Python, Ruby, Go?)
- [ ] Webhook system requirements?
- [ ] API versioning strategy?
- [ ] Documentation and developer portal needs?

### Scalability & Infrastructure
- [ ] Expected scale? (Messages per day/month, number of tenants?)
- [ ] Geographic requirements? (Multi-region from start?)
- [ ] SLA requirements?

## Tech Stack

### Frontend
- **Framework**: Next.js (React/TypeScript)
- **Developer**: React/TypeScript developer

### Backend
- **Platform**: Convex
  - Real-time capabilities
  - Scheduled functions (for scheduled automations)
  - Event-driven automations
  - Database and API

### Email Provider
- **Provider**: Resend

### Channels & Integrations
- **Email**: Resend API
- **In-App**: Custom implementation (likely React components)
- **Slack**: Slack Web API
- **Microsoft Teams**: Microsoft Teams API

## Feature Prioritization

### MVP (Must Have)
- [x] Multi-tenant isolation (data isolation)
- [x] Basic sending (Email, In-App, Slack, Teams)
- [x] Visual template designer
- [x] Template management
- [x] API for sending notifications
- [x] SDKs for developers
- [x] Visual workflow builder
- [x] Event-driven automations
- [x] Scheduled automations (via Convex)
- [x] Basic analytics/delivery logs
- [x] Tenant dashboard
- [x] User authentication & organization management
- [x] Team member invitations
- [x] White-labeling (email from addresses, no branding in in-app)
- [x] Contact management (contacts, properties, segments, topics)
- [x] Subscription/unsubscription handling
- [x] Hosted preference center (white-labeled)

### Phase 2 (Post-MVP)
- [ ] Template versioning
- [ ] Advanced analytics (engagement metrics, cost analysis, open rates, click rates)
- [ ] Webhooks for delivery events
- [ ] Enhanced compliance features (GDPR, CAN-SPAM automation)
- [ ] API rate limiting per tenant
- [ ] Template sharing/marketplace
- [ ] Advanced segment filtering (dynamic segments based on properties/behavior)
- [ ] Contact import/export enhancements (CSV, API bulk operations)

### Phase 3 (Future)
- [ ] Additional channels (SMS, Push)
- [ ] Multi-provider support per channel
- [ ] Advanced workflow features
- [ ] A/B testing for notifications
- [ ] Advanced white-labeling (custom domains)

## Core Features - Detailed Breakdown

### 1. Multi-Tenancy & Authentication
**Requirements:**
- Data isolation per organization (tenant)
- Users can belong to multiple organizations
- Authentication determines which organizations a user can access
- Team member invitation system

**Implementation Considerations:**
- Convex auth integration (likely with Clerk, Auth0, or Convex Auth)
- Organization membership table linking users to organizations
- Row-level security in Convex queries based on organization membership
- Organization context switching UI (if user belongs to multiple orgs)

### 2. Visual Template Designer
**Requirements:**
- Visual drag-and-drop template builder
- Support for Email, In-App, Slack, Teams templates
- Variable/placeholder system for dynamic content
- Preview functionality
- Template versioning (future)

**Key Features:**
- Channel-specific template editors
- Component library (buttons, text, images, etc.)
- Variable insertion UI (e.g., `{{user.name}}`, `{{event.type}}`)
- Live preview with sample data
- Template testing/sending capability
- Template duplication/cloning

### 3. Notification Sending
**Requirements:**
- API endpoint for sending notifications
- Support for Email, In-App, Slack, Teams
- Template-based sending
- Direct sending (without templates)
- Batch sending capability

**API Design Considerations:**
- RESTful API or GraphQL?
- Single endpoint for all channels or channel-specific?
- Request format: `POST /api/send` with channel selection
- Response: Delivery status, message ID, tracking info

### 4. SDKs
**Requirements:**
- JavaScript/TypeScript SDK (primary)
- Easy integration for junior developers
- Type-safe API calls
- Good documentation and examples

**SDK Features:**
- Simple API: `client.send({ channel: 'email', template: 'welcome', to: 'user@example.com', data: {...} })`
- TypeScript types for all templates and variables
- Error handling and retries
- Webhook support (future)

### 5. Visual Workflow Builder
**Requirements:**
- Visual drag-and-drop workflow builder
- Event-driven triggers
- Scheduled triggers
- Conditional logic
- Multi-step workflows
- API access for programmatic workflow creation

**Workflow Components:**
- **Triggers**: 
  - Event trigger (e.g., "user.created", "payment.received")
  - Scheduled trigger (e.g., "every day at 9am", "every Monday")
- **Actions**:
  - Send notification (email, in-app, Slack, Teams)
  - Wait/delay
  - Conditional branching (if/then)
  - Set variables
- **Visual Representation**: Node-based editor (like Zapier, n8n)

### 6. In-App Notification Center
**Requirements:**
- Fully white-labeled (no branding)
- Embeddable React component
- Real-time updates (via Convex)
- Notification history
- Read/unread status
- Mark as read/archive functionality

**Implementation:**
- React component library
- Convex real-time subscriptions for live updates
- Styling customization via CSS variables or theme props
- Mobile-responsive design

### 7. Analytics & Delivery Logs
**Requirements:**
- Delivery status tracking
- Basic metrics (sent, delivered, failed)
- Real-time or near-real-time updates
- Per-organization analytics

**MVP Metrics:**
- Messages sent (total, by channel, by day)
- Delivery status (sent, delivered, failed, pending)
- Failure reasons
- Channel performance comparison

### 8. White-Labeling
**Requirements:**
- Custom email from addresses (per organization)
- No branding in in-app notifications
- Custom domain support (future)

**Implementation:**
- Organization settings for email configuration
- Domain verification for custom email addresses
- Email authentication (SPF, DKIM, DMARC) setup guidance

### 9. Contacts & Subscription Management
**Reference**: Inspired by [Resend's Audience system](https://resend.com/docs/dashboard/audiences/introduction)

**Requirements:**
- Contact management (email addresses and properties)
- Segments/Lists for grouping contacts
- Topics for user-facing preference management
- Subscription/unsubscription handling
- Compliance with email regulations (CAN-SPAM, GDPR)

**Key Concepts (from Resend):**

**Contacts:**
- Global entities linked to a specific email address
- Each contact:
  - Associated with a single email address
  - Can have custom properties (e.g., `first_name`, `last_name`, custom fields)
  - Can be in zero, one, or multiple Segments
  - Can be opted in/out of Topics
  - Shows history of all marketing interactions

**Properties:**
- Default properties: `first_name`, `last_name`, `unsubscribed`, `email`
- Custom properties for storing additional contact information
- Used to personalize notifications across all Segments

**Segments:**
- Groups of Contacts for an organization
- Used to send notifications to specific groups
- A contact can belong to multiple segments
- Scoped to organization (multi-tenant)

**Topics:**
- User-facing tools for managing email preferences
- Allow users to control what types of notifications they receive
- When sending notifications, can scope to a particular Topic
- Enables granular preference management
- Customizable unsubscribe page with organization branding

**Implementation Considerations:**
- Store contacts per organization (multi-tenant isolation)
- Contact properties schema per organization (flexible custom fields)
- Segment management UI (create, edit, delete segments)
- Topic management (create topics, assign to notifications)
- Unsubscribe handling:
  - Automatic unsubscribe links in emails
  - Hosted unsubscribe page (white-labeled)
  - API endpoints for programmatic unsubscribe
- Preference center (hosted or embeddable):
  - Users can manage their Topics/subscriptions
  - View notification history
  - Update contact properties
- Integration with sending:
  - Check unsubscribe status before sending
  - Respect Topic preferences
  - Filter by Segments when sending

**Database Schema (Convex):**
- `contacts` - Contact records (email, properties, organizationId)
- `contactProperties` - Custom property definitions per organization
- `segments` - Segment definitions (organizationId, name, description)
- `segmentMemberships` - Many-to-many: contacts ↔ segments
- `topics` - Topic definitions (organizationId, name, description)
- `topicSubscriptions` - Many-to-many: contacts ↔ topics (with opt-in/opt-out status)
- `contactHistory` - Interaction history per contact

**API Design:**
```typescript
// Add contact
POST /api/contacts
{
  email: string,
  properties?: Record<string, any>,
  segments?: string[],
  topics?: string[]
}

// Manage subscriptions
POST /api/contacts/:contactId/subscribe
POST /api/contacts/:contactId/unsubscribe
POST /api/contacts/:contactId/topics/:topicId/subscribe

// Create segment
POST /api/segments
{
  name: string,
  description?: string,
  contactIds?: string[]
}

// Send to segment
POST /api/send
{
  channel: 'email',
  segment: 'segment-id',
  template: 'template-id',
  data: {...}
}
```

**SDK Integration:**
```typescript
// Add contact with properties
await client.contacts.create({
  email: 'user@example.com',
  properties: {
    firstName: 'John',
    lastName: 'Doe',
    company: 'Acme Corp'
  },
  segments: ['customers', 'premium'],
  topics: ['product-updates', 'marketing']
});

// Send to segment
await client.send({
  channel: 'email',
  segment: 'customers',
  template: 'newsletter',
  data: {...}
});

// Send to topic
await client.send({
  channel: 'email',
  topic: 'product-updates',
  template: 'feature-launch',
  data: {...}
});
```

## Application Organization & Layout

### Navigation Structure (Suggested)

**Top-Level Navigation:**
1. **Dashboard** - Overview, metrics, recent activity
2. **Templates** - Template management and designer
3. **Send** - Quick send, bulk send, send history
4. **Automations** - Workflow builder and management
5. **Contacts** - Contact management, segments, topics, subscriptions
6. **Channels** - Channel configuration (Slack, Teams, Email settings)
7. **Analytics** - Metrics, delivery logs, performance
8. **Settings** - Organization settings, team members, API keys

### Dashboard Page
**Purpose**: Quick overview and entry point

**Components:**
- Key metrics cards (messages sent today/week, delivery rate, active automations)
- Recent activity feed (last 10 notifications sent)
- Quick actions (Send test notification, Create template, Create automation)
- Channel status indicators (health of integrations)

### Templates Page
**Purpose**: Manage and create notification templates

**Layout:**
- Left sidebar: Template list with search/filter
- Main area: Template editor (visual designer)
- Right sidebar: Template properties, variables, preview
- Top bar: Save, Test, Publish actions

**Template List View:**
- Grid or list view of templates
- Filter by channel (Email, In-App, Slack, Teams)
- Search functionality
- Create new template button
- Template actions (edit, duplicate, delete)

**Template Editor:**
- Visual drag-and-drop builder
- Component palette (text, button, image, divider, etc.)
- Variable insertion panel
- Preview panel (with sample data)
- Properties panel (styling, settings)

### Send Page
**Purpose**: Send notifications manually

**Tabs/Sections:**
1. **Quick Send** - Single notification form
   - Channel selector
   - Template selector (or compose directly)
   - Recipient input
   - Variable data input
   - Send button
2. **Bulk Send** - CSV upload for batch sending
3. **Send History** - Logs of all sent notifications
   - Filterable table
   - Status indicators
   - Retry failed sends

### Automations Page
**Purpose**: Create and manage automated workflows

**Layout:**
- Left sidebar: List of automations (active, paused, draft)
- Main area: Visual workflow builder
- Right sidebar: Automation settings, trigger configuration

**Workflow Builder:**
- Canvas with drag-and-drop nodes
- Node types: Trigger, Action, Condition, Delay
- Connection lines between nodes
- Node configuration panels
- Test/Preview mode
- Save/Publish controls

### Contacts Page
**Purpose**: Manage contacts, segments, topics, and subscriptions

**Reference**: Inspired by [Resend's Audience system](https://resend.com/docs/dashboard/audiences/introduction)

**Layout:**
- Top tabs: Contacts | Segments | Topics | Properties
- Main area: List/table view with search and filters
- Right sidebar: Details panel (when item selected)

**Contacts Tab:**
- Table view: Email, Properties, Segments, Topics, Status, Last Contacted
- Search and filter by segments, topics, properties
- Bulk actions (add to segment, unsubscribe, delete)
- Import contacts (CSV upload)
- Export contacts
- Individual contact view:
  - Contact details and properties
  - Segment memberships
  - Topic subscriptions
  - Notification history
  - Unsubscribe status

**Segments Tab:**
- List of segments with contact counts
- Create new segment button
- Segment actions (edit, delete, send to segment)
- Segment details:
  - Name and description
  - Contact list
  - Add/remove contacts
  - Create segment from filters

**Topics Tab:**
- List of topics with subscription counts
- Create new topic button
- Topic actions (edit, delete)
- Topic details:
  - Name and description
  - Subscribed contacts
  - Usage in notifications/automations

**Properties Tab:**
- List of custom properties
- Create new property (name, type, default value)
- Property actions (edit, delete)
- Default properties shown (read-only): first_name, last_name, email, unsubscribed

**Preference Center (Hosted/Embeddable):**
- White-labeled page for end-users
- Manage Topics/subscriptions
- Update contact properties
- View notification history
- Unsubscribe from all or specific Topics
- Customizable branding per organization

### Channels Page
**Purpose**: Configure channel integrations

**Layout:**
- Cards for each channel (Email, In-App, Slack, Teams)
- Status indicator (connected/disconnected)
- Configuration forms for each channel
- Test connection buttons

**Email Configuration:**
- Resend API key input
- From address configuration
- Domain verification status

**Slack/Teams Configuration:**
- OAuth connection flow
- Workspace/Team selection
- Channel selection
- Test message button

### Analytics Page
**Purpose**: View metrics and delivery logs

**Sections:**
- Overview metrics (cards with key stats)
- Charts (messages over time, channel breakdown, delivery rates)
- Delivery logs table (filterable, searchable)
- Export functionality

### Settings Page
**Purpose**: Organization and account management

**Tabs:**
1. **Organization** - Name, branding, white-label settings
2. **Team** - Team members, invitations, roles
3. **API Keys** - Generate/manage API keys
4. **Webhooks** - Configure webhook endpoints (future)
5. **Billing** - Usage, plans (future)

## UX Principles & Guidelines

### Developer-Friendly Design
- **Clear API Documentation**: Inline code examples, copy-paste ready
- **SDK-First Approach**: UI should complement SDK usage, not replace it
- **Code Snippets**: Show code examples for every action (e.g., "Here's how to send this via API")
- **Testing Tools**: Built-in testing for templates, automations, API calls

### Junior Developer Friendly
- **Progressive Disclosure**: Start simple, reveal advanced features gradually
- **Contextual Help**: Tooltips, inline explanations, "What is this?" links
- **Guided Onboarding**: Step-by-step setup wizard
- **Clear Labels**: Avoid jargon, use plain language
- **Visual Feedback**: Loading states, success/error messages, status indicators

### Single Unified View
- **Consistent Navigation**: Same navigation for all users
- **Role-Based Content**: Show/hide features based on permissions (but same UI structure)
- **Context Switching**: Easy switching between organizations (if user belongs to multiple)

### White-Label Considerations
- **No Branding**: Remove all references to your product name in customer-facing UI
- **Customizable**: Allow organizations to customize colors, logos (future)
- **Embeddable Components**: In-app notification center should be easily embeddable

## Key Questions Still to Answer

### User Preferences & Compliance
- ✅ **Hosted Preference Center**: Will be provided (white-labeled)
- ✅ **Opt-Out Handling**: Automatic unsubscribe links, preference center, API endpoints
- ✅ **Topics System**: User-facing preference management (inspired by Resend)
- [ ] What compliance requirements are most critical? (GDPR, CAN-SPAM, TCPA)
- [ ] Do you need automated compliance features (e.g., automatic GDPR data deletion)?

### Analytics & Observability
- [ ] What metrics are most critical for MVP?
- [ ] Real-time vs. batch analytics?
- [ ] Do you need webhooks for delivery events in MVP?

### Integration & Developer Experience
- [ ] What programming languages/frameworks should SDKs support? (Start with JS/TS?)
- [ ] API versioning strategy?
- [ ] Rate limiting per tenant?
- [ ] Documentation site structure?

### Scalability & Infrastructure
- [ ] Expected scale? (Messages per day/month, number of tenants?)
- [ ] Geographic requirements?
- [ ] SLA requirements?

## Implementation Considerations

### Convex-Specific Architecture

**Database Schema (High-Level):**
- `organizations` - Tenant data
- `users` - User accounts
- `organizationMemberships` - Many-to-many relationship
- `templates` - Notification templates (scoped to organization)
- `notifications` - Sent notifications (scoped to organization)
- `automations` - Workflow definitions (scoped to organization)
- `automationRuns` - Execution logs for automations
- `contacts` - Contact records (email, properties, scoped to organization)
- `contactProperties` - Custom property definitions per organization
- `segments` - Segment definitions (scoped to organization)
- `segmentMemberships` - Many-to-many: contacts ↔ segments
- `topics` - Topic definitions (scoped to organization)
- `topicSubscriptions` - Many-to-many: contacts ↔ topics (with opt-in/opt-out status)
- `contactHistory` - Interaction history per contact

**Convex Functions:**
- **Queries**: Real-time data fetching (templates, notifications, analytics, contacts, segments, topics)
- **Mutations**: Creating/updating templates, sending notifications, managing automations, managing contacts/segments/topics
- **Actions**: External API calls (Resend, Slack, Teams)
- **Scheduled Functions**: Cron jobs for scheduled automations
- **HTTP Actions**: API endpoints for SDK/webhook calls, preference center, unsubscribe handling

**Multi-Tenancy Pattern:**
- All queries/mutations should filter by `organizationId`
- Use Convex auth to get current user's organizations
- Row-level security via query filters

### Next.js Frontend Structure

**Recommended App Structure:**
```
app/
  (auth)/
    login/
    signup/
  (dashboard)/
    dashboard/
    templates/
    send/
    automations/
    channels/
    analytics/
    settings/
  api/          # API routes for SDK/webhooks
    send/
    webhooks/
components/
  templates/
    TemplateDesigner/
    TemplateList/
  automations/
    WorkflowBuilder/
    AutomationList/
  notifications/
    InAppNotificationCenter/  # Embeddable component
lib/
  sdk/          # SDK code (can be shared with npm package)
  convex/       # Convex client setup
```

**State Management:**
- Convex React hooks for real-time data
- React Context for organization selection (if multi-org)
- Local state for UI (forms, modals)

### Visual Template Designer - Technical Approach

**Recommended Libraries:**
- **React Flow** or **React DnD** - For drag-and-drop functionality
- **Slate** or **TipTap** - Rich text editing (if needed)
- **React Email** - Email template rendering/preview
- **Tailwind CSS** - Styling (common with Next.js)

**Template Storage:**
- Store template structure as JSON in Convex
- Render preview using React components
- Convert to channel-specific format when sending:
  - Email: HTML/CSS (via React Email)
  - In-App: React component
  - Slack: Block Kit JSON
  - Teams: Adaptive Cards JSON

**Variable System:**
- Define variable schema per template
- Use Handlebars/Mustache syntax: `{{user.name}}`
- Validate variables before sending
- TypeScript types generated from template schemas

### Visual Workflow Builder - Technical Approach

**Recommended Libraries:**
- **React Flow** - Node-based editor (perfect for workflows)
- **Zod** - Schema validation for workflow definitions
- **Convex Cron** - Scheduled function triggers

**Workflow Storage:**
- Store workflow definition as JSON in Convex
- Include: triggers, actions, conditions, connections
- Version workflow definitions for rollback

**Workflow Execution:**
- Event-driven: Listen for events via Convex mutations
- Scheduled: Use Convex cron functions
- Execute workflow steps sequentially or in parallel
- Log each step execution for debugging

**Example Workflow Structure:**
```typescript
{
  id: string,
  organizationId: string,
  name: string,
  trigger: {
    type: 'event' | 'schedule',
    config: {...}
  },
  steps: [
    {
      id: string,
      type: 'send' | 'condition' | 'delay',
      config: {...},
      next: string[] // IDs of next steps
    }
  ]
}
```

### SDK Design

**Package Structure:**
```
@yourcompany/notifications-sdk/
  src/
    client.ts          # Main client class
    types.ts           # TypeScript types
    templates.ts       # Template types (generated)
    errors.ts          # Error classes
  dist/                # Built files
```

**Client API Example:**
```typescript
import { NotificationClient } from '@yourcompany/notifications-sdk';

const client = new NotificationClient({
  apiKey: 'your-api-key',
  organizationId: 'org-123'
});

// Send notification
await client.send({
  channel: 'email',
  template: 'welcome-email',
  to: 'user@example.com',
  data: {
    userName: 'John',
    activationLink: 'https://...'
  }
});

// Create automation programmatically
await client.automations.create({
  name: 'Welcome Flow',
  trigger: {
    type: 'event',
    event: 'user.created'
  },
  steps: [...]
});
```

**Type Generation:**
- Generate TypeScript types from template schemas
- Provide autocomplete for template names and variables
- Validate at compile time

### In-App Notification Center

**Component API:**
```typescript
import { NotificationCenter } from '@yourcompany/notifications-sdk/react';

<NotificationCenter
  apiKey="..."
  userId="user-123"
  theme={{
    primaryColor: '#your-brand-color',
    // ... other theme options
  }}
  onNotificationClick={(notification) => {
    // Handle click
  }}
/>
```

**Features:**
- Real-time updates via Convex subscriptions
- Unread count badge
- Mark as read/archive
- Filter by type/category
- Infinite scroll for history

**Styling:**
- CSS variables for theming
- No default branding
- Fully customizable via props

## Competitive Advantages to Emphasize

### Better UX
- **Simpler Onboarding**: Guided setup wizard
- **Faster Template Creation**: Intuitive visual designer
- **Better Documentation**: Inline help, code examples everywhere
- **Cleaner Interface**: Less clutter, more focus

### Better Developer Experience
- **Type-Safe SDK**: Full TypeScript support with autocomplete
- **Better Error Messages**: Clear, actionable error messages
- **Faster Integration**: Copy-paste code examples
- **Real-Time Feedback**: See changes immediately

### Technical Advantages
- **Convex Real-Time**: Instant updates without polling
- **Modern Stack**: Next.js + Convex = fast development
- **Type Safety**: End-to-end TypeScript
- **Developer-Friendly**: Built by developers, for developers

## Notes & Decisions
- **2024-XX-XX**: Initial planning session completed
- Focus on building MVP first, pricing later
- Developer-first approach with junior developer friendly UX
- Full white-labeling required from day one
- Visual designer + SDKs approach (not code-only)
- Tech stack: Next.js (React/TypeScript) + Convex + Resend
- MVP channels: Email, In-App, Slack, Teams
- Visual workflow builder + API from MVP

