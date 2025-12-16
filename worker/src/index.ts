/**
 * Cloudflare Worker - Status Check Proxy
 *
 * This worker acts as a CORS proxy for status checks.
 * Deploy to Cloudflare Workers (free tier: 100k requests/day)
 *
 * Deploy: cd worker && npx wrangler deploy
 */

interface EndpointRequest {
  url: string;
  environment: string;
  region: string;
}

interface CheckRequest {
  endpoints: EndpointRequest[];
  timeout?: number;
}

interface RegionStatus {
  region: string;
  url: string;
  status: 'operational' | 'degraded' | 'outage' | 'unknown';
  responseTime: number | null;
  lastChecked: string;
}

const DEFAULT_TIMEOUT = 10000;

async function checkEndpoint(endpoint: EndpointRequest, timeout: number): Promise<RegionStatus> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(endpoint.url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'StatusChecker/1.0',
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    let status: RegionStatus['status'];
    if (response.ok) {
      status = responseTime > 2000 ? 'degraded' : 'operational';
    } else if (response.status >= 500) {
      status = 'outage';
    } else {
      status = 'degraded';
    }

    return {
      region: endpoint.region,
      url: endpoint.url,
      status,
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      region: endpoint.region,
      url: endpoint.url,
      status: 'outage',
      responseTime: null,
      lastChecked: new Date().toISOString(),
    };
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      const body: CheckRequest = await request.json();

      if (!body.endpoints || !Array.isArray(body.endpoints)) {
        return new Response(JSON.stringify({ error: 'Invalid request: endpoints array required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const timeout = body.timeout || DEFAULT_TIMEOUT;

      // Check all endpoints in parallel
      const results = await Promise.all(
        body.endpoints.map(endpoint => checkEndpoint(endpoint, timeout))
      );

      return new Response(JSON.stringify(results), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
