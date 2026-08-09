import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SpliceBackground } from "../components/SpliceBackground";
import { isNativeBlockingAvailable } from "../lib/nativeBlock";
import { colors, fonts } from "../theme";

type Props = {
  onBack: () => void;
  onOpenNativeBlock: () => void;
};

type GuideBlock = {
  step: string;
  title: string;
  body: string;
  actions?: { label: string; detail: string }[];
  note?: string;
};

const BLOCKS: GuideBlock[] = [
  {
    step: "01",
    title: "Keep Instagram installed",
    body: "Don’t delete it. You need the native app for DM and story pushes. RotBlocker can’t receive Meta’s notifications.",
    actions: [
      { label: "Do", detail: "Leave Instagram on your phone for alerts only." },
      {
        label: "Don’t",
        detail: "Don’t open it to scroll — that’s RotBlocker’s job.",
      },
    ],
  },
  {
    step: "02",
    title: "Block native Instagram in-app",
    body: "RotBlocker can shield Instagram with Apple Screen Time. When you open Instagram, iOS shows our shield — tap through to filtered Instagram here. This replaces the old Shortcuts redirect.",
    actions: [
      {
        label: "Open",
        detail: "Home → Block native apps.",
      },
      {
        label: "Allow",
        detail: "Grant Screen Time access when iOS asks.",
      },
      {
        label: "Pick",
        detail: "Select Instagram in the system picker. Shields apply immediately.",
      },
    ],
    note: "Requires a development or production build — not Expo Go. Set your Apple Team ID in app.json first.",
  },
  {
    step: "03",
    title: "About Shortcuts",
    body: "Apple does not let apps create Shortcuts automations for you. Native shielding is the automatic path. Shortcuts remain an optional manual backup.",
    actions: [
      {
        label: "Optional",
        detail:
          "Automation → App → Instagram Is Opened → Open App → RotBlocker.",
      },
    ],
  },
  {
    step: "04",
    title: "Browse in RotBlocker",
    body: "Open Instagram from RotBlocker’s home screen. Filters cut Reels while DMs and stories stay usable.",
  },
];

export function SetupGuideScreen({ onBack, onOpenNativeBlock }: Props) {
  const nativeReady = isNativeBlockingAvailable();

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
          <Text style={styles.headerTitle}>Setup</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.lead}>
            Goal: pings from Instagram, scrolling only in RotBlocker.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
            onPress={onOpenNativeBlock}
          >
            <Text style={styles.linkBtnText}>
              {nativeReady
                ? "Open Block native apps"
                : "Block native apps (needs real build)"}
            </Text>
          </Pressable>

          {BLOCKS.map((block) => (
            <View key={block.step} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.stepText}>{block.step}</Text>
                <Text style={styles.cardTitle}>{block.title}</Text>
              </View>
              <Text style={styles.cardBody}>{block.body}</Text>
              {block.actions?.map((action) => (
                <View key={action.label + action.detail} style={styles.actionRow}>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                  <Text style={styles.actionDetail}>{action.detail}</Text>
                </View>
              ))}
              {block.note ? <Text style={styles.note}>{block.note}</Text> : null}
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [
              styles.linkBtnSecondary,
              pressed && styles.pressed,
            ]}
            onPress={() => Linking.openURL("shortcuts://")}
          >
            <Text style={styles.linkBtnSecondaryText}>
              Open Shortcuts (optional)
            </Text>
          </Pressable>

          <Text style={styles.footer}>
            After shielding: open Instagram through RotBlocker. Native stays for
            notifications.
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
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 4,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
  },
  stepText: {
    fontFamily: fonts.display,
    color: colors.seal,
    fontSize: 14,
    letterSpacing: 1,
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 16,
  },
  cardBody: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  actionRow: { gap: 2, paddingTop: 2 },
  actionLabel: {
    fontFamily: fonts.bodySemi,
    color: colors.stamp,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  actionDetail: {
    fontFamily: fonts.body,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  linkBtn: {
    backgroundColor: colors.seal,
    borderRadius: 4,
    paddingVertical: 15,
    alignItems: "center",
  },
  linkBtnText: {
    fontFamily: fonts.bodySemi,
    color: colors.white,
    fontSize: 15,
  },
  linkBtnSecondary: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 4,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  linkBtnSecondaryText: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 15,
  },
  pressed: { opacity: 0.85 },
  footer: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 8,
  },
});
