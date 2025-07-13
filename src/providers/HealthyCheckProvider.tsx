import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../services/check-health';

interface HealthCheckContextType {
  isHealthy: boolean;
  isLoading: boolean;
  error: Error | null;
}

const HealthCheckContext = createContext<HealthCheckContextType | undefined>(undefined);

interface HealthyCheckProviderProps {
  children: ReactNode;
}

export function HealthyCheckProvider({ children }: HealthyCheckProviderProps) {
  const { 
    data,
    isLoading, 
    error,
    isError 
  } = useQuery({
    queryKey: ['health'],
    queryFn: healthApi.checkHealth,
  });

  if (isLoading) {
    return <div className="loading">Checking server health...</div>;
  }

  if (isError && data?.success === false) {
    return <div className="error">Error checking server health: {error?.message}</div>;
  }

  const contextValue: HealthCheckContextType = {
    isHealthy: data?.success === true,
    isLoading,
    error: error as Error | null,
  };

  return (
    <HealthCheckContext.Provider value={contextValue}>
      {children}
    </HealthCheckContext.Provider>
  );
}

export function useHealthCheck() {
  const context = useContext(HealthCheckContext);
  if (context === undefined) {
    throw new Error('useHealthCheck must be used within a HealthyCheckProvider');
  }
  return context;
}