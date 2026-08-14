import '@testing-library/jest-dom/vitest';
import { TextDecoder, TextEncoder } from 'node:util';

Object.assign(globalThis, {
  TextDecoder,
  TextEncoder,
});

afterEach(() => {
  vi.restoreAllMocks();
});
