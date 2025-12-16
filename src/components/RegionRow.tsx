import type { RegionStatus } from '../lib/healthCheck';
import { StatusIndicator } from './StatusIndicator';

interface RegionRowProps {
  region: RegionStatus;
}

const regionFlags: Record<string, string> = {
  US: '\u{1F1FA}\u{1F1F8}',
  UK: '\u{1F1EC}\u{1F1E7}',
  EU: '\u{1F1EA}\u{1F1FA}',
};

function formatResponseTime(ms: number | null): string {
  if (ms === null) return '---';
  return `${ms}ms`;
}

function getResponseTimeClass(ms: number | null): string {
  if (ms === null) return '';
  if (ms < 200) return 'fast';
  if (ms < 500) return 'medium';
  return 'slow';
}

export function RegionRow({ region }: RegionRowProps) {
  return (
    <div class="region-row">
      <span class="region-flag">{regionFlags[region.region] || ''}</span>
      <span class="region-name">{region.region}</span>
      <div class="region-status">
        <StatusIndicator status={region.status} />
      </div>
      <span class={`response-time ${getResponseTimeClass(region.responseTime)}`}>
        {formatResponseTime(region.responseTime)}
      </span>
    </div>
  );
}
