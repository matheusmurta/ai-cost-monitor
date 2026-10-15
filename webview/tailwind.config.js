const path = require('path');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.join(__dirname, 'src/**/*.{ts,tsx}')],
  theme: {
    extend: {
      colors: {
        bg: '#0B1220', panel: '#111C2E', panel2: '#0E1828', line: '#1E2B42', muted: '#8193B2',
        blue: { DEFAULT: '#3B82F6', glow: '#60A5FA' }, violet: '#8B5CF6', cyan: '#22D3EE',
        ok: '#22C55E', warn: '#F59E0B', bad: '#EF4444',
      },
      fontFamily: { sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px rgba(0,0,0,0.25)' },
    },
  },
  plugins: [],
};
