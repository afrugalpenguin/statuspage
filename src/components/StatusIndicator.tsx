import type { Status } from '../lib/healthCheck';

interface StatusIndicatorProps {
  status: Status;
  showText?: boolean;
}

const statusLabels: Record<Status, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
  unknown: 'Unknown',
};

export function StatusIndicator({ status, showText = true }: StatusIndicatorProps) {
  return (
    <div class="status-indicator">
      <span class={`status-dot ${status}`} />
      {showText && <span class="status-text">{statusLabels[status]}</span>}
    </div>
  );
}
