# Phase 2 — Pro Features Rollout

Aapne earlier 4 features select kiye the. Ab unhe ek-ek karke clean tarah se add karenge bina kuch break kiye.

---

## 1. AI Repair Assistant (Lovable AI powered)

Existing `Chatbot.tsx` rule-based hai. Use upgrade karenge real AI me using **Lovable AI Gateway** (no API key needed — `LOVABLE_API_KEY` already configured).

**Kya milega:**
- Real conversational AI (Hinglish + English)
- Device-specific repair suggestions ("Samsung M31 charging issue" → probable causes + parts + estimate)
- Job context aware: agar user job ID daale to AI us job ka actual data fetch karke jawab dega
- Streaming responses (token-by-token, ChatGPT jaisa feel)
- Markdown rendering for formatted answers

**Technical:**
- New edge function: `supabase/functions/ai-assistant/index.ts` — streams from Lovable AI Gateway (`google/gemini-3-flash-preview` default)
- System prompt: "Tu RepairXpert ka expert technician AI hai. Mobile/laptop/AC/TV repair me madad karta hai. Hinglish me jawab de."
- Tool calling enabled: AI khud `get_job_status`, `create_job`, `check_inventory` jaise tools call kar sake
- Rewrite `src/components/common/Chatbot.tsx` to call edge function with SSE streaming
- Add `react-markdown` for response rendering
- Conversation history maintained in component state (last 10 messages sent for context)

---

## 2. Advanced Analytics Dashboard

Existing `Reports.tsx` basic hai. New analytics page banayenge with deep insights.

**Kya milega:**
- **Revenue Trends**: Daily/Weekly/Monthly line charts (last 90 days)
- **Top Devices**: Pie chart — sabse zyada repair hone wale brands/models
- **Top Issues**: Bar chart — most common problems
- **Customer Insights**: Repeat customers %, avg jobs per customer, top 10 customers by revenue
- **Technician Performance**: Jobs completed, avg turnaround time, revenue per technician
- **Inventory Movement**: Fast-moving vs dead stock, reorder alerts
- **Profit Margins**: Cost vs sell analysis per category
- **Peak Hours/Days**: Heatmap — kab sabse zyada jobs aate hain
- **Conversion Rate**: Received → Delivered ratio
- **Export**: PDF/Excel download

**Technical:**
- New page: `src/features/dashboard/Analytics.tsx` (route `/analytics`)
- Use existing `recharts` library
- Client-side aggregations on Supabase data (jobs, sells, payments)
- Date range filter (7d / 30d / 90d / custom)
- Add to sidebar under "Reports"

---

## 3. Automation & Reminders

**Kya milega:**

### A) Status-change auto WhatsApp
- Jab job status change ho (Received → Diagnosed → Ready → Delivered) → automatic WhatsApp message draft khulta hai with template
- Toggle in Settings: "Auto-notify customer on status change"

### B) Pending job reminders
- Jobs jo 3+ din se same status pe stuck hain → daily notification badge + dashboard widget "⚠️ 5 jobs need attention"

### C) Payment due reminders
- Delivered jobs jinka payment pending hai → reminder list with one-click WhatsApp follow-up

### D) Low-stock auto alerts
- Inventory item `quantity <= min_stock` → notification + dashboard banner

### E) Subscription expiry warning
- 7/3/1 din pehle dashboard banner + email-style toast on login

### F) Daily summary
- Login pe ek toast: "Aaj 5 new jobs, ₹12,500 revenue, 3 delivered ✅"

**Technical:**
- New table: `automation_settings` (per user toggles)
- New hook: `src/hooks/useAutomation.ts` — runs on dashboard mount, computes pending/overdue/low-stock
- Reuse existing `notifications` table (already exists per useSupabaseData)
- WhatsApp templates in `src/lib/whatsappTemplates.ts`
- Edge function `supabase/functions/daily-digest/index.ts` (optional cron) for digest

---

## 4. Mobile App Feel (PWA+)

PWA already configured per memory. Ab enhance karenge native-app feel ke liye.

**Kya milega:**
- **Bottom tab bar** on mobile (Dashboard / Jobs / Add / Sells / More) — sirf `< md` screens pe
- **FAB (Floating Action Button)** "+" — quick add Job/Sell/Customer from anywhere
- **Pull-to-refresh** on list pages (jobs, sells, customers)
- **Swipe gestures**: Swipe left on job card → quick actions (call, WhatsApp, edit)
- **Haptic feedback** on key actions (where supported)
- **Splash screen** improvement (branded loading)
- **Install prompt banner** — "Add RepairXpert to home screen" (smart, only show once)
- **Offline indicator** — top banner agar net na ho
- **Skeleton loaders** instead of spinners (better perceived speed)
- **Smooth page transitions** (slide animations between routes)

**Technical:**
- New component: `src/components/layout/MobileBottomNav.tsx`
- New component: `src/components/common/QuickAddFAB.tsx`
- New component: `src/components/common/InstallPWAPrompt.tsx`
- New component: `src/components/common/OfflineBanner.tsx`
- New hook: `src/hooks/usePullToRefresh.ts`
- Add `framer-motion` for transitions (already may be installed)
- Update `MainLayout.tsx` to render mobile nav + FAB conditionally
- Replace key spinners with `Skeleton` components

---

## Execution Order (safe rollout, no breakage)

```
Step 1 → AI Repair Assistant       (edge function + chatbot rewrite)
Step 2 → Mobile/PWA+ enhancements   (UI shell upgrades, low risk)
Step 3 → Advanced Analytics         (new page, isolated)
Step 4 → Automation & Reminders    (new table + hooks + settings toggles)
```

Har step ke baad preview verify karenge taaki kuch break na ho.

---

## Database Changes Required

**New table:** `automation_settings`
- `id`, `user_id`, `auto_whatsapp_status` (bool), `pending_threshold_days` (int default 3), `daily_digest_enabled` (bool), `low_stock_alerts` (bool)
- RLS: user_id = auth.uid()

No other schema changes — existing tables sufficient.

---

## New Secrets

None required. `LOVABLE_API_KEY` already set.

---

## Approval

Confirm karein "haan start karo" to main Step 1 (AI Assistant) se shuru karunga. Ya agar koi feature drop/swap karna ho to bata dein.
