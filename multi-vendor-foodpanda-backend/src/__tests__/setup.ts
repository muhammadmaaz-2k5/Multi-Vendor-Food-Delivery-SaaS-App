// Test setup: load .env before any imports touch the database or JWT config
import 'dotenv/config';
import { vi } from 'vitest';

// Mock ioredis entirely so no Redis connection is attempted during tests
vi.mock('ioredis', () => {
  const RedisMock = function () {
    return {
      on: vi.fn(),
      emit: vi.fn(),
      status: 'ready',
      quit: vi.fn().mockResolvedValue('OK'),
      disconnect: vi.fn(),
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue('OK'),
    };
  };
  return { Redis: RedisMock, default: RedisMock };
});

// Mock the email queue so auth routes don't attempt to enqueue Redis jobs
vi.mock('../queues/email.queue.js', () => ({
  emailQueue: {
    add: vi.fn().mockResolvedValue({}),
    close: vi.fn().mockResolvedValue(undefined),
  },
  sendWelcomeEmailJob: vi.fn().mockResolvedValue(undefined),
}));
