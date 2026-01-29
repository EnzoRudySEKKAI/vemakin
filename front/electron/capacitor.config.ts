import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vemakin.app',
  appName: 'Vemakin',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
