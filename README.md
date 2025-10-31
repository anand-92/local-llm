# Local LLM Chat (Vite + React + TypeScript)

Simple chat UI for a locally hosted LLM (LM Studio compatible).

## Dev Setup

1. Start LM Studio API server:
   - Base URL: `http://127.0.0.1:1234`
   - Endpoints used: `/v1/models`, `/v1/chat/completions` (streaming)

2. Start the web app:
```bash
npm install
npm run dev -- --host
```
Open `http://localhost:5173`.

## Notes
- Vite dev server proxies `/api` to `http://127.0.0.1:1234` (see `vite.config.ts`).
- Model dropdown pulls from `/v1/models`.
- Chat uses streaming tokens from `/v1/chat/completions` with `stream: true`.

## Credits / References
- LM Studio compatible OpenAI-style endpoints: `/v1/models`, `/v1/chat/completions`.

## Railway Deploy (Static)

1) Create a public URL for your local LM Studio (Quick Tunnel)

Use Cloudflare quick tunnel (no account required):

```powershell
cloudflared tunnel --url http://127.0.0.1:1234
```
Grab the `https://*.trycloudflare.com` URL from the output.

2) Deploy to Railway as a Static service

- Repo: `anand-92/local-llm` (this folder: `web-chat`)
- Railway settings:
  - Base directory: `web-chat`
  - Build command: `npm ci && npm run build`
  - Output directory: `dist`
  - Env var: `VITE_API_BASE=https://<your-trycloudflare-url>`

`railway.json` is included for static config.
