/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // ── DESIGN.md Color Palette (FeedLoop / CivicPulse) ──────────────────
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',  // ← main primary
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        secondary: {
          DEFAULT: '#6B7280',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',  // ← main secondary
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        surface: '#FFFFFF',
        background: '#F9FAFB',
        success: '#16A34A',
        warning: '#D97706',
        error:   '#DC2626',
        info:    '#2563EB',

        // ── Municipal shell overlay (structure from MUNICIPAL_DESIGN.md) ──
        // Dark glass sidebar/header — NOT an independent color palette,
        // just the shell overlay value from the layout spec.
        shell: 'rgba(0, 0, 0, 0.85)',
      },

      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs':   ['0.75rem',   { lineHeight: '1rem' }],
        'sm':   ['0.875rem',  { lineHeight: '1.25rem' }],
        'base': ['1rem',      { lineHeight: '1.5rem' }],
        'lg':   ['1.125rem',  { lineHeight: '1.75rem' }],
        'xl':   ['1.25rem',   { lineHeight: '1.75rem' }],
        '2xl':  ['1.5rem',    { lineHeight: '2rem' }],
        '3xl':  ['1.875rem',  { lineHeight: '2.25rem' }],
        '4xl':  ['2.25rem',   { lineHeight: '2.5rem' }],
      },

      // ── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        'xs':   '4px',
        'sm':   '6px',
        DEFAULT:'8px',   // controls, inputs
        'md':   '8px',
        'lg':   '12px',  // cards
        'xl':   '16px',
        'full': '9999px', // pills, badges
      },

      // ── Shadows ──────────────────────────────────────────────────────────
      boxShadow: {
        'subtle': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card':   '0 2px 8px rgba(0,0,0,0.08)',
        'raised': '0 4px 12px rgba(0,0,0,0.12)',
        'dialog': '0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.04)',
      },

      // ── Spacing ──────────────────────────────────────────────────────────
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
      },

      // ── Layout ───────────────────────────────────────────────────────────
      maxWidth: {
        'container': '1400px',
      },
      height: {
        'shell-header': '64px',
        'touch':        '44px',  // DESIGN.md minimum touch target
      },
      width: {
        'sidebar-expanded':  '256px',
        'sidebar-collapsed': '64px',
      },

      // ── Animations ───────────────────────────────────────────────────────
      transitionDuration: {
        'fast':   '150ms',
        'normal': '200ms',
        'slow':   '300ms',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in':       'fade-in 200ms ease-out',
        'slide-up':      'slide-up 250ms ease-out',
        'slide-in-right':'slide-in-right 300ms cubic-bezier(0.4,0,0.2,1)',
        'pulse-soft':    'pulse-soft 2s ease-in-out infinite',
        'spin-slow':     'spin-slow 1s linear infinite',
      },
    },
  },
  plugins: [],
};
