import type { Environment } from '../lib/healthCheck';
import { RegionRow } from './RegionRow';

interface EnvironmentCardProps {
  environment: Environment;
}

export function EnvironmentCard({ environment }: EnvironmentCardProps) {
  return (
    <div class="environment-card">
      <div class="environment-header">
        <span class="environment-name">{environment.name}</span>
      </div>
      <div class="environment-regions">
        {environment.regions.map((region) => (
          <RegionRow key={region.region} region={region} />
        ))}
      </div>
    </div>
  );
}
