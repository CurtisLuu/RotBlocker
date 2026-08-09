import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import { useFonts } from "expo-font";
import {
  Syne_700Bold,
  Syne_800ExtraBold,
} from "@expo-google-fonts/syne";
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from "@expo-google-fonts/ibm-plex-sans";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HomeScreen } from "./screens/HomeScreen";
import { InstagramScreen } from "./screens/InstagramScreen";
import { NativeBlockScreen } from "./screens/NativeBlockScreen";
import { SetupGuideScreen } from "./screens/SetupGuideScreen";
import { TutorialScreen } from "./screens/TutorialScreen";
import { getNativeBlockModule } from "./lib/nativeBlock";
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
  | "setup"
  | "nativeBlock";

function pathFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = Linking.parse(url);
    const path = parsed.path ?? "";
    const host = parsed.hostname ?? "";
    if (path.includes("instagram") || host === "instagram") return "instagram";
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
    Syne_700Bold,
    Syne_800ExtraBold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
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
      if (target === "instagram") setScreen("instagram");
      if (target === "nativeBlock") setScreen("nativeBlock");
    };

    Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener("url", ({ url }) => handle(url));
    return () => sub.remove();
  }, []);

  // When user taps "Open RotBlocker" on the iOS shield notification
  useEffect(() => {
    const blocker = getNativeBlockModule();
    if (!blocker?.addPendingUnlockListener) return;

    const sub = blocker.addPendingUnlockListener(() => {
      setScreen("instagram");
    });
    return () => {
      // API may return subscription-like object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sub as any)?.remove?.();
    };
  }, []);

  const finishTutorial = async () => {
    await markTutorialCompleted();
    setScreen("home");
  };

  const booting = !fontsLoaded || screen === "loading";

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {booting ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.seal} />
        </View>
      ) : null}
      {!booting && screen === "tutorial" ? (
        <TutorialScreen onFinished={finishTutorial} />
      ) : null}
      {!booting && screen === "home" ? (
        <HomeScreen
          onOpenInstagram={() => setScreen("instagram")}
          onOpenTutorial={() => setScreen("tutorial")}
          onOpenSetup={() => setScreen("setup")}
          onOpenNativeBlock={() => setScreen("nativeBlock")}
        />
      ) : null}
      {!booting && screen === "instagram" ? (
        <InstagramScreen onBack={() => setScreen("home")} />
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
          onOpenFilteredInstagram={() => setScreen("instagram")}
        />
      ) : null}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.linen,
    alignItems: "center",
    justifyContent: "center",
  },
});
