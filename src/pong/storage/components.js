import { Schema } from '../../vimero/index.js';

export const schema = new Schema();

export const POS                = schema.defineColumn(2, Float32Array);
export const SIZE               = schema.defineColumn(2, Float32Array);
export const BG                 = schema.defineColumn(4, Uint8ClampedArray);
export const FG                 = schema.defineColumn(4, Uint8ClampedArray);
export const GLYPH              = schema.defineColumn(1, Uint8Array);
export const FONT_SIZE          = schema.defineColumn(1, Float32Array);
export const FONT_FAMILY        = schema.defineColumn(1, Uint8Array);
export const HIDDEN             = schema.defineColumn(1, Uint8Array);
export const ACTIVE             = schema.defineColumn(1, Uint8Array);
export const LIFETIME           = schema.defineColumn(1, Uint32Array);
export const VELOCITY           = schema.defineColumn(2, Float32Array);
export const COOLDOWN           = schema.defineColumn(1, Uint32Array);
export const COOLDOWN_TIMER     = schema.defineColumn(1, Uint32Array);
export const CAN_MOVE           = schema.defineColumn(1, Uint8Array);
export const DEFLECT            = schema.defineColumn(1, Int8Array);
export const POINTER            = schema.defineColumn(1, Uint8Array);
