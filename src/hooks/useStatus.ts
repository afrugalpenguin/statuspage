import { useState, useEffect, useCallback } from 'preact/hooks';
import { performHealthChecks, type StatusData } from '../lib/healthCheck';
import { config } from '../config';

interface UseStatusResult {
  data: StatusData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStatus(): UseStatusResult {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const result = await performHealthChecks();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    const interval = setInterval(fetchStatus, config.refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { data, loading, error, refetch: fetchStatus };
}
