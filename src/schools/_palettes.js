// =============================================================================
// COLOR PALETTES — per-school theming (Level 1 of the theming spectrum)
// =============================================================================
// Each palette is a full 10-step `brand` scale + a `gold` accent pair.
// Values are stored as space-separated RGB channels (NOT hex) so Tailwind can
// apply opacity modifiers like `bg-brand-500/60` via rgb(var(--brand-500) / <alpha>).
//
// A school picks a palette by name in its config (`palette: 'blue'`), or passes
// a custom palette object of the same shape. Add new named palettes here.
// =============================================================================

export const PALETTES = {
  // Sant RLD's current look — forest green
  green: {
    brand: {
      50: '240 247 239',
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
    gold: { DEFAULT: '196 147 42', light: '253 246 227' },
  },

  // Royal blue — a clean alternative for school #2
  blue: {
    brand: {
      50: '239 246 255',
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
    gold: { DEFAULT: '217 119 6', light: '254 243 199' },
  },

  // Maroon — classic institutional look
  maroon: {
    brand: {
      50: '251 240 241',
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
    gold: { DEFAULT: '196 147 42', light: '253 246 227' },
  },
};

export default PALETTES;
