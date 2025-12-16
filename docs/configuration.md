# Configuration Reference

All configuration is in `src/config.ts`. After changing, rebuild with `npm run build`.

---

## Branding

```typescript
brand: {
  title: 'System Status',        // Page title
  primaryColor: '#1d71b4',       // Header color (hex)
  logo: 'https://...',           // Optional: Logo URL
  footerText: 'Powered by',      // Footer text
  footerLinkText: 'statuspage',  // Footer link text
  footerLink: 'https://...',     // Footer link URL
},
```

---

## Endpoints

Add as many environments and regions as you need:

```typescript
endpoints: [
  {
    environment: 'Production',   // Group name
    region: 'US',                // Region label
    url: 'https://us.api.com',   // URL to check
    name: 'US East'              // Optional: Display name
  },
],
```

**Supported regions with flags:** US, UK, EU, Global, AP (Asia-Pacific)

Other regions will show without a flag.

---

## Mode

```typescript
mode: 'backend',  // 'direct' | 'proxy' | 'backend'
```

| Mode | How it works | Requirements |
|------|--------------|--------------|
| `direct` | Browser checks APIs directly | CORS headers on your APIs |
| `proxy` | Cloudflare Worker checks APIs | Deploy the worker first |
| `backend` | Node.js server checks APIs | Run the server (`npm start`) |

---

## Mode-specific Settings

### Direct Mode
No additional config needed.

### Proxy Mode
```typescript
mode: 'proxy',
workerUrl: 'https://your-worker.workers.dev',
```

### Backend Mode
```typescript
mode: 'backend',
backendUrl: '/api/status',  // Relative URL when same server
// or
backendUrl: 'https://status-api.example.com/api/status',  // Absolute URL
```

---

## Timing

```typescript
refreshInterval: 30000,   // How often to refresh (ms) - default 30s
requestTimeout: 10000,    // Max wait for each endpoint (ms) - default 10s
```

---

## Status Thresholds

These are hardcoded but easy to change in the health check files:

| Response Time | Status |
|--------------|--------|
| < 2000ms | `operational` |
| > 2000ms | `degraded` |
| 5xx error | `outage` |
| 4xx error | `degraded` |
| Timeout/unreachable | `outage` |

To change the 2000ms threshold, edit:
- `src/lib/healthCheck.ts` line 52
- `server/healthCheck.ts` line 31
- `worker/src/index.ts` line 51
