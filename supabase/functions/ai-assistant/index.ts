// AI Repair Assistant — streams from Lovable AI Gateway with tool calling
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu RepairXpert ka expert AI Assistant hai — ek senior mobile/laptop/AC/TV/fridge technician + CRM guide.

KAAM:
- Repair queries: probable causes, required parts, estimated cost (INR), step-by-step diagnosis Hinglish me batana
- App help: jobs, customers, inventory, payments, branches, loyalty, subscription kaise use karein samjhana
- Order tracking: agar user job ID (J... format like JSAM0042K9X) ya sell ID (S...) de to lookup_tracking tool use kar
- General sawaal: shop timings, services, contact info dena
- Hamesha concise, friendly, bullet/markdown format use kar
- Public visitor (no login) ko services, booking link, /track page suggest kar
- Logged-in user ko relevant CRM page ke shortcut suggest kar

TOOLS:
- lookup_tracking(tracking_id): koi bhi job/sell ID ka public status nikaalta hai
- search_help(topic): app feature ka quick guide

Tone: professional but warm, jaise senior bhai junior ko samjhata hai. Emojis kabhi kabhi.`;

const tools = [
  {
    type: "function",
    function: {
      name: "lookup_tracking",
      description: "Look up public status of a repair job or sell using tracking ID like JSAM0042K9X or SBAT0001ABC.",
      parameters: {
        type: "object",
        properties: {
          tracking_id: { type: "string", description: "The tracking ID (job or sell)" },
        },
        required: ["tracking_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_help",
      description: "Return a short guide for an app feature/topic.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Topic like 'create job', 'add inventory', 'subscription', 'loyalty points', 'branches', 'wallet'" },
        },
        required: ["topic"],
      },
    },
  },
];

const HELP_DOCS: Record<string, string> = {
  "create job": "**New Repair Job banane ke liye:**\n1. Sidebar → Repair Jobs → 'New Job'\n2. Customer select/add karein, device + issue likhein\n3. Estimated cost + technician assign karein\n4. Save → auto Job ID milega (J<BRAND><SEQ><RAND>)\n5. Customer ko WhatsApp share button se tracking link bhejein",
  "add inventory": "**Inventory item add:**\nSidebar → Inventory → 'Add Item' → name, item_code, quantity, cost, sell price. Low stock alert auto chalu hai.",
  "subscription": "**Subscription:**\n7-day trial free. Renew karne ke liye Settings → Subscription → UPI to `patna14@ptyes` ya promo code use karein. Screenshot + UTR upload zaroori.",
  "loyalty": "**Loyalty:**\nSettings → Loyalty me points-per-rupee set karein. Har payment pe customer ko auto points milte hain. Customers page se 'Redeem' karein.",
  "branches": "**Multi-shop:**\n/branches page se naye location add karein. Har job/sell/inventory me branch tag laga sakte hain.",
  "wallet": "**Wallet & Earnings:**\n/wallet me ad watch + referral + bonus se earn karein. Withdrawal admin approve karta hai.",
  "tracking": "**Order tracking:** Customer apna Job/Sell ID `/track` page pe daal ke status dekh sakta hai. Aap WhatsApp share button se direct link bhi bhej sakte ho.",
  "booking": "**Customer booking:** Settings me shop slug set karein. Public link `/book/<slug>` customers ko share karein. Bookings → 'Convert to Job' se job ban jaata hai.",
  "expenses": "**Expense tracking:** /expenses pe daily kharcha categorywise log karein. Net Profit auto calculate hota hai.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const ctxLine = context
      ? `\n\nUSER CONTEXT: ${context.isAuthed ? "Logged-in user" : "Public visitor"} on route ${context.route || "/"}.`
      : "";

    const conversation: any[] = [
      { role: "system", content: SYSTEM_PROMPT + ctxLine },
      ...messages,
    ];

    // Tool-calling loop (max 3 hops) — non-stream until tools resolved, then stream final answer
    for (let hop = 0; hop < 3; hop++) {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: conversation,
          tools,
          tool_choice: "auto",
        }),
      });

      if (!r.ok) {
        if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Try again." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const t = await r.text();
        console.error("AI error:", r.status, t);
        return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await r.json();
      const choice = data.choices?.[0];
      const msg = choice?.message;
      const toolCalls = msg?.tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        // Final — re-stream the same prompt for nice UX
        break;
      }

      conversation.push(msg);

      for (const tc of toolCalls) {
        const name = tc.function?.name;
        let args: any = {};
        try { args = JSON.parse(tc.function?.arguments || "{}"); } catch { /* ignore */ }
        let result = "";
        try {
          if (name === "lookup_tracking") {
            const { data: rows, error } = await sb.rpc("track_order", { tracking_id_input: args.tracking_id });
            if (error) result = JSON.stringify({ error: error.message });
            else result = JSON.stringify(rows || { not_found: true });
          } else if (name === "search_help") {
            const t = (args.topic || "").toLowerCase();
            const key = Object.keys(HELP_DOCS).find((k) => t.includes(k));
            result = key ? HELP_DOCS[key] : "Topic ke liye specific guide nahi mila — general guidance dena.";
          } else {
            result = "Unknown tool";
          }
        } catch (e) {
          result = JSON.stringify({ error: String(e) });
        }
        conversation.push({ role: "tool", tool_call_id: tc.id, content: result });
      }
    }

    // Final streaming answer
    const stream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: conversation,
        stream: true,
      }),
    });

    if (!stream.ok) {
      const t = await stream.text();
      console.error("AI stream error:", stream.status, t);
      return new Response(JSON.stringify({ error: "AI stream error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(stream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
