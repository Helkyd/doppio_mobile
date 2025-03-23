const IS_DEV = process.env.APP_VARIANT === 'development';


export default {
  "expo": {
    "name": "changemakers-rn",
    "slug": "changemakers-rn",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "scheme": "dev.metagest.changemakers",
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "config": {
        "usesNonExemptEncryption": false
      },
      "bundleIdentifier": IS_DEV ? 'io.changemakers.dev' : 'dev.metagest.changemakers',
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "dev.metagest.changemakers"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "8773da7f-b551-43f5-aedf-c8161c0db340"
      }
    },
    "plugins": [
      "expo-build-properties",
      "expo-secure-store"
    ]
  }
}
