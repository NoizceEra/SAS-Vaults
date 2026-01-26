// Polyfill for Buffer in browser environment
import { Buffer } from 'buffer';

window.Buffer = Buffer;
window.global = window;
window.process = window.process || { env: {} };
