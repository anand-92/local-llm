# Local LLM Chat 🚀

Simple, clean chat UI for locally hosted LLMs (LM Studio compatible).  
Built with Vite + React + TypeScript.

---

## 🏃 Quick Start (Local Dev)

### 1. Start LM Studio
- Launch LM Studio and start the API server
- Default: `http://127.0.0.1:1234`
- Endpoints: `/v1/models`, `/v1/chat/completions`

### 2. Start the Web App
```bash
npm install
npm run dev -- --host
```
Open `http://localhost:5173` and you're good to go!

---

## 🌍 Expose Locally (Public Tunnel)

Need to share your local LLM with the world? Two options:

### Option 1: Cloudflare Tunnel (Recommended ⭐)

**Why?** No passwords, no captchas, just works™

#### Install cloudflared:
```powershell
winget install -e --id Cloudflare.Cloudflared
```

#### Start tunnel:
```bash
npm run tunnel
```

**Done!** The script will:
- ✅ Auto-start the tunnel
- ✅ Display your public URL (e.g., `https://xyz.trycloudflare.com`)
- ✅ Save URL to `.tunnel-url`
- ✅ No authentication needed

---

### Option 2: Localtunnel

**Note:** Requires browser verification + password on first visit

#### Start tunnel:
```bash
npm run tunnel:lt
```

The script will show:
- 🌐 Public URL (e.g., `https://xyz.loca.lt`)
- 🔑 Password (if required)

**First-time setup:**
1. Visit the URL in your browser
2. Enter the password shown in terminal
3. Click "Continue"
4. Now your API endpoints work!

---

## 📝 How It Works

- **Proxy:** Vite dev server proxies `/api` → `http://127.0.0.1:1234` (see `vite.config.ts`)
- **Models:** Dropdown pulls from `/v1/models`
- **Chat:** Streaming via `/v1/chat/completions` with `stream: true`
- **Markdown:** Full support with code blocks and syntax highlighting

---

## 🚢 Deploy to Railway (Static)

Want to deploy this as a static site? Here's how:

### 1. Create Public Tunnel
Use Cloudflare quick tunnel (or any public URL for your LM Studio):
```powershell
npm run tunnel
```
Copy your `https://*.trycloudflare.com` URL.

### 2. Deploy to Railway
- **Build command:** `npm ci && npm run build`
- **Output directory:** `dist`
- **Environment variable:** `VITE_API_BASE=https://your-tunnel-url`

Railway config (`railway.json`) is included.

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (local) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run tunnel` | Start Cloudflare tunnel (recommended) |
| `npm run tunnel:lt` | Start Localtunnel (requires verification) |

---

## 📚 Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build:** Vite 7
- **Markdown:** react-markdown + remark-gfm
- **API:** OpenAI-compatible endpoints (LM Studio)

---

## 💡 Troubleshooting

### Tunnel Issues

**Localtunnel 511 Error:**
- Visit the URL in browser first
- Enter the password shown in terminal
- Click "Continue" to verify

**Cloudflare Tunnel Not Found:**
```powershell
winget install -e --id Cloudflare.Cloudflared
```

**Tunnel keeps disconnecting:**
- Switch to Cloudflare tunnel (`npm run tunnel`)
- Keep the terminal window open while using

### LM Studio Not Responding
- Make sure LM Studio API server is running
- Check port is `1234` (or update scripts if different)
- Verify firewall isn't blocking localhost

---

## 🤝 Credits

Built with OpenAI-compatible endpoints:  
`/v1/models`, `/v1/chat/completions`

Works with LM Studio, LocalAI, and other OpenAI-compatible servers.
