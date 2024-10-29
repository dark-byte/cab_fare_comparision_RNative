import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',  // Ensure the key is pulled from the environment
  },
  ios: {
    ...config.ios,
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    },
  },
  android: {
    ...config.android,
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      },
    },
  },
});