import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SpliceBackground } from "../components/SpliceBackground";
import {
  Button,
  Eyebrow,
  NavRow,
  Panel,
  Reveal,
  ScreenHeader,
} from "../components/Kit";
import {
  getNativeBlockModule,
  isNativeBlockingAvailable,
} from "../lib/nativeBlock";
import {
  loadBlockActive,
  loadNativeSelection,
  saveBlockActive,
  saveNativeSelection,
} from "../lib/settings";
import type { SiteKey } from "../lib/sites";
import { colors, fonts, GUTTER, radius } from "../theme";

type Props = {
  onBack: () => void;
  onOpenSite: (site: SiteKey) => void;
};

/**
 * Android has no picker, so the list is fixed. Instagram and YouTube are
 * blocked because Please Focus! can show you a filtered version of both; TikTok
 * is blocked because there is nothing worth showing.
 */
const ANDROID_BLOCKED_APPS = [
  "com.instagram.android",
  // TikTok ships under two ids depending on the region it was installed from.
  "com.zhiliaoapp.musically",
  "com.ss.android.ugc.trill",
  "com.google.android.youtube",
];

/** Plain-language status, with the icon carrying the on/off state. */
function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <View style={styles.statusRow}>
      <Ionicons
        name={ok ? "checkmark-circle" : "ellipse-outline"}
        size={19}
        color={ok ? colors.mint : colors.textFaint}
      />
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusValue, ok ? styles.ok : styles.warn]}>
        {value}
      </Text>
    </View>
  );
}

