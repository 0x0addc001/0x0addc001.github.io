const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = String(env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    Vary: "Origin"
  };
}

function jsonResponse(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(request, env)
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function handleChat(request, env) {
  if (!env.DEEPSEEK_API_KEY) {
    return jsonResponse(request, env, { error: "DeepSeek API is not configured." }, 503);
  }

  const payload = await request.json();
  const messages = Array.isArray(payload.messages) ? payload.messages.slice(-8) : [];
  const context = String(payload.context || "").slice(0, 18000);
  const language = payload.language === "zh" ? "Chinese" : "English";
  const systemPrompt = [
    `You are the portfolio assistant for Jialiang Li. Reply in ${language}.`,
    "Answer only from the supplied page context. If the answer is not supported, say so and suggest human handoff.",
    "Be concise, specific, and professional. Do not invent employers, metrics, projects, or education.",
    "When describing technical choices, explain the tradeoff briefly."
  ].join(" ");

  const response = await fetch(DEEPSEEK_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.DEEPSEEK_MODEL || "deepseek-chat",
      temperature: 0.25,
      max_tokens: 500,
      messages: [
        { role: "system", content: `${systemPrompt}\n\nPAGE CONTEXT:\n${context}` },
        ...messages.map((message) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: String(message.content || "").slice(0, 2000)
        }))
      ]
    })
  });

  if (!response.ok) {
    return jsonResponse(request, env, { error: "DeepSeek request failed." }, 502);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return jsonResponse(request, env, { error: "DeepSeek returned an empty response." }, 502);
  }
  return jsonResponse(request, env, { reply });
}

async function handleHandoff(request, env) {
  if (!env.RESEND_API_KEY || !env.OWNER_EMAIL || !env.MAIL_FROM) {
    return jsonResponse(request, env, { error: "Email handoff is not configured." }, 503);
  }

  const payload = await request.json();
  const visitorEmail = String(payload.email || "").slice(0, 160);
  const page = String(payload.page || "").slice(0, 500);
  const messages = Array.isArray(payload.messages) ? payload.messages.slice(-12) : [];
  const transcript = messages
    .map((message) => {
      const speaker = message.role === "assistant" ? "Agent" : "Visitor";
      return `<p><strong>${speaker}:</strong> ${escapeHtml(message.content || "")}</p>`;
    })
    .join("");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [env.OWNER_EMAIL],
      reply_to: visitorEmail || undefined,
      subject: `Portfolio handoff${visitorEmail ? ` from ${visitorEmail}` : ""}`,
      html: [
        "<h2>Portfolio visitor requested human handoff</h2>",
        `<p><strong>Email:</strong> ${escapeHtml(visitorEmail || "Not provided")}</p>`,
        `<p><strong>Page:</strong> ${escapeHtml(page)}</p>`,
        "<h3>Conversation</h3>",
        transcript || "<p>No conversation transcript was provided.</p>"
      ].join("")
    })
  });

  if (!response.ok) {
    return jsonResponse(request, env, { error: "Email delivery failed." }, 502);
  }
  return jsonResponse(request, env, { ok: true });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = String(env.ALLOWED_ORIGIN || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (allowedOrigins.length && !allowedOrigins.includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }
    if (request.method !== "POST") {
      return jsonResponse(request, env, { error: "Method not allowed." }, 405);
    }

    const { pathname } = new URL(request.url);
    if (pathname === "/chat") return handleChat(request, env);
    if (pathname === "/handoff") return handleHandoff(request, env);
    return jsonResponse(request, env, { error: "Not found." }, 404);
  }
};
