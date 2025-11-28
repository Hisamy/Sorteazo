import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder / TextDecoder
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Polyfill setImmediate for environments where it's not defined (fixes multer usage in tests)
if (typeof (global as any).setImmediate === 'undefined') {
  (global as any).setImmediate = (fn: (...args: any[]) => void, ...args: any[]) => {
    return setTimeout(fn, 0, ...args);
  };
}