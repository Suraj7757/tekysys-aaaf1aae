
## Project Analysis (current state)

**Site ka core:** RepairXpert — ek SaaS jo 4 user-types ko jodti hai:
`Customer ↔ Shopkeeper (repair shop) ↔ Wholesaler ↔ Super-Admin (krs715665@gmail.com)`

**Kya already bana hai (working):**
- Auth (email/password + Google), 7-day trial, RBAC, account types
- Shopkeeper CRM: jobs, payments, inventory, sells, expenses, branches, settlements
- Customer dashboard: shop browse + repair/buy request submit + order tracking
- Wholesale dashboard: catalog + incoming orders
- Public booking page `/book/:slug`, public order tracking `/track`
- Reviews, i18n (EN/HI/BN), barcode scanner, WhatsApp Business config
- AI repair assistant (Lovable AI), notifications, loyalty, wallet, ads
- Super-Admin god-mode RLS + admin RPCs

---

## Issues / Breaks Identified (must-fix before new features)

### Critical — Security
1. **Wallet self-update vulnerability (ERROR level)** — `wallets` table par user khud apna `balance` update kar sakta hai. Ye paise se related table hai → exploit ka risk.
2. **Leaked password protection disabled** (warn) — HIBP enable karna hai.

### Functional gaps (likely break user flow)
3. **Customer → Wholesaler order placement** ka koi UI nahi hai. `customer_orders` table to hai but customer kahin se bhi browse/buy nahi kar sakta wholesale items.
4. **Customer dashboard "Buy Item"** request bas `booking_requests` me jaata hai — wholesaler ko nahi pahunchta.
5. **Wholesale catalog discoverability zero** — koi public marketplace page nahi.
6. **Booking → Job conversion** RPC banaa hai (`convert_booking_to_job`) but customer-buy-request alag flow chahiye.
7. **Shop discovery search/filter** customer ke liye nahi (sirf 20 shops list).
8. **Customer ke "buy request"** ka data wholesaler ko nahi milta — sab shopkeeper-side jaata hai.

---

## Plan: Fix + Marketplace Expansion (10 phases)

Aap chahein to ek-ek phase approve karein, ya saare ek saath bolein.

### Phase 0 — Critical Fixes (MUST do first)
- Wallet UPDATE policy hatake `admin_adjust_wallet` jaisi RPC route force karna
- Leaked password protection enable karna
- RLS policies ke `WITH CHECK` clauses tighten karna
- AI assistant streaming errors silent-fail handling

### Phase 1 — Marketplace Backbone (Customer ↔ Wholesaler ↔ Shopkeeper bridge)
**New tables / changes:**
- `marketplace_listings` (unified: shopkeepers + wholesalers dono products list kar sakein)
  - fields: `seller_id, seller_type (shop|wholesale), title, category, price, mrp, stock, moq, images[], description, location, active, featured, rating_avg`
- `marketplace_orders` (`customer_orders` ko extend / replace)
  - fields: `buyer_id, seller_id, items jsonb, subtotal, shipping, total, address, payment_status, fulfillment_status, tracking_id`
- `cart_items` (per-user cart, persistent)
- `wishlists`
- RPC: `place_marketplace_order()` — atomic stock decrement + order creation

**New pages:**
- `/marketplace` — public + logged-in browse with category, search, location filter
- `/marketplace/:id` — product detail, add-to-cart, buy-now
- `/cart`, `/checkout`, `/orders/:id`

### Phase 2 — Service Booking Marketplace (Repair services)
- `service_offerings` table: shopkeepers list services with fixed prices (Screen replace ₹1500, Battery ₹800…)
- `/services` public page — customer apne area me service price compare kare
- "Book Now" → existing `booking_requests` me jaata hai with `service_id`
- Auto-quote generation

### Phase 3 — Quote / RFQ System (Bulk inquiries)
- `quote_requests` — customer or shopkeeper RFQ post kare ("Need 50 iPhone 12 batteries")
- Multiple wholesalers competitive quotes submit karein
- `quote_responses` table
- Auto-notify matching wholesalers via WhatsApp/Email
- Best quote accept → `marketplace_order` ban jaata hai

### Phase 4 — Chat / Messaging
- `conversations` + `messages` tables (realtime via Supabase channels)
- Customer ↔ Shopkeeper, Customer ↔ Wholesaler, Shopkeeper ↔ Wholesaler
- Per-order thread + general inquiry thread
- File/image attachments via storage bucket

### Phase 5 — Payments & Escrow
- Razorpay/UPI deep-link integration for marketplace orders
- Manual UTR upload fallback (already exists)
- Optional escrow: payment hold till delivery confirm
- Auto-payout to seller wallet on order completion
- Platform commission (configurable, default 2%)

### Phase 6 — Logistics / Delivery
- `delivery_options` per seller: Self-pickup | Local courier | Shiprocket integration
- Pin-code serviceability check
- Tracking webhook → status updates
- Customer side delivery timeline UI

### Phase 7 — Trust & Safety
- Seller verification badges (KYC docs upload)
- `seller_verifications` table with admin approval flow
- Buyer protection policy page
- Dispute / Return request system (`disputes` table)
- Auto-refund on dispute resolution

### Phase 8 — Discovery & Marketing
- Featured listings (paid promotion → wallet debit)
- Banner ads on `/marketplace` (using existing `ads` table)
- Email/WA campaigns to past customers
- Coupon engine extend → marketplace coupons
- "Shops near me" geolocation

### Phase 9 — Analytics for all roles
- Wholesaler: top-selling SKU, revenue trend, customer cohorts
- Shopkeeper: marketplace vs walk-in revenue split
- Customer: spending insights, points balance, savings
- Super-Admin: GMV, take-rate, top sellers leaderboard

### Phase 10 — Mobile-first polish
- PWA install prompt (already), push notifications via FCM
- Bottom-nav for `/marketplace`, `/cart`, `/orders`, `/chat`, `/account`
- Offline cart cache
- Skeleton loaders + image lazy-loading

---

## Suggested Order of Execution

```text
Sprint 1 → Phase 0 (security fixes)        [1 step]
Sprint 2 → Phase 1 (marketplace + cart)    [biggest, most value]
Sprint 3 → Phase 4 (chat) + Phase 2 (services)
Sprint 4 → Phase 5 (payments) + Phase 6 (logistics)
Sprint 5 → Phase 3 (RFQ) + Phase 7 (trust)
Sprint 6 → Phase 8, 9, 10 polish
```

---

## Approval

Bataiye:
1. **Phase 0 + Phase 1 dono ek saath** start karein (recommended)?  
2. Ya sirf Phase 0 fix karein pehle, fir aap aage decide karein?  
3. Ya kisi specific phase ko priority dein?
