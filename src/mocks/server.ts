import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup MSW server for Node.js environment (tests, SSR)
export const server = setupServer(...handlers)