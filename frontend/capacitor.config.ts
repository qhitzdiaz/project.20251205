import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qhitz.mui',
  appName: 'Qhitz Inc.,',
  webDir: 'build',
  server: {
    // Use homelab IP for development
    // Change this to your actual server IP when deploying
    url: 'http://192.168.2.28:3000',
    cleartext: true
  }
};

export default config;
