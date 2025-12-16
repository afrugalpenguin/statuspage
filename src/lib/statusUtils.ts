/**
 * Pure utility functions for status determination
 * Extracted for testability
 */

import type { Status, RegionStatus, Environment } from './healthCheck';

/**
 * Determine status based on HTTP response code and response time
 */
export function determineStatusFromResponse(
  responseOk: boolean,
  statusCode: number,
  responseTime: number,
  slowThreshold: number = 2000
): Status {
  if (responseOk) {
    return responseTime > slowThreshold ? 'degraded' : 'operational';
  }
  if (statusCode >= 500) {
    return 'outage';
  }
  return 'degraded';
}

/**
 * Determine overall status from all environments
 */
export function determineOverallStatus(environments: Environment[]): Status {
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
 * Group region statuses by environment name
 */
export function groupByEnvironment(
  results: RegionStatus[],
  endpoints: { environment: string }[]
): Environment[] {
  const envMap = new Map<string, RegionStatus[]>();
  const envOrder: string[] = [];

  for (let i = 0; i < endpoints.length; i++) {
    const env = endpoints[i].environment;
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
 * Validate endpoint configuration
 */
export function validateEndpoint(endpoint: { url: string; environment: string; region: string }): string[] {
  const errors: string[] = [];

  if (!endpoint.url) {
    errors.push('URL is required');
  } else {
    try {
      new URL(endpoint.url);
    } catch {
      errors.push('Invalid URL format');
    }
  }

  if (!endpoint.environment) {
    errors.push('Environment is required');
  }

  if (!endpoint.region) {
    errors.push('Region is required');
  }

  return errors;
}
