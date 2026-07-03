export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: process.env.CAPACITOR_BUILD !== '1',
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  modules: ['@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],
  nitro: {
    compressPublicAssets: { gzip: true, brotli: false },
    routeRules: {
      '/_nuxt/**':  { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/images/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/sw.js':     { headers: { 'cache-control': 'no-cache' } },
    },
  },
  css: ['~/assets/css/main.css'],
  tailwindcss: {
    configPath: '~/tailwind.config.js',
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Travel Challenges',
      short_name: 'TravelCh',
      description: 'Выполняй задания в городах, фотографируй достопримечательности и зарабатывай XP',
      theme_color: '#0a0a0a',
      background_color: '#0a0a0a',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        { src: '/icon-512.svg', sizes: 'any', type: 'image/svg+xml' }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,svg,png,webp,jpg,jpeg}'],
      importScripts: ['/push-sw.js'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: { cacheName: 'google-fonts', expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 } }
        },
        {
          urlPattern: /\/api\/(challenges|users\/leaderboard)/,
          handler: 'NetworkFirst',
          options: { cacheName: 'api-cache', expiration: { maxAgeSeconds: 60 * 5 } }
        }
      ]
    },
    client: { installPrompt: true },
    devOptions: { enabled: true, type: 'module' }
  },
  app: {
    pageTransition: false,
    layoutTransition: false,
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Travel Challenges' },
        { name: 'theme-color', content: '#0a0a0a' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/icon-512.svg' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icon-192.png' },
        { rel: 'apple-touch-icon', sizes: '512x512', href: '/icon-512.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' }
      ],
      script: [
        {
          innerHTML: `(function(){try{
var dark=localStorage.getItem('ko_dark')==='1';
var L={bg:'#e8f5f3',card:'#d4eeea',panel:'#c0e6e0',text:'#0d1a18',muted:'#4a7a72',border:'rgba(0,0,0,0.10)'};
var D={bg:'#0d1a1a',card:'#122422',panel:'#182e2b',text:'#e8f5f3',muted:'#6a9e98',border:'rgba(0,201,167,0.12)'};
var t=dark?D:L;
var r=document.documentElement;
r.style.setProperty('--t-bg',t.bg);r.style.setProperty('--t-card',t.card);r.style.setProperty('--t-panel',t.panel);
r.style.setProperty('--t-text',t.text);r.style.setProperty('--t-muted',t.muted);r.style.setProperty('--t-border',t.border);
r.setAttribute('data-dark',dark?'1':'0');
}catch(e){}})();`,
        }
      ]
    }
  },
  runtimeConfig: {
    apiBaseInternal: process.env.API_BASE_INTERNAL || 'http://localhost:3002/api',
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:3002/api'
    }
  }
})
