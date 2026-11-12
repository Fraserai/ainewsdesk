import { type Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#1d4ed8',
        'accent-strong': '#1e40af',
        neutral: '#f3f4f6',
      },
      fontFamily: {
        display: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [],
};

export default config;
