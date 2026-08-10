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
        appGroup: "group.org.PleaseFocus.blocker",
        shield: {
          title: "Reels stay cut.",
          subtitle:
            "{appName} is shielded. Open Please Focus! for a filtered session.",
          primaryButtonLabel: "Open Please Focus!",
          secondaryButtonLabel: "Not now",
          // Matches theme.ts — mint = go, off-white on film-leader black.
          primaryButtonColor: "#4BE0A5",
          titleColor: "#E9EFEA",
          subtitleColor: "#98A49D",
          backgroundColor: "#070907",
          backgroundBlurStyle: "systemThickMaterialDark",
        },
        notification: {
          title: "Please Focus!",
          body: "Open Please Focus! to browse with Reels and Shorts cut out.",
        },
      },
    },
  ]);
}

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: "Please Focus!",
  slug: "PleaseFocus",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "pleasefocus",
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
    bundleIdentifier: "org.PleaseFocus.app",
    ...(enableNativeBlock
      ? {
          appleTeamId: process.env.APPLE_TEAM_ID || "YOUR_APPLE_TEAM_ID",
          entitlements: {
            "com.apple.developer.family-controls": true,
            "com.apple.security.application-groups": [
              "group.org.PleaseFocus.blocker",
            ],
          },
        }
      : {}),
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ["pleasefocus"],
        },
      ],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#070907",
    },
    package: "org.PleaseFocus.app",
    intentFilters: [
      {
        action: "VIEW",
        category: ["BROWSABLE", "DEFAULT"],
        data: [{ scheme: "pleasefocus" }],
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
                      "org.PleaseFocus.app.DeviceActivityMonitor",
                    entitlements: {
                      "com.apple.developer.family-controls": true,
                      "com.apple.security.application-groups": [
                        "group.org.PleaseFocus.blocker",
                      ],
                    },
                  },
                  {
                    targetName: "ShieldAction",
                    bundleIdentifier: "org.PleaseFocus.app.ShieldAction",
                    entitlements: {
                      "com.apple.developer.family-controls": true,
                      "com.apple.security.application-groups": [
                        "group.org.PleaseFocus.blocker",
                      ],
                    },
                  },
                  {
                    targetName: "ShieldConfiguration",
                    bundleIdentifier: "org.PleaseFocus.app.ShieldConfiguration",
                    entitlements: {
                      "com.apple.developer.family-controls": true,
                      "com.apple.security.application-groups": [
                        "group.org.PleaseFocus.blocker",
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
