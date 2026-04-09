# Blog Writer — App Spec (V1)

## 1. App Overview

### App name
Blog Writer

### App key
`blog-writer`

### Category
Writing

### Product position
A focused personal workspace for drafting, organizing, and refining blog posts before they are published anywhere else.

### V1 truth
Blog Writer V1 is a **protected, DB-backed personal blog drafting workspace**.
It helps one authenticated user:
- create blog post records
- write and refine long-form article drafts
- manage title, summary, content, category, tags, notes, and status
- favorite strong drafts
- archive older drafts without deleting them
- revisit saved writing and reuse earlier ideas

It is **not**:
- an AI blog generator
- a publishing or CMS platform
- a team editorial workflow tool
- an SEO analytics product
- a social publishing system

### Audience
- solo founders
- marketers
- creators
- indie writers
- internal users drafting blog content before publishing elsewhere

---

## 2. V1 Product Goal

Give one authenticated user a dependable place to draft, refine, store, and revisit blog posts without losing strong writing or mixing content across accounts.

The app should feel:
- calm
- structured
- writing-focused
- safe for revision
- honest about scope

---

## 3. Primary User Stories

### Core user stories
1. As a user, I can create a blog post draft.
2. As a user, I can edit an existing draft later.
3. As a user, I can keep article title, summary, body, category, tags, and notes together in one record.
4. As a user, I can mark strong drafts as favorites.
5. As a user, I can archive old drafts without deleting them.
6. As a user, I can search and filter saved drafts.
7. As a user, I can open a detail page when I need the full article content.
8. As a user, I can revisit older writing and reuse it as a starting point.

### Ownership user stories
9. As a user, I can only see my own blog post records.
10. As a user, invalid or non-owned detail URLs should fail safely.

---

## 4. Core Workflow

### V1 workflow summary
Create draft → Write and revise → Favorite or archive → Revisit

### Human explanation
- The user opens the protected workspace.
- The user creates a new blog draft with a working title.
- The user adds summary, body content, category, tags, notes, and status.
- The user saves and revisits the draft over time.
- The user favorites strong drafts for quick retrieval.
- The user archives inactive drafts without deleting them.
- The user searches and filters saved posts when reusing earlier work.

---

## 5. Functional Behavior

## 5.1 Authentication / Access

### Access model
Protected app.

### Expected behavior
- Unauthenticated `/app` should redirect to parent login.
- After login, user should return to `/app`.
- All data is owner-scoped.
- Non-owned detail routes should fail safely.

### Route expectation
- `/` = public landing page
- `/app` = authenticated workspace
- `/app/posts/[id]` = authenticated detail page

---

## 5.2 Workspace List Page (`/app`)

### Purpose
Show the user’s personal blog draft library.

### Must display
- page title / app bar
- create action
- search input
- filters
- draft list
- empty state if no records exist

### Suggested list item summary fields
Each record in the list should show enough context to decide whether to open it:
- title
- category
- tags preview if practical
- status
- favorite state
- archived state if viewing archived items
- updated date
- short summary preview if available

### Search behavior
Search should match user-owned records using key text fields such as:
- title
- summary
- content
- category
- tags
- notes

### Filters
V1 filters should stay simple and useful:
- status
- favorites
- archived / active
- category if category is retained in the workspace UI

No advanced SEO or performance filtering is needed in V1.

---

## 5.3 Create Record

### Purpose
Create a new blog post draft.

### Required fields
- title
- content

### Recommended V1 fields
- title
- slug
- category
- tags
- summary
- content
- status
- notes

### Allowed `status` values
Keep this closed and explicit in V1:
- `draft`
- `in-review`
- `ready`

### Validation rules
- title is required
- content is required
- required text fields must be trimmed
- blank title should reject
- blank content should reject
- invalid enum values should reject
- user cannot create records for another user

### Save result
On successful save:
- record persists
- record appears in workspace
- user can open detail page
- no page crash
- no duplicate phantom save

---

## 5.4 Detail Page (`/app/posts/[id]`)

### Purpose
Show the full blog post record for review and editing.

### Must display
- all stored fields for the record
- favorite control
- archive / restore control
- edit/update form
- updated timestamp if available

### Safe behavior
- non-numeric or malformed IDs should fail safely
- missing IDs should fail safely
- non-owned IDs should fail safely
- no server 500 for invalid access cases

### Safe fallback choice
Use one consistent behavior only in this repo:
- redirect back to `/app`

---

## 5.5 Update Record

### Purpose
Let the user revise an existing draft.

### Editable fields
All V1 fields should be editable:
- title
- slug
- category
- tags
- summary
- content
- status
- notes

### Validation
- title still required
- content still required
- invalid status rejects safely
- no partial corruption
- owner check required

### Save behavior
- update persists
- detail page reflects changes immediately
- workspace list reflects updated summary
- refresh keeps the saved data

---

## 5.6 Favorite Toggle

### Purpose
Mark strong drafts worth revisiting.

### Behavior
- user can favorite / unfavorite a record
- favorite state persists
- favorites filter works
- owner check required

### V1 meaning
Favorite is only a retrieval aid.
It is not ranking, scoring, or publishing priority.

---

## 5.7 Archive / Restore

### Purpose
Move older drafts out of the active set without deleting them.

### Behavior
- archive hides record from active default view
- archived records can still be found in archived view/filter
- restore returns record to active set
- owner check required

