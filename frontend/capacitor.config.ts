import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.challenge.skate',
  appName: 'KickOn',
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#0a0a0a',
      androidScaleType: 'CENTER_INSIDE',
      showSpinner: false,
      launchAutoHide: true,
    },
  },
}

export default config
