import { describe, it, expect } from 'vitest';
import {
  determineStatusFromResponse,
  determineOverallStatus,
  groupByEnvironment,
  validateEndpoint,
} from '../src/lib/statusUtils';
import type { RegionStatus, Environment } from '../src/lib/healthCheck';

describe('determineStatusFromResponse', () => {
  it('returns operational for successful fast response', () => {
    expect(determineStatusFromResponse(true, 200, 500)).toBe('operational');
    expect(determineStatusFromResponse(true, 200, 1999)).toBe('operational');
  });

  it('returns degraded for successful slow response', () => {
    expect(determineStatusFromResponse(true, 200, 2001)).toBe('degraded');
    expect(determineStatusFromResponse(true, 200, 5000)).toBe('degraded');
  });

  it('returns degraded for 4xx errors', () => {
    expect(determineStatusFromResponse(false, 400, 100)).toBe('degraded');
    expect(determineStatusFromResponse(false, 404, 100)).toBe('degraded');
    expect(determineStatusFromResponse(false, 429, 100)).toBe('degraded');
  });

  it('returns outage for 5xx errors', () => {
    expect(determineStatusFromResponse(false, 500, 100)).toBe('outage');
    expect(determineStatusFromResponse(false, 502, 100)).toBe('outage');
    expect(determineStatusFromResponse(false, 503, 100)).toBe('outage');
  });

  it('respects custom slow threshold', () => {
    expect(determineStatusFromResponse(true, 200, 1500, 1000)).toBe('degraded');
    expect(determineStatusFromResponse(true, 200, 500, 1000)).toBe('operational');
  });
});

describe('determineOverallStatus', () => {
  const createRegion = (status: 'operational' | 'degraded' | 'outage' | 'unknown'): RegionStatus => ({
    region: 'US',
    url: 'https://example.com',
    status,
    responseTime: 100,
    lastChecked: new Date().toISOString(),
  });

  it('returns operational when all regions are operational', () => {
    const environments: Environment[] = [
      { name: 'Production', regions: [createRegion('operational'), createRegion('operational')] },
      { name: 'Staging', regions: [createRegion('operational')] },
    ];
    expect(determineOverallStatus(environments)).toBe('operational');
  });

  it('returns degraded when any region is degraded', () => {
    const environments: Environment[] = [
      { name: 'Production', regions: [createRegion('operational'), createRegion('degraded')] },
      { name: 'Staging', regions: [createRegion('operational')] },
    ];
    expect(determineOverallStatus(environments)).toBe('degraded');
  });

  it('returns outage when any region has outage', () => {
    const environments: Environment[] = [
      { name: 'Production', regions: [createRegion('operational'), createRegion('outage')] },
      { name: 'Staging', regions: [createRegion('operational')] },
    ];
    expect(determineOverallStatus(environments)).toBe('outage');
  });

  it('returns outage over degraded when both exist', () => {
    const environments: Environment[] = [
      { name: 'Production', regions: [createRegion('degraded'), createRegion('outage')] },
    ];
    expect(determineOverallStatus(environments)).toBe('outage');
  });

  it('returns operational for empty environments', () => {
    expect(determineOverallStatus([])).toBe('operational');
  });
});

describe('groupByEnvironment', () => {
  const createResult = (region: string): RegionStatus => ({
    region,
    url: `https://${region.toLowerCase()}.example.com`,
    status: 'operational',
    responseTime: 100,
    lastChecked: new Date().toISOString(),
  });

  it('groups results by environment', () => {
    const results = [createResult('US'), createResult('EU'), createResult('US-Staging')];
    const endpoints = [
      { environment: 'Production', region: 'US' },
      { environment: 'Production', region: 'EU' },
      { environment: 'Staging', region: 'US-Staging' },
    ];

    const grouped = groupByEnvironment(results, endpoints);

    expect(grouped).toHaveLength(2);
    expect(grouped[0].name).toBe('Production');
    expect(grouped[0].regions).toHaveLength(2);
    expect(grouped[1].name).toBe('Staging');
    expect(grouped[1].regions).toHaveLength(1);
  });

  it('maintains environment order from config', () => {
    const results = [createResult('A'), createResult('B'), createResult('C')];
    const endpoints = [
      { environment: 'First', region: 'A' },
      { environment: 'Second', region: 'B' },
      { environment: 'Third', region: 'C' },
    ];

    const grouped = groupByEnvironment(results, endpoints);

    expect(grouped[0].name).toBe('First');
    expect(grouped[1].name).toBe('Second');
    expect(grouped[2].name).toBe('Third');
  });

  it('handles single environment', () => {
    const results = [createResult('US'), createResult('EU')];
    const endpoints = [
      { environment: 'Production', region: 'US' },
      { environment: 'Production', region: 'EU' },
    ];

    const grouped = groupByEnvironment(results, endpoints);

    expect(grouped).toHaveLength(1);
    expect(grouped[0].regions).toHaveLength(2);
  });
});

describe('validateEndpoint', () => {
  it('returns no errors for valid endpoint', () => {
    const errors = validateEndpoint({
      url: 'https://api.example.com',
      environment: 'Production',
      region: 'US',
    });
    expect(errors).toHaveLength(0);
  });

  it('returns error for missing URL', () => {
    const errors = validateEndpoint({
      url: '',
      environment: 'Production',
      region: 'US',
    });
    expect(errors).toContain('URL is required');
  });

  it('returns error for invalid URL', () => {
    const errors = validateEndpoint({
      url: 'not-a-valid-url',
      environment: 'Production',
      region: 'US',
    });
    expect(errors).toContain('Invalid URL format');
  });

  it('returns error for missing environment', () => {
    const errors = validateEndpoint({
      url: 'https://api.example.com',
      environment: '',
      region: 'US',
    });
    expect(errors).toContain('Environment is required');
  });

  it('returns error for missing region', () => {
    const errors = validateEndpoint({
      url: 'https://api.example.com',
      environment: 'Production',
      region: '',
    });
    expect(errors).toContain('Region is required');
  });

  it('returns multiple errors when multiple fields invalid', () => {
    const errors = validateEndpoint({
      url: '',
      environment: '',
      region: '',
    });
    expect(errors).toHaveLength(3);
  });
});