### V1 rule
Archive is soft state only.
No hard delete in V1.

---

## 5.8 Delete Behavior

### V1 decision
No hard-delete flow exposed in V1.

### Reason
This keeps drafts safer, reduces destructive mistakes, and matches the archive-first pattern used across the ecosystem.

---

## 6. Data Model (V1)

## 6.1 Main table
Recommended main table:
`BlogPosts`

### Fields
- `id`
- `userId`
- `title`
- `slug`
- `category`
- `tags`
- `summary`
- `content`
- `status`
- `notes`
- `isFavorite`
- `isArchived`
- `createdAt`
- `updatedAt`

### Notes
- `userId` is the canonical ownership field
- `slug` is a drafting aid only in V1, not a public publishing URL guarantee
- `tags` may be stored in the repo’s simplest reliable format, but behavior must remain owner-safe and searchable
- `isFavorite` default false
- `isArchived` default false
- `status` default `draft`

## 6.2 Optional future tables
Do **not** add unless later approved:
- `BlogPostVersions`
- `BlogPostComments`
- `BlogPostSeoMetrics`
- `PublishingTargets`

These are out of scope for V1.

---

## 7. Storage / Persistence

### V1 storage model
Authenticated DB-backed personal workspace.

### Persistence expectation
- drafts survive refresh
- drafts survive a new session after sign-in
- records remain owner-scoped
- favorite and archived states persist

---

## 8. UX / Interaction Guidance

### Workspace tone
- calm
- structured
- writing-focused
- no fake “AI writer” promises inside the app UI

### Create/edit UX
A drawer or detail-first form is acceptable if it follows Ansiversa standards.

### List behavior
The list should support quick recognition and retrieval, not overwhelm the user.

### Empty state message guidance
Should explain:
- this is a personal blog drafting workspace
- start by creating one draft
- no fake promise about AI generation or publishing

---

## 9. Edge Cases / Error Handling

### Must handle safely
1. Unauthenticated `/app`
2. Unauthenticated mutation attempt
3. Invalid record ID
4. Missing record ID
5. Non-owned record access
6. Blank title save attempt
7. Blank content save attempt
8. Invalid status enum value
9. Archive on already archived record
10. Restore on already active record
11. Favorite toggle on missing record

### Error behavior rules
- no 500 for normal user mistakes
- validation should surface clearly
- owner failures should not leak data
- invalid IDs should fail safely
- no silent corruption

---

## 10. API / Actions Expectations

V1 can use either:
- Astro actions
- protected API routes
- or a repo-consistent hybrid

### Rule
Use the repo’s standard pattern consistently.

### Owner protection
Every mutation and protected read must enforce:
- valid session
- owner-scoped access

### Public route rule
Landing page is public.
Workspace/data routes are protected.

---

## 11. Search / Filter Rules

### Search fields
Recommended:
- title
- summary
- content
- tags
- notes

### Filter fields
Recommended:
- status
- favorite
- archived
- category

### V1 rule
Keep filters simple.
No SEO scoring or editorial workflow filtering in V1.

---

## 12. Tester Verification Guide

## 12.1 Landing page
Verify:
- `/` loads
- copy is truthful
- CTA points correctly to protected flow
- no fake AI/CMS/SEO/collaboration claims

## 12.2 Auth behavior
Verify:
- unauthenticated `/app` redirects correctly
- after login, return path works
- protected data is not visible without auth

## 12.3 Workspace behavior
Verify:
- create draft works
- list updates correctly
- search works
- filters work
- favorite works
- archive works
- restore works

## 12.4 Detail behavior
Verify:
- detail page loads for owned record
- update persists
- invalid ID fails safely
- non-owned ID fails safely

## 12.5 Persistence
Verify:
- refresh keeps data
- favorite/archive state survives refresh
- updated fields remain saved

## 12.6 Validation
Verify:
- blank title rejected
- blank content rejected
- invalid status rejected
- no server crash on bad payload

---

## 13. Out of Scope (V1)

The following are explicitly out of scope unless later frozen into V2+:
- AI-generated blog writing
- automatic outline generation
- website publishing or CMS delivery
- SEO scoring or optimization analytics
- collaboration / comments / approvals
- team roles
- version-history engine
- social publishing
- hard delete

---

## 14. Freeze Notes

### V1 freeze statement
Blog Writer V1 is a protected, DB-backed personal drafting workspace for storing and refining blog post records.
It is intentionally narrow:
- manual drafting
- structured records
- search/filter
- favorite/archive
- detail review

### Product truth guardrail
The landing, UI, and docs must never imply:
- AI writing
- website publishing
- SEO intelligence
- team collaboration

unless those features are actually implemented later.

---

## 15. Codex Implementation Notes

### Codex must not miss these
- canonical ownership field = `userId`
- protected routes required
- title required
- content required
- status enum enforced
- favorite/archive/restore included
- no hard delete
- safe invalid-detail handling
- landing copy must stay truthful
- V1 is manual drafting + organization only

### Recommended commit scope later
- schema
- protected read/write helpers
- workspace page
- detail page
- create/update/favorite/archive/restore actions
- landing page aligned with product truth
- `AGENTS.md`

---

## 16. Final One-Line Product Definition

**Blog Writer V1 is a protected personal workspace for drafting, organizing, and revisiting blog post records — not an AI writer or publishing CMS.**
