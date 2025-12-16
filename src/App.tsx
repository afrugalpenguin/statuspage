import { StatusHeader } from './components/StatusHeader';
import { EnvironmentCard } from './components/EnvironmentCard';
import { useStatus } from './hooks/useStatus';
import { config } from './config';

export function App() {
  const { data, loading, error } = useStatus();

  if (loading) {
    return (
      <div class="status-container">
        <div class="loading">
          <div class="loading-spinner" />
          Loading status...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div class="status-container">
        <div class="error">
          Unable to load status: {error || 'No data'}
        </div>
      </div>
    );
  }

  return (
    <div class="status-container">
      <StatusHeader
        title={config.brand.title}
        overallStatus={data.overallStatus}
        lastUpdated={data.lastUpdated}
      />
      <div class="environments">
        {data.environments.map((env) => (
          <EnvironmentCard key={env.name} environment={env} />
        ))}
      </div>
      <footer class="status-footer">
        <span class="powered-by">
          {config.brand.footerText}{' '}
          <a href={config.brand.footerLink} target="_blank" rel="noopener">
            {config.brand.footerLinkText}
          </a>
        </span>
      </footer>
    </div>
  );
}
