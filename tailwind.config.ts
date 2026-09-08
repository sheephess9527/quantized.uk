import type { Config } from 'tailwindcss';

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
          DEFAULT: '#0a0a0f',
          surface: '#111118',
        },
        /*
         * The dim end of the slate ramp, raised to pass WCAG AA against this
         * site's background.
         *
         * Tailwind's own `slate-600` (#475569) is 2.5:1 on `#0a0a0f` — it was
         * carrying most of the explanatory text on the site: methodology
         * lines, data-source notes, dates, the disclaimer under the changelog.
         * All of it was below the 4.5:1 floor for body text, and the fix is
         * one place rather than 86 class names. `slate-500` had to move with
         * it (3.96:1, and it must stay lighter than 600 or the visual
         * hierarchy inverts); `slate-700` is used for decorative icons and
         * separators, so it targets the 3:1 non-text floor.
         *
         * Measured against the glass surface (#111116 — the page colour with
         * white at 3%), which is the worst case: 600 → 4.60, 500 → 5.92,
         * 700 → 3.11. The rest of the ramp is Tailwind's.
         */
        slate: {
          500: '#8092aa',
          600: '#6a7f9c',
          700: '#52647c',
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
