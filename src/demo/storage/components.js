import { Schema } from '../../vimero/index.js';

export const schema = new Schema();

export const POS          = schema.defineColumn(2, Float32Array);
export const BG_COLOR     = schema.defineColumn(4, Uint8ClampedArray);
export const FG_COLOR     = schema.defineColumn(4, Uint8ClampedArray);
export const GLYPH        = schema.defineColumn(1, Uint8Array);
export const LIFETIME     = schema.defineColumn(1, Uint8Array);
export const RIPPLE_DELAY = schema.defineColumn(1, Uint8Array);
export const MOUSE_LOCK   = schema.defineColumn(1, Uint8Array);
export const SIZE         = schema.defineColumn(2, Float32Array);
export const GLYPH_SIZE   = schema.defineColumn(1, Float32Array);
export const GLYPH_FAMILY = schema.defineColumn(1, Uint8Array);

export const FULL_MASK = POS | BG_COLOR | FG_COLOR | GLYPH | LIFETIME | RIPPLE_DELAY | MOUSE_LOCK | SIZE | GLYPH_SIZE | GLYPH_FAMILY;
