import type { Config } from 'tailwindcss';

const cssRgb = (token: string) => `rgb(var(${token}) / <alpha-value>)`;

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: cssRgb('--qtz-bg'),
          surface: cssRgb('--qtz-bg-surface'),
          recessed: cssRgb('--qtz-bg-recessed'),
        },
        ink: cssRgb('--qtz-ink'),
        /*
         * Dual-theme WCAG AA token ramp (defined in `app/globals.css`):
         *
         * - Night (`B1` GitHub Dark Dimmed): canvas `#1c2128`, card `#22272e`,
         *   recessed `#161b22`. Softened foreground `#cdd9e5` eliminates OLED
         *   halation; `slate-600` (`#8090a2`) is 4.60:1 on `#22272e` and 4.95:1
         *   on `#1c2128` (≥ 4.5:1 AA); `slate-700` (`#637282`) is 3.05:1 (≥ 3:1
         *   non-text floor).
         * - Day (`B4` Clean Lab Light): canvas `#f4f6f9`, card `#ffffff`,
         *   recessed `#eef2f6`. `slate-100` (`#0f172a`) is 17.85:1 on `#ffffff`;
         *   `slate-600` (`#5f7086`) is 5.06:1 on `#ffffff`, 4.68:1 on `#f4f6f9`,
         *   and 4.50:1 on `#eef2f6` (≥ 4.5:1 AA everywhere).
         * - Chromatic `200–400` text tokens invert between luminous tints in Night
         *   mode and deep ink shades in Day mode so `text-sky-400`, `text-emerald-400`,
         *   `text-amber-300`, and `text-rose-400` clear 4.5:1 AA in both themes,
         *   while `500–700` remain saturated fills for buttons and translucent pills.
         */
        slate: {
          50: cssRgb('--qtz-slate-50'),
          100: cssRgb('--qtz-slate-100'),
          200: cssRgb('--qtz-slate-200'),
          300: cssRgb('--qtz-slate-300'),
          400: cssRgb('--qtz-slate-400'),
          500: cssRgb('--qtz-slate-500'),
          600: cssRgb('--qtz-slate-600'),
          700: cssRgb('--qtz-slate-700'),
          800: cssRgb('--qtz-slate-800'),
          900: cssRgb('--qtz-slate-900'),
          950: cssRgb('--qtz-slate-950'),
        },
        sky: {
          200: cssRgb('--qtz-sky-200'),
          300: cssRgb('--qtz-sky-300'),
          400: cssRgb('--qtz-sky-400'),
          500: cssRgb('--qtz-sky-500'),
          600: cssRgb('--qtz-sky-600'),
          700: cssRgb('--qtz-sky-700'),
        },
        cyan: {
          200: cssRgb('--qtz-cyan-200'),
          300: cssRgb('--qtz-cyan-300'),
          400: cssRgb('--qtz-cyan-400'),
          500: cssRgb('--qtz-cyan-500'),
          600: cssRgb('--qtz-cyan-600'),
        },
        teal: {
          200: cssRgb('--qtz-teal-200'),
          300: cssRgb('--qtz-teal-300'),
          400: cssRgb('--qtz-teal-400'),
          500: cssRgb('--qtz-teal-500'),
          600: cssRgb('--qtz-teal-600'),
        },
        emerald: {
          200: cssRgb('--qtz-emerald-200'),
          300: cssRgb('--qtz-emerald-300'),
          400: cssRgb('--qtz-emerald-400'),
          500: cssRgb('--qtz-emerald-500'),
          600: cssRgb('--qtz-emerald-600'),
        },
        amber: {
          100: cssRgb('--qtz-amber-100'),
          200: cssRgb('--qtz-amber-200'),
          300: cssRgb('--qtz-amber-300'),
          400: cssRgb('--qtz-amber-400'),
          500: cssRgb('--qtz-amber-500'),
        },
        rose: {
          300: cssRgb('--qtz-rose-300'),
          400: cssRgb('--qtz-rose-400'),
          500: cssRgb('--qtz-rose-500'),
        },
        red: {
          300: cssRgb('--qtz-red-300'),
          400: cssRgb('--qtz-red-400'),
          500: cssRgb('--qtz-red-500'),
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
