import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import { useFonts } from "expo-font";
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from "@expo-google-fonts/ibm-plex-sans";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from "@expo-google-fonts/ibm-plex-mono";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HomeScreen } from "./screens/HomeScreen";
import { FilteredBrowserScreen } from "./screens/FilteredBrowserScreen";
import { NativeBlockScreen } from "./screens/NativeBlockScreen";
import { SetupGuideScreen } from "./screens/SetupGuideScreen";
import { TutorialScreen } from "./screens/TutorialScreen";
import { getNativeBlockModule } from "./lib/nativeBlock";
import { INSTAGRAM_SITE, YOUTUBE_SITE, type SiteKey } from "./lib/sites";
import {
  hasCompletedTutorial,
  markTutorialCompleted,
} from "./lib/settings";
import { colors } from "./theme";

type Screen =
  | "loading"
  | "tutorial"
  | "home"
  | "instagram"
  | "youtube"
  | "setup"
  | "nativeBlock";

function pathFromUrl(url: string | null): Screen | null {
  if (!url) return null;
  try {
    const parsed = Linking.parse(url);
    const path = parsed.path ?? "";
    const host = parsed.hostname ?? "";
    if (path.includes("instagram") || host === "instagram") return "instagram";
    if (path.includes("youtube") || host === "youtube") return "youtube";
    if (path.includes("blocked") || host === "blocked") return "instagram";
    if (path.includes("block") || host === "block") return "nativeBlock";
    return null;
  } catch {
    return null;
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
    // Preloaded with the rest, so icons don't pop in a frame late.
    ...Ionicons.font,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    hasCompletedTutorial().then((done) => {
      setScreen(done ? "home" : "tutorial");
    });
  }, [fontsLoaded]);

  // Deep links from shield / Android overlay → filtered Instagram
  useEffect(() => {
    const handle = (url: string | null) => {
      const target = pathFromUrl(url);
      if (target) setScreen(target);
    };

    Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener("url", ({ url }) => handle(url));
    return () => sub.remove();
  }, []);

  // When user taps "Open Please Focus!" on the iOS shield notification
  useEffect(() => {
    const blocker = getNativeBlockModule();
    if (!blocker?.addPendingUnlockListener) return;

    const sub = blocker.addPendingUnlockListener(() => {
      // The unlock event says nothing about which app was shielded, but the
      // intercept queue does. Open the filtered version of the app the user
      // was actually reaching for; anything else (TikTok, an app Please Focus!
      // doesn't browse) keeps the old Instagram destination.
      let target: Screen = "instagram";
      try {
        const intercepts = blocker.drainPendingIntercepts?.() ?? [];
        const latest = intercepts[intercepts.length - 1]?.appName ?? "";
        if (latest.toLowerCase().includes("youtube")) target = "youtube";
      } catch {
        // Queue unavailable — fall through to the default.
      }
      setScreen(target);
    });
    return () => {
      // API may return subscription-like object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sub as any)?.remove?.();
    };
  }, []);

  /** Site keys double as screen names, so the browser routes by key. */
  const openSite = (site: SiteKey) => setScreen(site);

  const finishTutorial = async () => {
    await markTutorialCompleted();
    setScreen("home");
  };

  const booting = !fontsLoaded || screen === "loading";

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {booting ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.mint} />
        </View>
      ) : null}
      {!booting && screen === "tutorial" ? (
        <TutorialScreen onFinished={finishTutorial} />
      ) : null}
      {!booting && screen === "home" ? (
        <HomeScreen
          onOpenSite={openSite}
          onOpenTutorial={() => setScreen("tutorial")}
          onOpenSetup={() => setScreen("setup")}
          onOpenNativeBlock={() => setScreen("nativeBlock")}
        />
      ) : null}
      {!booting && screen === "instagram" ? (
        <FilteredBrowserScreen
          site={INSTAGRAM_SITE}
          onBack={() => setScreen("home")}
        />
      ) : null}
      {!booting && screen === "youtube" ? (
        <FilteredBrowserScreen
          site={YOUTUBE_SITE}
          onBack={() => setScreen("home")}
        />
      ) : null}
      {!booting && screen === "setup" ? (
        <SetupGuideScreen
          onBack={() => setScreen("home")}
          onOpenNativeBlock={() => setScreen("nativeBlock")}
        />
      ) : null}
      {!booting && screen === "nativeBlock" ? (
        <NativeBlockScreen
          onBack={() => setScreen("home")}
          onOpenSite={openSite}
        />
      ) : null}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.base,
    alignItems: "center",
    justifyContent: "center",
  },
});
