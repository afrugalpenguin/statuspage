import { describe, it, expect } from 'vitest';
import { config } from '../src/config';

describe('config', () => {
  describe('brand', () => {
    it('has required brand properties', () => {
      expect(config.brand).toBeDefined();
      expect(config.brand.title).toBeDefined();
      expect(typeof config.brand.title).toBe('string');
      expect(config.brand.primaryColor).toBeDefined();
      expect(config.brand.footerText).toBeDefined();
      expect(config.brand.footerLinkText).toBeDefined();
      expect(config.brand.footerLink).toBeDefined();
    });

    it('has valid primary color format', () => {
      expect(config.brand.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('has valid footer link URL', () => {
      expect(() => new URL(config.brand.footerLink)).not.toThrow();
    });
  });

  describe('endpoints', () => {
    it('has at least one endpoint', () => {
      expect(config.endpoints.length).toBeGreaterThan(0);
    });

    it('all endpoints have required properties', () => {
      for (const endpoint of config.endpoints) {
        expect(endpoint.environment).toBeDefined();
        expect(typeof endpoint.environment).toBe('string');
        expect(endpoint.region).toBeDefined();
        expect(typeof endpoint.region).toBe('string');
        expect(endpoint.url).toBeDefined();
        expect(typeof endpoint.url).toBe('string');
      }
    });

    it('all endpoints have valid URLs', () => {
      for (const endpoint of config.endpoints) {
        expect(() => new URL(endpoint.url)).not.toThrow();
      }
    });
  });

  describe('settings', () => {
    it('has valid refresh interval', () => {
      expect(config.refreshInterval).toBeDefined();
      expect(typeof config.refreshInterval).toBe('number');
      expect(config.refreshInterval).toBeGreaterThan(0);
    });

    it('has valid request timeout', () => {
      expect(config.requestTimeout).toBeDefined();
      expect(typeof config.requestTimeout).toBe('number');
      expect(config.requestTimeout).toBeGreaterThan(0);
    });

    it('refresh interval is greater than request timeout', () => {
      expect(config.refreshInterval).toBeGreaterThan(config.requestTimeout);
    });
  });

  describe('mode', () => {
    it('has valid mode', () => {
      expect(['direct', 'proxy', 'backend']).toContain(config.mode);
    });

    it('backend mode has backendUrl', () => {
      if (config.mode === 'backend') {
        expect(config.backendUrl).toBeDefined();
      }
    });

    it('proxy mode has workerUrl', () => {
      if (config.mode === 'proxy') {
        expect(config.workerUrl).toBeDefined();
      }
    });
  });
});
