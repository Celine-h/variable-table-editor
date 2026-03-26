import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

// antd components rely on ResizeObserver in jsdom tests.
(global as typeof globalThis & { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver =
  ResizeObserverMock;
