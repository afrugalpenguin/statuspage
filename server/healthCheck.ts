import { endpoints, REQUEST_TIMEOUT_MS, type EndpointConfig } from './config';

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

// In-memory cache
let cachedStatus: StatusData | null = null;

async function checkEndpoint(config: EndpointConfig): Promise<RegionStatus> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(config.url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'CenatasureStatusChecker/1.0',
      },
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
      region: config.region,
      url: config.url,
      status,
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      region: config.region,
      url: config.url,
      status: 'outage',
      responseTime: null,
      lastChecked: new Date().toISOString(),
    };
  }
}

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

export async function performHealthChecks(): Promise<StatusData> {
  console.log(`[${new Date().toISOString()}] Running health checks...`);

  // Check all endpoints in parallel
  const results = await Promise.all(endpoints.map(checkEndpoint));

  // Group by environment
  const envMap = new Map<string, RegionStatus[]>();
  for (let i = 0; i < endpoints.length; i++) {
    const env = endpoints[i].environment;
    if (!envMap.has(env)) {
      envMap.set(env, []);
    }
    envMap.get(env)!.push(results[i]);
  }

  // Convert to array, maintaining order
  const environmentOrder = ['Production', 'Staging', 'UAT', 'Sandbox'];
  const environments: Environment[] = environmentOrder
    .filter((name) => envMap.has(name))
    .map((name) => ({
      name,
      regions: envMap.get(name)!,
    }));

  const statusData: StatusData = {
    lastUpdated: new Date().toISOString(),
    environments,
    overallStatus: determineOverallStatus(environments),
  };

  // Update cache
  cachedStatus = statusData;

  console.log(`[${new Date().toISOString()}] Health check complete. Overall: ${statusData.overallStatus}`);
  return statusData;
}

export function getCachedStatus(): StatusData | null {
  return cachedStatus;
}
