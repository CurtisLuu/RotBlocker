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
          // Matches theme.ts — mint = go, off-white on film-leader black.
          primaryButtonColor: "#4BE0A5",
          titleColor: "#E9EFEA",
          subtitleColor: "#98A49D",
          backgroundColor: "#070907",
          backgroundBlurStyle: "systemThickMaterialDark",
        },
        notification: {
          title: "RotBlocker",
          body: "Open RotBlocker to browse with Reels and Shorts cut out.",
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
  // The bench is dark-only — let system chrome (alerts, pickers) follow.
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#070907",
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
      backgroundColor: "#070907",
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
