## Goal

Currently `job_id` (JOB000001) and `sell_id` (SELL000001) are **per-user counters**, so two different shops can both have `JOB000001`. The public `/track` page uses `track_order(_tracking_id)` which just matches by string — it can return the *wrong* shop's order. We will:

1. Make every tracking ID **globally unique** (no two jobs/sells across the entire platform can share an ID).
2. Encode a **short form of the job/sell details** directly into the ID so the ID itself hints at what it is (device brand for jobs, item shorthand for sells).
3. Keep IDs short, uppercase, scan-friendly, and shareable on WhatsApp.

---

## New tracking ID format

**Repair Job:**
```
J-<BRAND3>-<SEQ4>-<RAND3>
e.g.  J-SAM-0042-K9X    (Samsung, shop's 42nd job, 3 random chars)
       J-IPH-0007-2QM   (iPhone)
       J-XIA-0118-A4F   (Xiaomi)
```

**Inventory Sell:**
```
S-<ITEM3>-<SEQ4>-<RAND3>
e.g.  S-SCR-0015-7BD    (Screen sale)
       S-BAT-0009-MX2   (Battery sale)
       S-ACC-0033-PL8   (Accessory)
```

- **Prefix** (`J` / `S`) → instantly tells job vs sell
- **3-letter code** → device brand (jobs) or item category shorthand (sells), derived from first 3 letters uppercased, fallback `GEN`
- **4-digit sequence** → user's running counter (existing `job_counter` / `sell_counter`)
- **3-char random suffix** → makes it globally unique even if two shops both reach SEQ 0042 on Samsung; uses crypto-safe alphanumerics (no confusing 0/O/1/I)

Total length: 13–14 chars. Easy to type, hard to guess, self-descriptive.

---

## Database changes (one migration)

1. **Add UNIQUE indexes** on `repair_jobs.job_id` and `sells.sell_id` (global, not per-user) to *guarantee* no collisions at the DB level. If a duplicate exists in current data, migration will append a random suffix to fix it before adding the constraint.

2. **Replace `next_job_id(_user_id)`** to return new format. It will:
   - Take an extra param `_brand text` (device brand)
   - Increment user's `job_counter`
   - Build `J-<BRAND3>-<SEQ4>-<RAND3>` using `gen_random_bytes` + base32-style alphabet
   - Loop with retry if (extremely unlikely) the random suffix collides with the unique index

3. **Replace `next_sell_id(_user_id)`** the same way, taking `_item_name text`.

4. **Update `track_order(_tracking_id)`** — already matches on `job_id` / `sell_id`, no logic change needed, but it now benefits from the unique index.

5. **Old IDs keep working** — existing `JOB000001` rows are untouched; only *new* jobs/sells get the new format. Track dialog works for both.

---

## Code changes

| File | Change |
|---|---|
| `src/features/jobs/RepairCaseForm.tsx` (or wherever `next_job_id` is called) | Pass `_brand: deviceBrand` when calling the RPC |
| `src/features/inventory/Sells.tsx` | Pass `_item_name: itemName` when calling `next_sell_id` |
| `src/features/jobs/components/TrackDialog.tsx` | Update placeholder to `e.g. J-SAM-0042-K9X` |
| `src/features/jobs/TrackOrder.tsx` | Same placeholder update |
| `src/integrations/supabase/types.ts` | Auto-regenerated after migration — no manual edit |
| `src/utils/idGenerator.ts` | Delete — no longer used (server generates the ID) |

No changes needed to WhatsApp templates, invoices, or PaymentLinkModal — they already read `job_id` / `sell_id` as opaque strings.

---

## Why this is safe

- **Backward compatible**: old IDs (`JOB000001`, `SELL000001`) keep working in tracking, invoices, WhatsApp messages, payment links.
- **Globally unique**: enforced by DB unique index + random suffix → even across 1000s of shops, collision probability per generation is ~1 in 32,768; retry loop handles the edge case.
- **No data loss**: we only ADD the unique constraint; if existing duplicates are found, we patch them with a random suffix in the same migration.
- **Self-describing**: support staff can glance at `J-IPH-0042-K9X` and know it's an iPhone repair job without opening the record.

---

## Execution order

1. Run migration (adds unique indexes, rewrites `next_job_id` / `next_sell_id`).
2. Update `RepairCaseForm.tsx` and `Sells.tsx` to pass brand/item to the RPC.
3. Update tracking placeholders.
4. Verify by creating one new job and one new sell — confirm new format appears and old IDs still track correctly.

Ready to implement on approval.