import { vi } from 'vitest'
export const router = {
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
}
