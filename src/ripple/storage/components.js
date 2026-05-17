import { Schema } from '../../vimero/index.js';

export const schema = new Schema();

export const POS              = schema.defineColumn(2, Float32Array);
export const BG               = schema.defineColumn(4, Uint8ClampedArray);
export const FG               = schema.defineColumn(4, Uint8ClampedArray);
export const GLYPH            = schema.defineColumn(1, Uint8Array);
export const LIFETIME         = schema.defineColumn(1, Uint8Array);
export const DELAY            = schema.defineColumn(1, Uint8Array);
export const POINTER_LOCK     = schema.defineColumn(1, Uint8Array);
export const SIZE             = schema.defineColumn(2, Float32Array);
export const TEXT             = schema.defineColumn(1, Float32Array);
export const FONT             = schema.defineColumn(1, Uint8Array);
export const VELOCITY         = schema.defineColumn(2, Float32Array);
export const TIMER            = schema.defineColumn(1, Uint8Array);
export const MOVER            = schema.defineColumn(1, Uint8Array);
