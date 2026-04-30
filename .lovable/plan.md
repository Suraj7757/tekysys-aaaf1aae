# Multi-Account Types + Super Admin God-Mode

## Goal
1. Signup pe user choose kare: **Customer / Shopkeeper / Wholesaler** (Repair shop ke alawa). Har type ka apna dashboard.
2. Super Admin (krs715665@gmail.com) ke paas **har** user, plan, promo, referral, discount, wallet, subscription pe full edit/control.

---

## Part 1 — Account Types & Dashboards

### Database changes (migration)
- Extend `app_role` enum: add `'customer'`, `'shopkeeper'`, `'wholesaler'` (keep existing `admin`, `staff`).
- Add `account_type text` column to `profiles` (values: `shopkeeper` | `wholesaler` | `customer`; default `shopkeeper` for backward compat).
- Update `handle_new_user()` trigger:
  - Read `raw_user_meta_data->>'account_type'` from signup metadata.
  - Insert correct `account_type` into profiles.
  - Assign matching role into `user_roles`.
  - Skip creating `shop_settings`/`job_counter`/`sell_counter` for `customer` accounts (not needed).
- New table `wholesale_catalog` (id, user_id, item_name, sku, bulk_price, moq, stock, category, created_at) with RLS — owner manage, public select for active items.
- New table `customer_orders` (id, customer_id auth.uid, shopkeeper_id, items jsonb, total, status, created_at) — RLS for customer + target shopkeeper.

### Auth UI (`src/features/auth/Auth.tsx`)
- Add "Account Type" tab/segment on signup form: Shopkeeper (default) | Wholesaler | Customer.
- Pass `account_type` in `signUp` metadata via `AuthContext.signUp`.

### Routing (`src/App.tsx`)
- After login, route based on `account_type`:
  - `admin` (super) → `/admin`
  - `shopkeeper` / `staff` → existing `/dashboard`
  - `wholesaler` → new `/wholesale`
  - `customer` → new `/customer`
- Add `<Route path="/wholesale">` → `WholesaleDashboard` (catalog mgmt, bulk orders).
- Add `<Route path="/customer">` → `CustomerDashboard` (browse shops, my repair orders via `/track`, my bookings).
- Update `ProtectedRoute` to check `account_type` and redirect mismatched routes.

### New pages
- `src/features/wholesale/WholesaleDashboard.tsx` — catalog CRUD, incoming orders, revenue.
- `src/features/customer/CustomerDashboard.tsx` — my bookings (`booking_requests` filtered by email), order tracking shortcut, browse shops, loyalty points across shops.

### Sidebar (`src/components/layout/Sidebar.tsx`)
- Render different nav based on `account_type` (re-use existing components).

---

## Part 2 — Super Admin God-Mode

Super admin already has `/admin`. Extend it with full control:

### Database (RLS additions via migration)
Add admin-level policies (using `has_role(auth.uid(), 'admin')`) to allow **SELECT/UPDATE/DELETE** on:
- `subscriptions` (already SELECT, add UPDATE for plan/expiry change)
- `profiles` (already covered)
- `wallets` (already covered)
- `referrals` (add UPDATE/DELETE for admin)
- `promo_codes` (already ALL)
- `loyalty_settings` (add admin override)
- `shop_settings` (add admin SELECT/UPDATE)
- `repair_jobs`, `sells`, `payments`, `inventory`, `expenses`, `branches`, `booking_requests` — add admin SELECT (read-only audit) + UPDATE/DELETE.
- `wholesale_catalog`, `customer_orders` (admin full).

### Admin RPCs (SECURITY DEFINER, admin-only)
- `admin_set_user_plan(_user_id, _plan, _expires_at)` — update profiles + subscriptions.
- `admin_set_role(_user_id, _role)` — change user_roles.
- `admin_adjust_wallet(_user_id, _delta, _note)` — credit/debit + log txn.
- `admin_apply_discount(_user_id, _percent, _reason)` — store in new `admin_discounts` table.
- `admin_force_delete_user(_user_id)` — soft-ban + cascade soft delete.

### Admin Panel UI (`src/features/admin/AdminPanel.tsx`)
Add new tabs / extend existing:
- **Users tab**: filter by `account_type` (All / Shopkeeper / Wholesaler / Customer / Staff). Per-row actions: Edit Plan, Change Role, Adjust Wallet, Apply Discount, Ban/Unban, Impersonate-view (read-only drill into their data).
- **Plans tab**: bulk update plans, set custom expiry, grant free trial extensions.
- **Promo & Discounts tab**: existing promo + new "Custom Discount per User" form.
- **Referrals tab**: approve/reject, modify reward amount, mark paid.
- **Wholesale tab**: view all catalogs, moderate listings.
- **Customer Orders tab**: view all customer→shopkeeper orders.
- **Audit tab**: read-only feed of `activity_log` across all users.

### Super-admin override everywhere
- All ProtectedRoute checks already bypass for `krs715665@gmail.com` — keep that pattern.
- Add helper `isSuperAdmin(user)` in `src/lib/utils.ts` and use uniformly.

---

## Files to Create
- `supabase/migrations/<ts>_account_types_and_admin_godmode.sql`
- `src/features/wholesale/WholesaleDashboard.tsx`
- `src/features/customer/CustomerDashboard.tsx`
- `src/features/admin/tabs/UsersAdvanced.tsx` (extracted)
- `src/features/admin/tabs/DiscountsTab.tsx`
- `src/lib/accountType.ts` (helpers)

## Files to Edit
- `src/features/auth/Auth.tsx` — account type selector
- `src/context/AuthContext.tsx` — signUp passes account_type, expose `accountType`
- `src/App.tsx` — new routes + redirect logic
- `src/components/layout/Sidebar.tsx` — role-based nav
- `src/features/admin/AdminPanel.tsx` — new tabs & controls
- `src/lib/utils.ts` — `isSuperAdmin()`

## Out of scope (will confirm before doing)
- Payment gateway for customer→shopkeeper orders (manual UPI for now).
- Wholesale → shopkeeper purchase order workflow with invoicing (basic only this phase).

Approve karein to mai migration + code dono ek saath implement kar dunga.