import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.vemakin.app',
    appName: 'Vemakin',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    ios: {
        useSwiftPM: true
    }
};

export default config;