export function NativeBlockScreen({ onBack, onOpenSite }: Props) {
  const available = isNativeBlockingAvailable();
  const blocker = available ? getNativeBlockModule() : null;

  const [authorized, setAuthorized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectionData, setSelectionData] = useState("");
  const [blockActive, setBlockActive] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [sel, active] = await Promise.all([
        loadNativeSelection(),
        loadBlockActive(),
      ]);
      setSelectionData(sel);
      setBlockActive(active);
      setReady(true);

      if (!blocker) return;
      try {
        const status = await blocker.getPermissionStatus();
        setAuthorized(Boolean(status.allGranted));
      } catch {
        setAuthorized(false);
      }
    })();
  }, [blocker]);

  const requestAuth = useCallback(async () => {
    if (!blocker) return;
    setBusy(true);
    try {
      const result = await blocker.requestPermissions();
      setAuthorized(Boolean(result.allGranted));
      if (!result.allGranted) {
        Alert.alert(
          "Screen Time access needed",
          "Please Focus! needs Screen Time permission to block apps on this phone."
        );
      }
    } catch (e) {
      Alert.alert(
        "Couldn’t authorize",
        e instanceof Error ? e.message : "Unknown error"
      );
    } finally {
      setBusy(false);
    }
  }, [blocker]);

  const clearBlocks = useCallback(async () => {
    if (!blocker) return;
    setBusy(true);
    try {
      await blocker.clearAllBlocks();
      setBlockActive(false);
      await saveBlockActive(false);
    } catch (e) {
      Alert.alert(
        "Couldn’t clear blocks",
        e instanceof Error ? e.message : "Unknown error"
      );
    } finally {
      setBusy(false);
    }
  }, [blocker]);

  const Picker =
    blocker && authorized
      ? // FamilyActivityPickerView is iOS-only native view
        blocker.FamilyActivityPickerView
      : null;

  return (
    <SpliceBackground>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Block apps" onBack={onBack} />

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Reveal>
            <Text style={styles.lead}>
              Use Screen Time to stop an app from opening. When you try to open
              it, you’ll see the Please Focus! screen instead. Instagram and YouTube
              are still there to browse here, filtered. TikTok isn’t — it’s
              short video the whole way through, so blocking is all Please Focus!
              does with it.
            </Text>
          </Reveal>

          {!available || !blocker ? (
            <Reveal delay={60}>
              <Panel tone="notice">
                <Eyebrow tone="splice">Not available in Expo Go</Eyebrow>
                <Text style={styles.calloutBody}>
                  Screen Time can only be used by a full build of the app. Build
                  a development version and install it on your iPhone, and
                  blocking becomes a single tap here.
                </Text>
                <View style={styles.code}>
                  <Text style={styles.codeText}>
                    npx eas build --profile development --platform ios
                  </Text>
                </View>
              </Panel>
            </Reveal>
          ) : (
            <Reveal delay={60} style={styles.stack}>
              <Panel style={styles.statusPanel}>
                <StatusRow
                  label="Screen Time access"
                  value={authorized ? "Allowed" : "Not allowed yet"}
                  ok={authorized}
                />
                <View style={styles.statusDivider} />
                <StatusRow
                  label="Blocking"
                  value={
                    blockActive
                      ? selectedCount
                        ? `On · ${selectedCount} app${selectedCount === 1 ? "" : "s"}`
                        : "On"
                      : "Off"
                  }
                  ok={blockActive}
                />
              </Panel>

              {!authorized ? (
                <Button
                  label="Allow Screen Time access"
                  tone="primary"
                  onPress={requestAuth}
                  busy={busy}
                />
              ) : null}

              {authorized && Platform.OS === "ios" && Picker && ready ? (
                <View style={styles.pickerWrap}>
                  <Eyebrow>Choose what to block</Eyebrow>
                  <Text style={styles.pickerHint}>
                    Pick any app in the list — Instagram, TikTok, YouTube, or
                    anything else. Blocking starts as soon as you choose.
                  </Text>
                  <Picker
                    initialSelection={selectionData || undefined}
                    theme="dark"
                    style={styles.picker}
                    onSelectionChange={async (event) => {
                      setSelectionData(event.selectionData);
                      setSelectedCount(event.totalApps + event.totalCategories);
                      await saveNativeSelection(event.selectionData);
                      try {
                        if (event.items.length > 0) {
                          await blocker.setBlockConfiguration({
                            blockedItems: event.items,
                            isActive: true,
                          });
                          setBlockActive(true);
                          await saveBlockActive(true);
                        } else {
                          await blocker.clearAllBlocks();
                          setBlockActive(false);
                          await saveBlockActive(false);
                        }
                      } catch (e) {
                        Alert.alert(
                          "Couldn’t apply block",
                          e instanceof Error ? e.message : "Unknown error"
                        );
                      }
                    }}
                  />
                </View>
              ) : null}

              {authorized && Platform.OS === "android" && blocker ? (
                <Panel style={styles.stack}>
                  <Eyebrow>Android</Eyebrow>
                  <Text style={styles.calloutBody}>
                    Android has no app picker, so Please Focus! blocks a fixed
                    list: Instagram, TikTok and YouTube. Grant both permissions
                    below, then turn blocking on.
                  </Text>
                  <Button
                    label="Open usage access"
                    tone="quiet"
                    onPress={() => blocker.openUsageStatsSettings()}
                  />
                  <Button
                    label="Open overlay settings"
                    tone="quiet"
                    onPress={() => blocker.openOverlaySettings()}
                  />
                  <Button
                    label="Block Instagram, TikTok and YouTube"
                    tone="primary"
                    onPress={async () => {
                      blocker.setBlockedApps(ANDROID_BLOCKED_APPS);
                      blocker.startMonitoring();
                      setBlockActive(true);
                      await saveBlockActive(true);
                    }}
                  />
                </Panel>
              ) : null}

              {blockActive ? (
                <Button
                  label="Turn blocking off"
                  tone="danger"
                  onPress={clearBlocks}
                  busy={busy}
                />
              ) : null}
            </Reveal>
          )}

          <Reveal delay={110} style={styles.stack}>
            <NavRow
              icon="logo-instagram"
              label="Open Instagram here"
              hint="Reels hidden"
              onPress={() => onOpenSite("instagram")}
            />
            <NavRow
              icon="logo-youtube"
              label="Open YouTube here"
              hint="Shorts hidden"
              onPress={() => onOpenSite("youtube")}
            />
            <Pressable
              style={styles.linkish}
              onPress={() => Linking.openURL("shortcuts://")}
              accessibilityRole="link"
            >
              <Text style={styles.linkishText}>
                Open Shortcuts (optional)
              </Text>
            </Pressable>
          </Reveal>

          <Text style={styles.footer}>
            Your phone only tells Please Focus! which apps you picked, never
            what’s in them. Notifications still arrive while an app is blocked.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </SpliceBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    paddingRight: 24,
    paddingLeft: GUTTER,
    paddingTop: 18,
    paddingBottom: 52,
    gap: 16,
  },
  stack: { gap: 12 },
  lead: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  calloutBody: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  code: {
    backgroundColor: colors.well,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  codeText: {
    fontFamily: fonts.mono,
    color: colors.mint,
    fontSize: 12,
    lineHeight: 18,
  },
  statusPanel: { padding: 0, gap: 0 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  statusDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  statusLabel: {
    flex: 1,
    fontFamily: fonts.bodyMed,
    color: colors.text,
    fontSize: 15,
  },
  statusValue: {
    fontFamily: fonts.bodyMed,
    fontSize: 14,
  },
  ok: { color: colors.mint },
  warn: { color: colors.splice },
  pickerWrap: { gap: 6 },
  pickerHint: {
    fontFamily: fonts.body,
    color: colors.textFaint,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
  },
  picker: {
    height: 420,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
  },
  linkish: { paddingVertical: 10, alignItems: "center" },
  linkishText: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 13,
    textDecorationLine: "underline",
  },
  footer: {
    fontFamily: fonts.body,
    color: colors.textFaint,
    fontSize: 13,
    lineHeight: 20,
  },
});
