import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StruckReels } from "../components/StruckReels";
import { SpliceBackground } from "../components/SpliceBackground";
import {
  DEFAULT_INSTAGRAM_FILTERS,
  type InstagramFilterOptions,
} from "../filters/instagram";
import { loadInstagramFilters, saveInstagramFilters } from "../lib/settings";
import { colors, fonts } from "../theme";

type ToggleKey = keyof InstagramFilterOptions;

const TOGGLES: { key: ToggleKey; label: string; hint: string }[] = [
  {
    key: "hideReelsTab",
    label: "Hide Reels tab",
    hint: "Cut the Reels icon from the nav",
  },
  {
    key: "hideReelsInFeed",
    label: "Hide Reels in feed",
    hint: "Strip Reel posts from home and explore",
  },
  {
    key: "blockReelsNavigation",
    label: "Block /reels URLs",
    hint: "Bounce away if a Reels page opens",
  },
  {
    key: "hideExplore",
    label: "Hide Explore",
    hint: "Optional — remove Explore too",
  },
];

const PILLARS = [
  {
    n: "01",
    title: "Keep Instagram",
    body: "Leave the native app installed so DM and story pushes still arrive.",
  },
  {
    n: "02",
    title: "Shield the native app",
    body: "Use Block native apps to shield Instagram with Screen Time — no Shortcuts required.",
  },
  {
    n: "03",
    title: "Browse in RotBlocker",
    body: "Open Instagram here. Filters cut Reels; DMs, stories, and feed stay.",
  },
] as const;

type Props = {
  onOpenInstagram: () => void;
  onOpenTutorial: () => void;
  onOpenSetup: () => void;
  onOpenNativeBlock: () => void;
};

export function HomeScreen({
  onOpenInstagram,
  onOpenTutorial,
  onOpenSetup,
  onOpenNativeBlock,
}: Props) {
  const [filters, setFilters] = useState<InstagramFilterOptions>(
    DEFAULT_INSTAGRAM_FILTERS
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadInstagramFilters().then((value) => {
      setFilters(value);
      setReady(true);
    });
  }, []);

  const update = useCallback(async (key: ToggleKey, value: boolean) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      void saveInstagramFilters(next);
      return next;
    });
  }, []);

  return (
    <SpliceBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.brand}>RotBlocker</Text>
          <View style={styles.thesisRow}>
            <Text style={styles.thesisLead}>Instagram with </Text>
            <StruckReels size="sm" />
            <Text style={styles.thesisLead}> cut out.</Text>
          </View>
          <Text style={styles.tagline}>
            Keep the app for notifications. Do your scrolling here.
          </Text>

          <View style={styles.rule} />

          {PILLARS.map((pillar) => (
            <View key={pillar.n} style={styles.pillar}>
              <Text style={styles.pillarN}>{pillar.n}</Text>
              <View style={styles.pillarCopy}>
                <Text style={styles.pillarTitle}>{pillar.title}</Text>
                <Text style={styles.pillarBody}>{pillar.body}</Text>
              </View>
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [styles.blockCta, pressed && styles.pressed]}
            onPress={onOpenNativeBlock}
          >
            <Text style={styles.blockCtaText}>Block native apps</Text>
            <Text style={styles.blockCtaHint}>
              Shield Instagram with Screen Time
            </Text>
          </Pressable>

          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.ghostBtn,
                pressed && styles.pressed,
              ]}
              onPress={onOpenTutorial}
            >
              <Text style={styles.ghostBtnText}>Tutorial</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.ghostBtn,
                pressed && styles.pressed,
              ]}
              onPress={onOpenSetup}
            >
              <Text style={styles.ghostBtnText}>Setup guide</Text>
            </Pressable>
          </View>

          <Text style={styles.section}>Filters</Text>
          {TOGGLES.map((item) => (
            <View key={item.key} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowHint}>{item.hint}</Text>
              </View>
              <Switch
                disabled={!ready}
                value={filters[item.key]}
                onValueChange={(value) => update(item.key, value)}
                trackColor={{ false: colors.mist, true: colors.seal }}
                thumbColor={colors.white}
              />
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
            onPress={onOpenInstagram}
          >
            <Text style={styles.ctaText}>Open Instagram</Text>
          </Pressable>

          <Text style={styles.footer}>
            On-device filters. No accounts. No tracking. MIT.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </SpliceBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 48,
    paddingLeft: 36,
  },
  brand: {
    fontFamily: fonts.displayExtra,
    color: colors.ink,
    fontSize: 40,
    letterSpacing: -1,
    lineHeight: 44,
  },
  thesisRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 10,
    gap: 4,
  },
  thesisLead: {
    fontFamily: fonts.bodyMed,
    color: colors.inkSoft,
    fontSize: 17,
    lineHeight: 24,
  },
  tagline: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 320,
  },
  rule: {
    height: 1,
    backgroundColor: colors.rule,
    marginVertical: 22,
  },
  pillar: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  pillarN: {
    fontFamily: fonts.display,
    color: colors.seal,
    fontSize: 15,
    letterSpacing: 1,
    width: 28,
    marginTop: 2,
  },
  pillarCopy: { flex: 1, gap: 4 },
  pillarTitle: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 16,
  },
  pillarBody: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  blockCta: {
    marginTop: 8,
    backgroundColor: colors.ink,
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 2,
  },
  blockCtaText: {
    fontFamily: fonts.bodySemi,
    color: colors.white,
    fontSize: 15,
  },
  blockCtaHint: {
    fontFamily: fonts.body,
    color: colors.linenDeep,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  ghostBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 4,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  ghostBtnText: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 14,
  },
  section: {
    fontFamily: fonts.display,
    color: colors.ink,
    fontSize: 20,
    letterSpacing: -0.3,
    marginTop: 20,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  rowText: { flex: 1, gap: 3 },
  rowLabel: {
    fontFamily: fonts.bodyMed,
    color: colors.ink,
    fontSize: 15,
  },
  rowHint: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  cta: {
    marginTop: 28,
    backgroundColor: colors.seal,
    borderRadius: 4,
    paddingVertical: 17,
    alignItems: "center",
  },
  ctaText: {
    fontFamily: fonts.bodySemi,
    color: colors.white,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  pressed: { opacity: 0.85 },
  footer: {
    marginTop: 20,
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    opacity: 0.8,
  },
});
