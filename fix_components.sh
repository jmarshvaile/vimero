# Fix Pong Init
sed -i 's/POS | BG | FG | GLYPH | SIZE | TEXT | FONT | HIDDEN | ACTIVE | TIMER | DEFLECT/POS | BG | FG | GLYPH | SIZE | TEXT | FONT | HIDDEN | ACTIVE | TIMER | DEFLECT | VELOCITY | DELAY/g' src/pong/systems/Init.js

# Fix Ripple Init
sed -i 's/POS | BG | FG | GLYPH | SIZE | TEXT | FONT,/POS | BG | FG | GLYPH | SIZE | TEXT | FONT | LIFETIME | DELAY | POINTER_LOCK,/g' src/ripple/systems/Init.js
sed -i 's/\[POS, BG, FG, GLYPH, SIZE, TEXT, FONT\]/[POS, BG, FG, GLYPH, SIZE, TEXT, FONT, LIFETIME, DELAY, POINTER_LOCK]/g' src/ripple/systems/Init.js
sed -i 's/const size = columns\[4\], glySize = columns\[5\], glyFam = columns\[6\];/const size = columns[4], glySize = columns[5], glyFam = columns[6], lft = columns[7], dly = columns[8], lck = columns[9];/g' src/ripple/systems/Init.js
sed -i 's/glyFam\[i\] = 0; /glyFam[i] = 0; lft[i] = 0; dly[i] = 0; lck[i] = 0; /g' src/ripple/systems/Init.js
