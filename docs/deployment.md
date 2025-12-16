# Deployment Guide

This guide will help you deploy your status page in minutes. Choose the deployment method that works best for you.

## Prerequisites

You need [Node.js](https://nodejs.org/) installed (version 18 or higher).

To check if you have it:
```bash
node --version
```

---

## Step 1: Configure Your Endpoints

Edit `src/config.ts` to add your URLs:

```typescript
endpoints: [
  { environment: 'Production', region: 'US', url: 'https://us.myapp.com' },
  { environment: 'Production', region: 'EU', url: 'https://eu.myapp.com' },
  { environment: 'Staging', region: 'US', url: 'https://staging.myapp.com' },
],
```

Customise your branding:

```typescript
brand: {
  title: 'My App Status',
  primaryColor: '#1d71b4',  // Your brand color
  footerText: 'Powered by',
  footerLinkText: 'My Company',
  footerLink: 'https://mycompany.com',
},
```

---

## Step 2: Choose Your Deployment Mode

### Option A: Static Hosting (Easiest)

Best for: Vercel, Netlify, GitHub Pages, or any static host.

**Requirements:** Your APIs must have CORS headers allowing your status page domain.

1. Set the mode in `src/config.ts`:
   ```typescript
   mode: 'direct',
   ```

2. Build the project:
   ```bash
   npm install
   npm run build
   ```

3. Upload the `dist/` folder to your host.

**Vercel (one-click):**
```bash
npx vercel
```

**Netlify:**
- Drag and drop the `dist/` folder to [netlify.com/drop](https://app.netlify.com/drop)

**GitHub Pages:**
- Push `dist/` contents to a `gh-pages` branch

---

### Option B: Cloudflare Worker Proxy (Free, No CORS needed)

Best for: When your APIs don't have CORS headers and you want free hosting.

1. Deploy the worker:
   ```bash
   cd worker
   npm install
   npx wrangler login    # First time only
   npx wrangler deploy
   ```

2. Copy the worker URL (looks like `https://status-proxy.yourname.workers.dev`)

3. Update `src/config.ts`:
   ```typescript
   mode: 'proxy',
   workerUrl: 'https://status-proxy.yourname.workers.dev',
   ```

4. Build and deploy the frontend:
   ```bash
   cd ..
   npm run build
   ```

5. Upload `dist/` to any static host (Vercel, Netlify, etc.)

---

### Option C: Node.js Backend (Self-hosted)

Best for: When you have your own server or want everything in one place.

1. Set the mode in `src/config.ts`:
   ```typescript
   mode: 'backend',
   backendUrl: '/api/status',
   ```

2. Build and start:
   ```bash
   npm install
   npm run build
   npm start
   ```

3. Your status page is running at `http://localhost:3000`

**For production**, use a process manager:
```bash
npm install -g pm2
pm2 start npm --name "status" -- start
```

---

### Option D: Docker

1. Build the image:
   ```bash
   docker build -t statuspage .
   ```

2. Run:
   ```bash
   docker run -p 3000:3000 statuspage
   ```

---

### Option E: Azure App Service

Best for: Enterprise environments already using Azure.

**Prerequisites:**
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- An Azure account (free tier works)

**Step 1: Configure the script**

Open `azure-deploy.ps1` (Windows) or `azure-deploy.sh` (Mac/Linux) and edit the variables at the top:

```bash
RESOURCE_GROUP="my-company-status-rg"   # Azure resource group name
APP_NAME="my-company-status"             # Must be globally unique
LOCATION="uksouth"                       # Azure region (uksouth, eastus, westeurope, etc.)
SKU="B1"                                 # Pricing tier (F1=free, B1=basic, S1=standard)
```

**Step 2: Configure your endpoints**

Edit `src/config.ts` with your endpoints and set:
```typescript
mode: 'backend',
backendUrl: '/api/status',
```

**Step 3: Run the script**

**Windows (PowerShell):**
```powershell
.\azure-deploy.ps1
```

**Mac/Linux:**
```bash
chmod +x azure-deploy.sh
./azure-deploy.sh
```

The script will:
1. Log you into Azure (if needed)
2. Create a resource group
3. Create an App Service plan
4. Create a Web App with Node.js 20
5. Build the frontend
6. Deploy everything
7. Print your status page URL

**Pricing:**
- `F1` (Free): Limited, sleeps after inactivity
- `B1` (Basic): ~$13/month, always on
- `S1` (Standard): ~$70/month, autoscaling

---

## Step 3: Embed in Your Website (Optional)

Add this to any webpage:

```html
<script src="https://your-status-page.com/widget.iife.js"></script>
<status-widget></status-widget>
```

The widget is fully self-contained with its own styles (Shadow DOM).

---

## Troubleshooting

### Everything shows as "Outage"

- **Direct mode:** Your APIs need CORS headers. Try `proxy` or `backend` mode instead.
- **Proxy mode:** Check your worker URL is correct.
- **Backend mode:** Make sure the server is running (`npm start`).

### "Unable to load status"

- Check browser console for errors (F12 > Console)
- Verify your `backendUrl` or `workerUrl` is accessible

### Slow response times

- Response times are measured from the status page server/browser
- Consider deploying closer to your monitored endpoints
