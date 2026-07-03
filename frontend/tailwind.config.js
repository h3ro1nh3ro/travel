/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        thps: {
          dark:   '#0a0a0a',
          card:   '#111111',
          panel:  '#181818',
          yellow: '#FFE600',
          lime:   '#CCFF00',
          cyan:   '#00FFEE',
          orange: '#FF5500',
          red:    '#FF1A1A',
          purple: '#AA00FF',
        }
      },
      fontFamily: {
        display: ['"Chakra Petch"', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
        body:    ['"Barlow"', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.2em',
      }
    }
  }
}
