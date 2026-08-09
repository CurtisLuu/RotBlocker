const enableNativeBlock =
  process.env.ENABLE_NATIVE_BLOCK === "1" ||
  process.env.EAS_BUILD === "true";

const plugins = ["expo-font"];

// Dev client is fine in Expo Go config, but app-blocker must NOT load for Expo Go.
if (enableNativeBlock) {
  plugins.push("expo-dev-client");
  plugins.push([
    "expo-app-blocker",
    {
      ios: {
        appGroup: "group.org.rotblocker.blocker",
        shield: {
          title: "Reels stay cut.",
          subtitle:
            "{appName} is shielded. Open RotBlocker for a filtered session.",
          primaryButtonLabel: "Open RotBlocker",
          secondaryButtonLabel: "Not now",
          primaryButtonColor: "#1A5C4A",
          titleColor: "#141816",
          subtitleColor: "#3A413C",
          backgroundColor: "#E4E7E0",
          backgroundBlurStyle: "systemThickMaterialLight",
        },
        notification: {
          title: "RotBlocker",
          body: "Open RotBlocker for filtered Instagram — Reels cut out.",
        },
      },
    },
  ]);
}

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: "RotBlocker",
  slug: "rotblocker",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "rotblocker",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#E4E7E0",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "org.rotblocker.app",
    ...(enableNativeBlock
      ? {
          appleTeamId: process.env.APPLE_TEAM_ID || "YOUR_APPLE_TEAM_ID",
          entitlements: {
            "com.apple.developer.family-controls": true,
            "com.apple.security.application-groups": [
              "group.org.rotblocker.blocker",
            ],
          },
        }
      : {}),
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ["rotblocker"],
        },
      ],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#E4E7E0",
    },
    package: "org.rotblocker.app",
    intentFilters: [
      {
        action: "VIEW",
        category: ["BROWSABLE", "DEFAULT"],
        data: [{ scheme: "rotblocker" }],
      },
    ],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins,
  extra: {
    enableNativeBlock,
    eas: enableNativeBlock
      ? {
          build: {
            experimental: {
              ios: {
                appExtensions: [
                  {
                    targetName: "DeviceActivityMonitor",
                    bundleIdentifier:
                      "org.rotblocker.app.DeviceActivityMonitor",
                    entitlements: {
                      "com.apple.developer.family-controls": true,
                      "com.apple.security.application-groups": [
                        "group.org.rotblocker.blocker",
                      ],
                    },
                  },
                  {
                    targetName: "ShieldAction",
                    bundleIdentifier: "org.rotblocker.app.ShieldAction",
                    entitlements: {
                      "com.apple.developer.family-controls": true,
                      "com.apple.security.application-groups": [
                        "group.org.rotblocker.blocker",
                      ],
                    },
                  },
                  {
                    targetName: "ShieldConfiguration",
                    bundleIdentifier: "org.rotblocker.app.ShieldConfiguration",
                    entitlements: {
                      "com.apple.developer.family-controls": true,
                      "com.apple.security.application-groups": [
                        "group.org.rotblocker.blocker",
                      ],
                    },
                  },
                ],
              },
            },
          },
        }
      : {},
  },
};

module.exports = config;
