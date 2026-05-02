/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: [
    { pattern: /bg-subject_color_\d/, variants: ['hover', 'focus'] },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A3C6E',
          50:  '#EEF3FA',
          100: '#D5E2F3',
          200: '#ADC5E7',
          300: '#7FA1D4',
          400: '#4D79BC',
          500: '#1A3C6E',
          600: '#163462',
          700: '#122B52',
          800: '#0E2243',
          900: '#091633',
        },
        accent: {
          DEFAULT: '#F5A623',
          50:  '#FEF8EC',
          100: '#FDEECE',
          200: '#FBD98E',
          300: '#F8C150',
          400: '#F5A623',
          500: '#E08B05',
          600: '#B87005',
          700: '#8C5504',
          800: '#5F3903',
          900: '#341F01',
        },
        surface: '#FAFAF8',
        ink: {
          primary:   '#1C1C1E',
          secondary: '#6B7280',
        },
        border: '#E5E7EB',
        // Keep subject colors for calendar grid
        subject_color_1:  'rgba(179, 229, 252, 0.75)',
        subject_color_2:  'rgba(225, 190, 231, 0.75)',
        subject_color_3:  'rgba(200, 230, 201, 0.75)',
        subject_color_4:  'rgba(255, 224, 178, 0.75)',
        subject_color_5:  'rgba(248, 187, 208, 0.75)',
        subject_color_6:  'rgba(178, 235, 242, 0.75)',
        subject_color_7:  'rgba(209, 196, 233, 0.75)',
        subject_color_8:  'rgba(220, 237, 200, 0.75)',
        subject_color_9:  'rgba(178, 223, 219, 0.75)',
        subject_color_10: 'rgba(255, 204, 188, 0.75)',
      },
      fontFamily: {
        display: ['"Fraunces"', '"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Source Sans 3"', 'Lato', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'body-sm': ['0.875rem', { lineHeight: '1.7' }],
        'body':    ['1rem',     { lineHeight: '1.7' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'label':   ['0.75rem',  { lineHeight: '1.4', letterSpacing: '0.06em' }],
        'h5': ['1.25rem',  { lineHeight: '1.3', fontWeight: '700' }],
        'h4': ['1.5rem',   { lineHeight: '1.25', fontWeight: '700' }],
        'h3': ['1.875rem', { lineHeight: '1.2',  fontWeight: '700' }],
        'h2': ['2.5rem',   { lineHeight: '1.15', fontWeight: '800' }],
        'h1': ['3rem',     { lineHeight: '1.1',  fontWeight: '800' }],
        'display': ['3.5rem', { lineHeight: '1.05', fontWeight: '800' }],
      },
      maxWidth: {
        content: '1120px',
      },
      spacing: {
        section:          '5rem',
        'section-mobile': '3rem',
      },
      boxShadow: {
        card:       '0 1px 3px rgba(26,60,110,0.08), 0 4px 16px rgba(26,60,110,0.06)',
        'card-hover': '0 4px 12px rgba(26,60,110,0.12), 0 12px 32px rgba(26,60,110,0.10)',
      },
      borderRadius: {
        card: '0.375rem',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        shimmer:    'shimmer 1.4s infinite linear',
        'fade-in':  'fade-in 0.3s ease-out both',
        'slide-in': 'slide-in 0.25s ease-out both',
      },
    },
  },
  plugins: [],
}
