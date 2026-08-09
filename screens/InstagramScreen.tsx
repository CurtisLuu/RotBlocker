import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import type { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import {
  buildInstagramFilterScript,
  DEFAULT_INSTAGRAM_FILTERS,
  type InstagramFilterOptions,
} from "../filters/instagram";
import { loadInstagramFilters } from "../lib/settings";
import { colors, fonts } from "../theme";

const INSTAGRAM_URL = "https://www.instagram.com/";

function isReelsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.includes("instagram.com") &&
      (parsed.pathname.startsWith("/reels") ||
        parsed.pathname.startsWith("/reel/"))
    );
  } catch {
    return false;
  }
}

type Props = {
  onBack: () => void;
};

export function InstagramScreen({ onBack }: Props) {
  const webRef = useRef<WebView>(null);
  const [filters, setFilters] = useState<InstagramFilterOptions>(
    DEFAULT_INSTAGRAM_FILTERS
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInstagramFilters().then(setFilters);
  }, []);

  const injected = useMemo(
    () => buildInstagramFilterScript(filters),
    [filters]
  );

  useEffect(() => {
    webRef.current?.injectJavaScript(injected);
  }, [injected]);

  const onShouldStart = useCallback(
    (request: ShouldStartLoadRequest) => {
      if (
        filters.blockReelsNavigation &&
        isReelsUrl(request.url) &&
        request.navigationType === "click"
      ) {
        return false;
      }
      return true;
    },
    [filters.blockReelsNavigation]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.toolbar}>
        <Text style={styles.brandMark}>RotBlocker</Text>
        <View style={styles.tools}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <Text style={styles.toolText}>Home</Text>
          </Pressable>
          <Pressable
            onPress={() => webRef.current?.goBack()}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <Text style={styles.toolText}>Back</Text>
          </Pressable>
          <Pressable
            onPress={() => webRef.current?.reload()}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <Text style={styles.toolText}>Reload</Text>
          </Pressable>
          <Pressable
            onPress={() => webRef.current?.injectJavaScript(injected)}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <Text style={styles.toolText}>Re-apply</Text>
          </Pressable>
        </View>
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable
            style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
            onPress={() => {
              setError(null);
              setLoading(true);
              webRef.current?.reload();
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.webWrap}>
          <WebView
            ref={webRef}
            source={{ uri: INSTAGRAM_URL }}
            style={styles.web}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            javaScriptEnabled
            domStorageEnabled
            allowsBackForwardNavigationGestures
            setSupportMultipleWindows={false}
            applicationNameForUserAgent="Mobile"
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
              <ActivityIndicator color={colors.seal} />
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
    backgroundColor: colors.linen,
  },
  toolbar: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
    backgroundColor: colors.linen,
  },
  brandMark: {
    fontFamily: fonts.display,
    color: colors.ink,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  tools: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  toolBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
  },
  toolText: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 13,
  },
  webWrap: { flex: 1 },
  web: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(228,231,224,0.55)",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.linen,
  },
  error: {
    fontFamily: fonts.body,
    color: colors.ink,
    textAlign: "center",
  },
  retry: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: colors.seal,
  },
  retryText: {
    fontFamily: fonts.bodySemi,
    color: colors.white,
  },
  pressed: { opacity: 0.85 },
});
