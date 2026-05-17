import { Schema } from '../../vimero/index.js';

export const schema = new Schema();

export const POS                = schema.defineColumn(2, Float32Array);
export const SIZE               = schema.defineColumn(2, Float32Array);
export const BG_COLOR           = schema.defineColumn(4, Uint8ClampedArray);
export const FG_COLOR           = schema.defineColumn(4, Uint8ClampedArray);
export const GLYPH              = schema.defineColumn(1, Uint8Array);
export const GLYPH_SIZE         = schema.defineColumn(1, Float32Array);
export const GLYPH_FAMILY       = schema.defineColumn(1, Uint8Array);
export const HIDDEN             = schema.defineColumn(1, Uint8Array);
export const ACTIVE             = schema.defineColumn(1, Uint8Array);
export const TIMER              = schema.defineColumn(1, Uint32Array);
export const VELOCITY           = schema.defineColumn(2, Float32Array);
export const STEP_TIMER         = schema.defineColumn(1, Uint32Array);
export const STEP_DELAY         = schema.defineColumn(1, Uint32Array);
export const SURFACE_DEFLECTION = schema.defineColumn(1, Int8Array);

export const FULL_MASK = POS | SIZE | BG_COLOR | FG_COLOR | GLYPH | GLYPH_SIZE | GLYPH_FAMILY | HIDDEN | ACTIVE | TIMER | VELOCITY | STEP_TIMER | STEP_DELAY | SURFACE_DEFLECTION;
