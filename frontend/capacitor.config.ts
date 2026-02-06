import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.adrevtechnologies.adify',
  appName: 'Adify',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Allow external navigation for legal pages and authentication
    allowNavigation: [
      'adify.adrevtechnologies.com',
      'api.adrevtechnologies.com',
      '*.supabase.co',
      'accounts.google.com'
    ]
  },
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-4849029372688725~4106586687',
    },
  },
};

export default config;
