import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.capacitortest563728thab.app',
  appName: 'henri-v4-capacitor',
  webDir: 'build/client',
  server:{
    url: "http://192.168.5.33:8100"
  }
};

export default config;
