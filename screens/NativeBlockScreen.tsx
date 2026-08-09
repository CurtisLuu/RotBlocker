import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { SpliceBackground } from "../components/SpliceBackground";
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
import { colors, fonts } from "../theme";

type Props = {
  onBack: () => void;
  onOpenFilteredInstagram: () => void;
};

export function NativeBlockScreen({
  onBack,
  onOpenFilteredInstagram,
}: Props) {
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
          "RotBlocker needs Screen Time permission to shield native Instagram."
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
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <Text style={styles.backText}>Home</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Block native apps</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.lead}>
            Shield Instagram (and anything else you pick) with Apple Screen
            Time. When you open a shielded app, iOS shows RotBlocker’s block
            screen — open filtered Instagram from here instead.
          </Text>

          {!available || !blocker ? (
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>Needs a real iOS build</Text>
              <Text style={styles.calloutBody}>
                Expo Go can’t use Screen Time APIs. Build a development client
                with EAS (or Xcode on a Mac), install it on your iPhone, then
                this screen becomes one-tap blocking.
              </Text>
              <Text style={styles.calloutBody}>
                Apple also doesn’t let apps create Shortcuts automations for
                you. Native shielding replaces that redirect — no Shortcuts
                setup required once this works.
              </Text>
              <Text style={styles.codeHint}>
                npx eas build --profile development --platform ios
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Screen Time</Text>
                <Text
                  style={[
                    styles.statusValue,
                    authorized ? styles.ok : styles.warn,
                  ]}
                >
                  {authorized ? "Authorized" : "Not authorized"}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Shields</Text>
                <Text
                  style={[
                    styles.statusValue,
                    blockActive ? styles.ok : styles.warn,
                  ]}
                >
                  {blockActive
                    ? `On${selectedCount ? ` · ${selectedCount} selected` : ""}`
                    : "Off"}
                </Text>
              </View>

              {!authorized ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.primary,
                    pressed && styles.pressed,
                  ]}
                  onPress={requestAuth}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.primaryText}>
                      Allow Screen Time access
                    </Text>
                  )}
                </Pressable>
              ) : null}

              {authorized && Platform.OS === "ios" && Picker && ready ? (
                <View style={styles.pickerWrap}>
                  <Text style={styles.section}>
                    Pick apps to shield (choose Instagram)
                  </Text>
                  <Picker
                    initialSelection={selectionData || undefined}
                    theme="light"
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
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>Android</Text>
                  <Text style={styles.calloutBody}>
                    Grant Usage Access and Display over other apps, then we can
                    block Instagram’s package.
                  </Text>
                  <Pressable
                    style={styles.ghost}
                    onPress={() => blocker.openUsageStatsSettings()}
                  >
                    <Text style={styles.ghostText}>Open usage access</Text>
                  </Pressable>
                  <Pressable
                    style={styles.ghost}
                    onPress={() => blocker.openOverlaySettings()}
                  >
                    <Text style={styles.ghostText}>Open overlay settings</Text>
                  </Pressable>
                  <Pressable
                    style={styles.primary}
                    onPress={async () => {
                      blocker.setBlockedApps(["com.instagram.android"]);
                      blocker.startMonitoring();
                      setBlockActive(true);
                      await saveBlockActive(true);
                    }}
                  >
                    <Text style={styles.primaryText}>Block Instagram</Text>
                  </Pressable>
                </View>
              ) : null}

              {blockActive ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.danger,
                    pressed && styles.pressed,
                  ]}
                  onPress={clearBlocks}
                  disabled={busy}
                >
                  <Text style={styles.dangerText}>Turn shields off</Text>
                </Pressable>
              ) : null}
            </>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.secondaryCta,
              pressed && styles.pressed,
            ]}
            onPress={onOpenFilteredInstagram}
          >
            <Text style={styles.secondaryCtaText}>
              Open filtered Instagram
            </Text>
          </Pressable>

          <Pressable
            style={styles.linkish}
            onPress={() => Linking.openURL("shortcuts://")}
          >
            <Text style={styles.linkishText}>
              Optional: open Shortcuts for a manual redirect
            </Text>
          </Pressable>

          <Text style={styles.footer}>
            Privacy note: iOS only gives RotBlocker opaque tokens for apps you
            pick — we never see Instagram’s private data. Notifications can
            still arrive from the native app while it’s shielded.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </SpliceBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingLeft: 28,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  backText: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 13,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.display,
    color: colors.ink,
    fontSize: 18,
  },
  headerSpacer: { width: 64 },
  container: {
    paddingHorizontal: 24,
    paddingLeft: 36,
    paddingTop: 18,
    paddingBottom: 48,
    gap: 14,
  },
  lead: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  callout: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 4,
    padding: 16,
    gap: 10,
  },
  calloutTitle: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 16,
  },
  calloutBody: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  codeHint: {
    fontFamily: fonts.bodyMed,
    color: colors.seal,
    fontSize: 12,
    lineHeight: 18,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  statusLabel: {
    fontFamily: fonts.bodyMed,
    color: colors.ink,
    fontSize: 14,
  },
  statusValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
  },
  ok: { color: colors.seal },
  warn: { color: colors.stamp },
  section: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 14,
    marginBottom: 8,
  },
  pickerWrap: { gap: 8 },
  picker: {
    height: 420,
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
  },
  primary: {
    backgroundColor: colors.seal,
    borderRadius: 4,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryText: {
    fontFamily: fonts.bodySemi,
    color: colors.white,
    fontSize: 15,
  },
  ghost: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  ghostText: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 14,
  },
  danger: {
    borderWidth: 1.5,
    borderColor: colors.stamp,
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.stampWash,
  },
  dangerText: {
    fontFamily: fonts.bodySemi,
    color: colors.stamp,
    fontSize: 15,
  },
  secondaryCta: {
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 4,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  secondaryCtaText: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 15,
  },
  linkish: { paddingVertical: 8, alignItems: "center" },
  linkishText: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 13,
    textDecorationLine: "underline",
  },
  footer: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 4,
  },
  pressed: { opacity: 0.85 },
});
