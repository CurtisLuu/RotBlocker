import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import WebView from "react-native-webview";
import type { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { Button } from "../components/Kit";
import type { FilteredSite } from "../lib/sites";
import { colors, fonts, radius } from "../theme";

type Props<T extends Record<string, boolean>> = {
  /** Which site to open, and what to hide on it. See `lib/sites.ts`. */
  site: FilteredSite<T>;
  onBack: () => void;
};

/** Compact chip for the browser chrome — smaller than a Kit Button on purpose. */
function Chip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
    >
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

/**
 * The in-app browser: one site's mobile web, with that site's filter script
 * injected before the page loads and again on every load and settings change.
 */
export function FilteredBrowserScreen<T extends Record<string, boolean>>({
  site,
  onBack,
}: Props<T>) {
  const webRef = useRef<WebView>(null);
  // Starts on the defaults so the script is ready to inject before the stored
  // settings come back; the real ones land a tick later and re-inject.
  const [filters, setFilters] = useState<T>(site.defaults);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    site.load().then(setFilters);
  }, [site]);

  const injected = useMemo(
    () => site.buildScript(filters),
    [site, filters]
  );

  useEffect(() => {
    webRef.current?.injectJavaScript(injected);
  }, [injected]);

  const onShouldStart = useCallback(
    (request: ShouldStartLoadRequest) => {
      if (
        request.navigationType === "click" &&
        site.blocksUrl(request.url, filters)
      ) {
        return false;
      }
      return true;
    },
    [site, filters]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.toolbar}>
        <View style={styles.statusLine}>
          <Ionicons name="eye-off-outline" size={13} color={colors.mint} />
          <Text style={styles.statusText}>{site.hiddenLabel}</Text>
        </View>

        <View style={styles.tools}>
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            hitSlop={8}
            style={({ pressed }) => [styles.home, pressed && styles.chipPressed]}
          >
            <Text style={styles.chevron}>←</Text>
            <Text style={styles.homeText}>Home</Text>
          </Pressable>
          <View style={styles.toolsRight}>
            <Chip label="Back" onPress={() => webRef.current?.goBack()} />
            <Chip label="Reload" onPress={() => webRef.current?.reload()} />
            <Chip
              label="Re-apply"
              onPress={() => webRef.current?.injectJavaScript(injected)}
            />
          </View>
        </View>
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorLabel}>Couldn’t load {site.name}</Text>
          <Text style={styles.error}>{error}</Text>
          <Button
            label="Retry"
            tone="primary"
            style={styles.retry}
            onPress={() => {
              setError(null);
              setLoading(true);
              webRef.current?.reload();
            }}
          />
        </View>
      ) : (
        <View style={styles.webWrap}>
          <WebView
            ref={webRef}
            source={{ uri: site.url }}
            style={styles.web}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            javaScriptEnabled
            domStorageEnabled
            allowsBackForwardNavigationGestures
            setSupportMultipleWindows={false}
            applicationNameForUserAgent="Mobile"
            // iOS picks up dark from the app's interface style; Android needs
            // telling. Without this you leave a dark app for a white page.
            forceDarkOn
            androidLayerType="hardware"
            // Video plays in the feed rather than launching the OS player.
            // Without allowsInlineMediaPlayback, iOS takes any <video> that
            // starts and throws it fullscreen, however the page is marked up.
            allowsInlineMediaPlayback
            allowsFullscreenVideo={false}
            allowsPictureInPictureMediaPlayback={false}
            mediaPlaybackRequiresUserAction={false}
            injectedJavaScriptBeforeContentLoaded={injected}
            injectedJavaScript={injected}
            onShouldStartLoadWithRequest={onShouldStart}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => {
              setLoading(false);
              webRef.current?.injectJavaScript(injected);
            }}
            onError={(event) => {
              setLoading(false);
              setError(event.nativeEvent.description || "Failed to load");
            }}
          />
          {loading && (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.mint} />
              <Text style={styles.loadingText}>Applying filters…</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.base,
  },
  toolbar: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    backgroundColor: colors.base,
  },
  statusLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statusText: {
    fontFamily: fonts.bodyMed,
    color: colors.textMuted,
    fontSize: 12,
  },
  tools: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  toolsRight: { flexDirection: "row", gap: 7 },
  home: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingRight: 8,
  },
  chevron: {
    fontFamily: fonts.mono,
    color: colors.mint,
    fontSize: 14,
  },
  homeText: {
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: 14,
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
  },
  chipPressed: { backgroundColor: colors.panelHi },
  chipText: {
    fontFamily: fonts.monoMed,
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  webWrap: { flex: 1, backgroundColor: colors.base },
  web: {
    flex: 1,
    backgroundColor: colors.base,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.base,
  },
  loadingText: {
    fontFamily: fonts.mono,
    color: colors.textFaint,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 28,
    backgroundColor: colors.base,
  },
  errorLabel: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 20,
    letterSpacing: -0.4,
  },
  error: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  retry: { marginTop: 8, minWidth: 160 },
});
