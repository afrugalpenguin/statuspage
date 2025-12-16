export interface EndpointConfig {
  environment: string;
  region: string;
  url: string;
}

export const endpoints: EndpointConfig[] = [
  // Example endpoints - replace with your own
  { environment: 'Production', region: 'US', url: 'https://us.api.example.com' },
  { environment: 'Production', region: 'EU', url: 'https://eu.api.example.com' },
  { environment: 'Staging', region: 'US', url: 'https://staging.api.example.com' },
];

export const SERVER_PORT = process.env.PORT || 3001;
export const CHECK_INTERVAL_MS = 30000; // 30 seconds
export const REQUEST_TIMEOUT_MS = 10000; // 10 seconds
