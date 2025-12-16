# statuspage

An ultra-lightweight status page widget. **~9KB gzipped.**

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` to see your status page.

## Configuration

Edit `src/config.ts` to add your endpoints and branding:

```typescript
endpoints: [
  { environment: 'Production', region: 'US', url: 'https://api.example.com' },
  { environment: 'Production', region: 'EU', url: 'https://eu.api.example.com' },
],

mode: 'backend', // or 'proxy' or 'direct'
```

## Deployment Modes

| Mode | Requirements | Best For |
|------|--------------|----------|
| `direct` | CORS headers on APIs | Static hosting (Vercel, Netlify) |
| `proxy` | Cloudflare Worker | Free, no CORS needed |
| `backend` | Node.js server | Self-hosted, Docker, Azure |

## Build & Deploy

```bash
npm run build
npm start        # For backend mode
```

## Embed Anywhere

```html
<script src="https://your-host.com/widget.iife.js"></script>
<status-widget></status-widget>
```

## Documentation

- [Deployment Guide](docs/deployment.md) - Step-by-step deployment instructions
- [Configuration Reference](docs/configuration.md) - All config options explained
- [Embedding Guide](docs/embedding.md) - How to embed in Freshdesk, WordPress, etc.
- [API Reference](docs/api.md) - Backend and worker API endpoints

## License

MIT
