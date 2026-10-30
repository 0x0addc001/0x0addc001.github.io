# Portfolio Agent Worker

This Cloudflare Worker keeps the DeepSeek and email credentials off the
public GitHub Pages site.

## Setup

1. Create a Cloudflare account and install Wrangler.
2. From this directory, run:

   ```powershell
   npx wrangler secret put DEEPSEEK_API_KEY
   npx wrangler secret put RESEND_API_KEY
   npx wrangler deploy
   ```

3. Update `../chat-config.js` and set `apiBaseUrl` to the deployed Worker URL,
   for example:

   ```js
   window.PORTFOLIO_CHAT_CONFIG = {
     apiBaseUrl: "https://jialiang-portfolio-agent.example.workers.dev",
     handoffEmail: "jl.li@connect.ust.hk"
   };
   ```

4. Verify `ALLOWED_ORIGIN` in `wrangler.toml`. It must exactly match the
   published GitHub Pages origin.
5. Configure a verified sender in Resend and set `MAIL_FROM` in
   `wrangler.toml`. The default Resend onboarding sender is suitable only for
   initial testing.

## Endpoints

- `POST /chat`: calls the DeepSeek chat-completions API with the visitor's
  question, conversation history, and published page context.
- `POST /handoff`: emails the conversation transcript through Resend.

If the Worker is not configured, the page stays usable in local context mode
and the human-handoff button falls back to a prefilled `mailto:` message.
