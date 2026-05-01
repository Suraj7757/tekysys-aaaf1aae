import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json();
    const to = String(body.to || '').replace(/[^\d]/g, '');
    if (!to || to.length < 8) return json({ error: 'Invalid recipient' }, 400);
    const message = String(body.message || '').slice(0, 1000);
    if (!message) return json({ error: 'Empty message' }, 400);

    const { data: cfg } = await supabase.from('whatsapp_config').select('*').eq('user_id', user.id).maybeSingle();
    if (!cfg || !cfg.enabled) return json({ error: 'WhatsApp Business not configured/enabled' }, 400);
    if (!cfg.phone_number_id || !cfg.access_token) return json({ error: 'Missing phone_number_id or access_token' }, 400);

    const url = `https://graph.facebook.com/v20.0/${cfg.phone_number_id}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${cfg.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }),
    });
    const result = await res.json();
    if (!res.ok) return json({ error: result?.error?.message || 'WA API error', details: result }, 400);
    return json({ success: true, message_id: result?.messages?.[0]?.id });
  } catch (e: any) {
    return json({ error: e.message || String(e) }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
