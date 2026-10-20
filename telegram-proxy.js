// Cloudflare Worker — keeps your Telegram bot token off the public website.
// 1) Create a Worker, paste this file.
// 2) Settings → Variables: add secrets BOT_TOKEN and CHAT_ID,
//    and (optional) ALLOWED_ORIGIN, e.g. https://goldenframe.studio
// 3) Put the Worker URL into CONFIG.endpoint in index.html.

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

    let body;
    try { body = await request.json(); } catch { return new Response("Bad request", { status: 400, headers: cors }); }
    const text = String(body.text || "").slice(0, 3500);
    if (!text) return new Response("Empty", { status: 400, headers: cors });

    const tg = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    return new Response(tg.ok ? "ok" : "error", { status: tg.ok ? 200 : 502, headers: cors });
  },
};
