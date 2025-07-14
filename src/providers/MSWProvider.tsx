import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface MSWContextType {
  isEnabled: boolean;
  isReady: boolean;
  error: string | null;
}

const MSWContext = createContext<MSWContextType | null>(null);

interface MSWProviderProps {
  children: ReactNode;
}

export const MSWProvider = ({ children }: MSWProviderProps) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if MSW should be enabled
  const isEnabled = import.meta.env.VITE_ENABLE_MSW === 'true';

  useEffect(() => {
    const initMSW = async () => {
      // If MSW is not enabled, mark as ready immediately
      if (!isEnabled) {
        setIsReady(true);
        return;
      }
      
      try {
        const { worker } = await import('../mocks/browser');
        
        // Start the worker
        await worker.start({
          onUnhandledRequest: 'warn', // Only warn for unhandled requests
        });
        
        console.log('[MSW] Mock Service Worker started successfully');
        setIsReady(true);
      } catch (err) {
        console.error('[MSW] Failed to start Mock Service Worker:', err);
        setError(err instanceof Error ? err.message : 'Failed to start MSW');
        setIsReady(true); // Still allow app to render
      }
    };

    initMSW();
  }, [isEnabled]);

  const contextValue: MSWContextType = {
    isEnabled,
    isReady,
    error,
  };

  // Show loading state while MSW is initializing
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isEnabled ? 'Initializing Mock Service Worker...' : 'Initializing application...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <MSWContext.Provider value={contextValue}>
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                MSW Warning
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Mock Service Worker failed to start: {error}</p>
                <p>The app will continue to work but may make real API calls.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {children}
    </MSWContext.Provider>
  );
};

// Hook to access MSW context
export const useMSW = (): MSWContextType => {
  const context = useContext(MSWContext);
  if (!context) {
    throw new Error('useMSW must be used within an MSWProvider');
  }
  return context;
};

// Optional: Hook to check if requests should use mock data
export const useIsMockMode = (): boolean => {
  const { isEnabled, isReady } = useMSW();
  return isEnabled && isReady;
};