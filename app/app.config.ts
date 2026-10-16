import type { ExpoConfig } from 'expo/config';

const { version } = require('./package.json') as { version: string };

const config: ExpoConfig = {
  name: 'Adım Adım',
  slug: 'adim-adim',
  version,
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'adimadim',
  userInterfaceStyle: 'automatic',
  platforms: ['android', 'web'],
  android: {
    package: 'com.aym3ntn.adimadim',
    // Set by CI to the workflow run number so each build can update the previous one.
    versionCode: Number(process.env.ANDROID_VERSION_CODE ?? 1),
    adaptiveIcon: {
      backgroundColor: '#1F4E8C',
      foregroundImage: './assets/images/android-icon-foreground.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    // SYSTEM_ALERT_WINDOW: review pop-ups drawn over other apps.
    // RECEIVE_BOOT_COMPLETED: re-arm the pop-up schedule after a restart.
    permissions: ['android.permission.SYSTEM_ALERT_WINDOW', 'android.permission.RECEIVE_BOOT_COMPLETED'],
    blockedPermissions: ['android.permission.READ_EXTERNAL_STORAGE', 'android.permission.WRITE_EXTERNAL_STORAGE'],
  },
  web: {
    bundler: 'metro',
    output: 'single',
    name: 'Adım Adım — turc A1.1',
    shortName: 'Adım Adım',
    lang: 'fr',
    themeColor: '#1F4E8C',
    backgroundColor: '#F6F3EE',
  },
  plugins: [
    'expo-router',
    'expo-font',
    ['expo-splash-screen', { backgroundColor: '#1F4E8C', image: './assets/images/splash-icon.png', imageWidth: 96 }],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
    // Set by the Pages workflow: the site is served from /adim-adim/.
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
};

export default config;
