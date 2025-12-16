/**
 * Client-side health checker
 * Works in two modes:
 * - Direct: Fetches endpoints directly (requires CORS)
 * - Proxy: Uses Cloudflare Worker to bypass CORS
 */

import { config, type EndpointConfig } from '../config';

export type Status = 'operational' | 'degraded' | 'outage' | 'unknown';

export interface RegionStatus {
  region: string;
  url: string;
  status: Status;
  responseTime: number | null;
  lastChecked: string;
}

export interface Environment {
  name: string;
  regions: RegionStatus[];
}

export interface StatusData {
  lastUpdated: string;
  environments: Environment[];
  overallStatus: Status;
}

/**
 * Check a single endpoint directly
 */
async function checkEndpointDirect(endpoint: EndpointConfig): Promise<RegionStatus> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.requestTimeout);

    const response = await fetch(endpoint.url, {
      method: 'HEAD', // Use HEAD to minimize data transfer
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;

    let status: Status;
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
    // CORS error or network failure
    return {
      region: endpoint.region,
      url: endpoint.url,
      status: 'outage',
      responseTime: null,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Fetch status from backend server
 */
async function fetchFromBackend(): Promise<StatusData> {
  if (!config.backendUrl) {
    throw new Error('Backend URL not configured. Set config.backendUrl for backend mode.');
  }

  const response = await fetch(config.backendUrl);
  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}`);
  }

  return await response.json();
}

/**
 * Check endpoints via Cloudflare Worker proxy
 */
async function checkEndpointsViaProxy(): Promise<RegionStatus[]> {
  if (!config.workerUrl) {
    throw new Error('Worker URL not configured. Set config.workerUrl for proxy mode.');
  }

  try {
    const response = await fetch(config.workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoints: config.endpoints.map(e => ({
          url: e.url,
          environment: e.environment,
          region: e.region,
        })),
        timeout: config.requestTimeout,
      }),
    });

    if (!response.ok) {
      throw new Error(`Proxy returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Return all as unknown if proxy fails
    return config.endpoints.map(endpoint => ({
      region: endpoint.region,
      url: endpoint.url,
      status: 'unknown' as Status,
      responseTime: null,
      lastChecked: new Date().toISOString(),
    }));
  }
}

/**
 * Group results by environment
 */
function groupByEnvironment(results: RegionStatus[]): Environment[] {
  const envMap = new Map<string, RegionStatus[]>();
  const envOrder: string[] = [];

  // Maintain order from config
  for (let i = 0; i < config.endpoints.length; i++) {
    const env = config.endpoints[i].environment;
    if (!envMap.has(env)) {
      envMap.set(env, []);
      envOrder.push(env);
    }
    envMap.get(env)!.push(results[i]);
  }

  return envOrder.map(name => ({
    name,
    regions: envMap.get(name)!,
  }));
}

/**
 * Determine overall status from all results
 */
function determineOverallStatus(environments: Environment[]): Status {
  let hasOutage = false;
  let hasDegraded = false;

  for (const env of environments) {
    for (const region of env.regions) {
      if (region.status === 'outage') hasOutage = true;
      if (region.status === 'degraded') hasDegraded = true;
    }
  }

  if (hasOutage) return 'outage';
  if (hasDegraded) return 'degraded';
  return 'operational';
}

/**
 * Perform health checks based on configured mode
 */
export async function performHealthChecks(): Promise<StatusData> {
  // Backend mode - fetch pre-computed status from server
  if (config.mode === 'backend') {
    return await fetchFromBackend();
  }

  // Client-side modes
  let results: RegionStatus[];

  if (config.mode === 'proxy') {
    results = await checkEndpointsViaProxy();
  } else {
    // Direct mode - check all endpoints in parallel
    results = await Promise.all(config.endpoints.map(checkEndpointDirect));
  }

  const environments = groupByEnvironment(results);

  return {
    lastUpdated: new Date().toISOString(),
    environments,
    overallStatus: determineOverallStatus(environments),
  };
}
