import type { Status } from '../lib/healthCheck';

interface StatusHeaderProps {
  title: string;
  overallStatus: Status;
  lastUpdated: string;
}

const statusMessages: Record<Status, string> = {
  operational: 'All systems operational',
  degraded: 'Some systems experiencing issues',
  outage: 'Major outage detected',
  unknown: 'Status unknown',
};

const statusIcons: Record<Status, string> = {
  operational: '\u2713',
  degraded: '!',
  outage: '\u2717',
  unknown: '?',
};

function formatLastUpdated(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1m ago';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1h ago';
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
}

export function StatusHeader({ title, overallStatus, lastUpdated }: StatusHeaderProps) {
  return (
    <header class="status-header">
      <div class="status-header-top">
        <h1 class="status-title">
          <svg class="status-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          {title}
        </h1>
        <span class="last-updated">Updated {formatLastUpdated(lastUpdated)}</span>
      </div>
      <div class={`overall-status ${overallStatus}`}>
        <span>{statusIcons[overallStatus]}</span>
        <span>{statusMessages[overallStatus]}</span>
      </div>
    </header>
  );
}
