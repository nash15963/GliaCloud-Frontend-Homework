import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { MSWProvider } from './providers/MSWProvider'
import { HealthyCheckProvider } from './providers/HealthyCheckProvider'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MSWProvider>
        <HealthyCheckProvider>
          <App />
        </HealthyCheckProvider>
      </MSWProvider>
    </QueryClientProvider>
  </StrictMode>,
)
