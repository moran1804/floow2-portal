# T&Cs Administration Page

A new admin page for managing Terms & Conditions versions for the mobile app, styled to match The Floow portal screenshot (clean white surface, soft slate-blue sidebar, deep navy headings, light blue subscription panels, green "Active" pill badges).

## Layout & Style

- Sidebar matching the screenshot: The Floow-style logo, "Back to home", nav items (Overview, Audit, **Terms & Conditions** active, Products, Staff, Configuration), and the "mobileAndroid" project selector at the top.
- Top bar with user email and avatar initials.
- Page header "Terms & Conditions" with breadcrumb `Home > Admin > Terms & Conditions`.
- Same card aesthetic: white panels with the light blue header strip + calendar/document icon, navy section titles, helper text underneath.
- Status badges reused: green "Active", grey "Inactive", amber "Scheduled", blue "Draft".

## List View — "Terms & Conditions overview"

Single panel "T&Cs versions" with a table:

| Column | Notes |
|---|---|
| Version | e.g. v3.0 (navy bold link) |
| Title | Internal admin name |
| Effective date | Date shown to end users |
| Last edit | Avatar circle of editor |
| State | Badge: Active / Scheduled / Draft / Inactive |
| Action | "..." menu: View, Edit (drafts only), Duplicate, Publish now, Cancel schedule, Archive |

Rules enforced in UI + DB:
- Exactly one row can be **Active** at a time. Older published versions automatically show as **Inactive** (read-only reference, viewable).
- Top-right "+ New version" primary button opens the editor.
- Empty-state illustration when no versions exist.

## Create / Edit Wizard (single page, not multi-step)

Opens as a full page route `/admin/terms/new` or `/admin/terms/:id/edit`.

**Section 1 — Details**
- Version (text, e.g. `v2.1`) — required, must be unique
- Internal title — required
- Effective date shown to users (date picker) — required

**Section 2 — Content (WYSIWYG)**
TipTap-based rich editor supporting:
- Headings (H1/H2/H3), paragraph
- Bold, italic, underline, strikethrough
- Bullet & numbered lists
- Links (with URL dialog)
- Undo / redo, clear formatting

Toolbar styled to match the portal (light blue strip, navy icons). Editor outputs clean HTML stored in DB. A live "Preview" tab renders the HTML as it will appear in the mobile app's webview (constrained mobile-width frame).

**Section 3 — Save & Publish**
Sticky footer bar with three actions:
1. **Save as draft** — stores without changing live state.
2. **Publish immediately** — confirmation dialog, then sets this version to Active and auto-deactivates the previous Active version.
3. **Schedule publish** — opens date+time picker; on save the row state becomes **Scheduled** with the go-live timestamp shown. At go-live, the current Active is auto-deactivated and the scheduled one becomes Active.

Cancel returns to the list (with unsaved-changes guard).

## View / Reference Mode

Inactive and Active versions open in read-only view showing metadata + rendered HTML, with a "Duplicate to new draft" button so admins can base a new version on an old one.

## Scheduling Behaviour

- A scheduled publish stores `scheduled_at` on the row.
- A Postgres function + `pg_cron` job runs every minute: flips any row whose `scheduled_at <= now()` to Active and sets the previous Active row to Inactive (atomic, single-active invariant preserved).
- Only one Scheduled row allowed at a time; scheduling a second one prompts to replace.

## Technical Details

**Data model (Lovable Cloud / Supabase)**

Table `terms_versions`:
- `id uuid pk`
- `version text unique not null`
- `title text not null`
- `effective_date date not null`
- `content_html text not null default ''`
- `state text check (state in ('draft','scheduled','active','inactive')) not null default 'draft'`
- `scheduled_at timestamptz null`
- `published_at timestamptz null`
- `created_by uuid references auth.users`
- `updated_by uuid references auth.users`
- `created_at`, `updated_at` timestamps

Partial unique index ensuring at most one `active` row:
`create unique index one_active_terms on terms_versions ((state)) where state = 'active';`

**Roles**: `app_role` enum (`admin`, `user`) + `user_roles` table + `has_role()` security-definer function (per security guidelines — never store role on profile).

**RLS**:
- Public read of the single Active row (used by the mobile app).
- Full CRUD restricted to `has_role(auth.uid(), 'admin')`.

**Edge function / cron**: SQL function `activate_due_terms()` invoked by `pg_cron` every minute to promote scheduled rows.

**Frontend**:
- Routes added to `App.tsx`: `/admin/terms`, `/admin/terms/new`, `/admin/terms/:id/edit`, `/admin/terms/:id`.
- Shared `AdminLayout` component (sidebar + topbar) so other admin pages can reuse it.
- TipTap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`) for the WYSIWYG.
- Tailwind tokens extended in `index.css` to add the portal palette (navy `--portal-navy`, soft blue surface `--portal-surface`, success/warn/info pill colors) so the existing design system stays HSL-based.
- React Query for fetching/mutations; toast feedback on save/publish/schedule.
- Login/auth scaffolding so only admin users can reach the page.

## Out of Scope

- Localization of T&Cs (single-language only for now).
- User acceptance tracking (who accepted which version).
- Image upload in the editor (per your selection — text formatting only).
