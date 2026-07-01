// =============================================================================
// COLOR PALETTES — per-school theming
// =============================================================================
// Each palette has a full 10-step `brand` scale, a `gold` accent pair, and a
// `surface` trio (bg / alt / DEFAULT white). Values are space-separated RGB
// channels so Tailwind opacity modifiers like `bg-brand-500/60` work.
//
// applyTheme() writes all of these to CSS variables on <html> at startup.
// =============================================================================

export const PALETTES = {
  // Sant RLD's original look — forest green
  green: {
    brand: {
      50:  '240 247 239',
      100: '217 235 218',
      200: '179 215 181',
      300: '123 191 128',
      400: '74 158 82',
      500: '45 90 39',
      600: '36 75 32',
      700: '27 57 24',
      800: '18 38 16',
      900: '9 19 8',
    },
    gold:    { DEFAULT: '196 147 42',  light: '253 246 227' },
    surface: { DEFAULT: '255 255 255', alt: '243 241 237', bg: '250 250 248' },
  },

  // Royal blue
  blue: {
    brand: {
      50:  '239 246 255',
      100: '219 234 254',
      200: '191 219 254',
      300: '147 197 253',
      400: '96 165 250',
      500: '37 99 235',
      600: '29 78 216',
      700: '30 64 175',
      800: '30 58 138',
      900: '23 37 84',
    },
    gold:    { DEFAULT: '217 119 6',   light: '254 243 199' },
    surface: { DEFAULT: '255 255 255', alt: '243 241 237', bg: '250 250 248' },
  },

  // Classic maroon
  maroon: {
    brand: {
      50:  '251 240 241',
      100: '246 218 220',
      200: '235 179 184',
      300: '219 128 136',
      400: '196 78 89',
      500: '140 29 43',
      600: '116 18 31',
      700: '87 13 23',
      800: '61 8 16',
      900: '34 4 9',
    },
    gold:    { DEFAULT: '196 147 42',  light: '253 246 227' },
    surface: { DEFAULT: '255 255 255', alt: '243 241 237', bg: '250 250 248' },
  },

  // Navy — #30364F · #ACBAC4 · #E1D9BC · #F0F0DB
  // Deep navy with warm cream backgrounds and a soft antique-gold accent.
  navy: {
    brand: {
      50:  '240 240 219',  // #F0F0DB — cream (page bg)
      100: '225 217 188',  // #E1D9BC — warm parchment (alt bg)
      200: '200 208 215',  // between parchment and blue-gray
      300: '172 186 196',  // #ACBAC4 — muted steel-blue
      400: '138 157 174',  // slightly darker
      500: '100 120 148',  // medium navy-gray
      600: '68 86 115',    // medium-dark
      700: '56 68 100',    // dark
      800: '48 54 79',     // #30364F — deep navy
      900: '30 34 53',     // darkest
    },
    gold:    { DEFAULT: '175 155 90',  light: '225 217 188' },
    surface: { DEFAULT: '255 255 255', alt: '225 217 188', bg: '240 240 219' },
  },

  // Vibrant — #FF5656 · #FFA239 · #FEEE91 · #8CE4FF
  // Bright coral-red primary with warm orange/yellow accents and sky-blue highlights.
  // Light white/cream surfaces keep the overall feel fresh and energetic.
  vibrant: {
    brand: {
      50:  '255 245 245',  // very light blush
      100: '255 225 225',  // light pink
      200: '255 185 185',  // soft coral
      300: '255 140 140',  // medium coral
      400: '255 105 105',  // coral
      500: '255 86 86',    // #FF5656 — primary coral-red
      600: '230 58 58',    // deeper coral
      700: '195 38 38',    // strong red
      800: '155 22 22',    // dark red
      900: '110 10 10',    // darkest
    },
    // Orange as the gold accent; yellow as the light tint
    gold:    { DEFAULT: '255 162 57',  light: '254 238 145' },  // #FFA239 / #FEEE91
    // Warm off-white surfaces with a faint sky-blue alt
    surface: { DEFAULT: '255 255 255', alt: '235 248 255', bg: '250 252 255' },
  },
};

export default PALETTES;
