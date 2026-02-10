import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * Mock Service Worker for browser
 * Use this for development without backend
 */
export const worker = setupWorker(...handlers);
