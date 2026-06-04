## Goal
Replace the hardcoded top-left dropdown with a real customer selector backed by a new `customers` table. All products, features, T&Cs, and FAQs become scoped per customer.

## Database changes (one migration)

1. **New `customers` table**
   - `id uuid pk`, `name text not null unique`, `code text not null unique` (e.g. `mobileAndroid`), `is_default bool`, timestamps, `created_by`, `updated_by`.
   - RLS: authenticated can read; only `admin`/`floow_staff` can write.
   - Seed two rows so the app keeps working: `mobileAndroid`, `mobileiOS`. `mobileAndroid` marked default.

2. **Add `customer_id uuid references customers(id) on delete cascade`** to:
   - `products`
   - `features`
   - `terms_versions`
   - `faqs`
   - `faq_categories`
   
   Backfill all existing rows to the default customer, then set `NOT NULL`.

3. Helper RPC `set_default_customer(_id)` (mirrors `set_default_product`).

## Frontend changes

1. **`CustomerContext`** (`src/contexts/CustomerContext.tsx`)
   - Fetches `customers` list once.
   - Tracks `selectedCustomerId` in `localStorage` (defaults to `is_default` row, falls back to first).
   - Exposes `{ customers, selectedCustomer, selectedCustomerId, setSelectedCustomerId }`.
   - Provider wraps the admin routes in `App.tsx`.

2. **`AdminLayout.tsx`**
   - Replace the hardcoded `<select>` with a `Select` bound to the context, listing customer names.

3. **Scoped pages** — add `.eq("customer_id", selectedCustomerId)` to list queries and include `customer_id: selectedCustomerId` in inserts:
   - `ProductsPage`, `ProductEditorPage`
   - `FeaturesPage`
   - `TermsListPage`, `TermsEditorPage` (product list filtered by customer; new terms versions also stamped)
   - `FaqsPage` (products, categories, faqs all filtered)
   - When `selectedCustomerId` changes, react-query refetches via key dependency.

4. **Guard:** if no customer selected yet (initial load), show a loading skeleton instead of empty queries.

## Out of scope
- Customer management UI (create/rename/delete customers). Will note this as a follow-up; for now seeded rows cover the two existing options.
- Per-customer roles. `user_roles` stays global.
