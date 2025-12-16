/**
 * Status Page Configuration
 *
 * Edit this file to customize your status page.
 * Customers can easily modify endpoints, branding, and settings.
 */

export interface EndpointConfig {
  environment: string;
  region: string;
  url: string;
  name?: string; // Optional display name
}

export interface BrandConfig {
  title: string;
  logo?: string; // URL to logo image
  primaryColor: string;
  footerText: string;
  footerLinkText: string;
  footerLink: string;
}

export interface StatusConfig {
  // Branding
  brand: BrandConfig;

  // Endpoints to monitor
  endpoints: EndpointConfig[];

  // Settings
  refreshInterval: number; // milliseconds
  requestTimeout: number; // milliseconds

  // Mode:
  // - 'direct': Client-side checks (requires CORS on your APIs)
  // - 'proxy': Uses Cloudflare Worker (no CORS needed, free)
  // - 'backend': Uses Node.js backend server
  mode: 'direct' | 'proxy' | 'backend';

  // Cloudflare Worker URL (only needed if mode is 'proxy')
  workerUrl?: string;

  // Backend API URL (only needed if mode is 'backend')
  backendUrl?: string;
}

/**
 * DEFAULT CONFIGURATION
 * Customize this for your deployment
 */
export const config: StatusConfig = {
  brand: {
    title: 'System Status',
    primaryColor: '#1d71b4',
    footerText: 'Powered by',
    footerLinkText: 'statuspage',
    footerLink: 'https://statuspage.dev',
  },

  endpoints: [
    // Example endpoints - replace with your own
    { environment: 'Production', region: 'US', url: 'https://us.api.example.com' },
    { environment: 'Production', region: 'EU', url: 'https://eu.api.example.com' },
    { environment: 'Staging', region: 'US', url: 'https://staging.api.example.com' },
  ],

  refreshInterval: 30000, // 30 seconds
  requestTimeout: 10000, // 10 seconds

  // === CHOOSE YOUR MODE ===

  // Option 1: 'backend' - Node.js server does health checks (easiest, works everywhere)
  mode: 'backend',
  backendUrl: '/api/status',

  // Option 2: 'proxy' - Cloudflare Worker (free, no server needed)
  // mode: 'proxy',
  // workerUrl: 'https://status-proxy.your-account.workers.dev',

  // Option 3: 'direct' - Browser checks directly (requires CORS headers on your APIs)
  // mode: 'direct',
};
