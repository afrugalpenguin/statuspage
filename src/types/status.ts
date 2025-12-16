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

export interface StatusResponse {
  lastUpdated: string;
  environments: Environment[];
  overallStatus: Status;
}

export interface WidgetProps {
  apiUrl?: string;
}
