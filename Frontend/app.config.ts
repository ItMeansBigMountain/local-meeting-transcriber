import { ConfigContext, ExpoConfig } from "expo/config";
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "LMT",
  slug: "local-meeting-transcriber",
  extra: {
    API_BASE: process.env.API_BASE || "http://localhost:5000", // Default to localhost
  },
  ios: { 
    supportsTablet: true,
    bundleIdentifier: "com.lmt.app"
  },
  android: { 
    package: "com.lmt.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    }
  }
});
