import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StruckReels } from "../components/StruckReels";
import { SpliceBackground } from "../components/SpliceBackground";
import {
  Button,
  Eyebrow,
  IconBadge,
  NavRow,
  Panel,
  Reveal,
  type IconName,
} from "../components/Kit";
import {
  INSTAGRAM_SITE,
  YOUTUBE_SITE,
  type FilteredSite,
  type SiteKey,
} from "../lib/sites";
import type { InstagramFilterOptions } from "../filters/instagram";
import type { YouTubeFilterOptions } from "../filters/youtube";
import { colors, fonts, GUTTER } from "../theme";

type ToggleKey = keyof InstagramFilterOptions;

const TOGGLES: { key: ToggleKey; label: string; icon: IconName }[] = [
  { key: "hideReelsTab", label: "Reels tab", icon: "albums-outline" },
  { key: "hideReelsInFeed", label: "Reels in your feed", icon: "film-outline" },
  { key: "blockReelsNavigation", label: "Links to Reels", icon: "link-outline" },
  { key: "hideExplore", label: "Explore tab", icon: "compass-outline" },
  { key: "hidePosts", label: "Posts in your feed", icon: "images-outline" },
  { key: "hideStories", label: "Stories", icon: "aperture-outline" },
];

/** Three steps, as a strip of icons rather than three paragraphs. */
const STEPS: { icon: IconName; label: string }[] = [
  { icon: "phone-portrait-outline", label: "Keep the app" },
  { icon: "shield-checkmark-outline", label: "Block it" },
  { icon: "eye-outline", label: "Browse here" },
];

type Props = {
  onOpenSite: (site: SiteKey) => void;
  onOpenTutorial: () => void;
  onOpenSetup: () => void;
  onOpenNativeBlock: () => void;
};

/** One site's toggles. Mint means the thing is currently hidden. */
function FilterPanel<T extends Record<string, boolean>>({
  site,
  filters,
  ready,
  onToggle,
}: {
  site: FilteredSite<T>;
  filters: T;
  ready: boolean;
  onToggle: (key: keyof T & string, value: boolean) => void;
}) {
  return (
    <Panel style={styles.filterPanel}>
      {site.toggles.map((item, i) => (
        <View key={item.key} style={[styles.row, i > 0 && styles.rowDivided]}>
          <Ionicons
            name={item.icon}
            size={19}
            color={filters[item.key] ? colors.mint : colors.textFaint}
          />
          <Text style={styles.rowLabel}>{item.label}</Text>
          <Switch
            disabled={!ready}
            value={filters[item.key]}
            onValueChange={(value) => onToggle(item.key, value)}
            trackColor={{ false: colors.lineStrong, true: colors.mint }}
            thumbColor={filters[item.key] ? colors.base : colors.text}
            ios_backgroundColor={colors.lineStrong}
          />
        </View>
      ))}
    </Panel>
  );
}

export function HomeScreen({
  onOpenSite,
  onOpenTutorial,
  onOpenSetup,
  onOpenNativeBlock,
}: Props) {
  const [instagram, setInstagram] = useState<InstagramFilterOptions>(
    INSTAGRAM_SITE.defaults
  );
  const [youtube, setYoutube] = useState<YouTubeFilterOptions>(
    YOUTUBE_SITE.defaults
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([INSTAGRAM_SITE.load(), YOUTUBE_SITE.load()]).then(
      ([ig, yt]) => {
        setInstagram(ig);
        setYoutube(yt);
        setReady(true);
      }
    );
  }, []);

  const updateInstagram = useCallback(
    (key: keyof InstagramFilterOptions & string, value: boolean) => {
      setInstagram((prev) => {
        const next = { ...prev, [key]: value };
        void INSTAGRAM_SITE.save(next);
        return next;
      });
    },
    []
  );

  const updateYoutube = useCallback(
    (key: keyof YouTubeFilterOptions & string, value: boolean) => {
      setYoutube((prev) => {
        const next = { ...prev, [key]: value };
        void YOUTUBE_SITE.save(next);
        return next;
      });
    },
    []
  );

  const total = INSTAGRAM_SITE.toggles.length + YOUTUBE_SITE.toggles.length;
  const hiddenCount = useMemo(
    () =>
      INSTAGRAM_SITE.toggles.filter((item) => instagram[item.key]).length +
      YOUTUBE_SITE.toggles.filter((item) => youtube[item.key]).length,
    [instagram, youtube]
  );

  return (
    <SpliceBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Reveal>
            <Text style={styles.brand}>RotBlocker</Text>
            <View style={styles.thesisRow}>
              <Text style={styles.thesisLead}>Instagram without </Text>
              <StruckReels size="sm" style={styles.inlineMark} />
            </View>
            <View style={styles.thesisRow}>
              <Text style={styles.thesisLead}>YouTube without </Text>
              <StruckReels size="sm" word="SHORTS" style={styles.inlineMark} />
            </View>
          </Reveal>

          <Reveal delay={70}>
            <Button
              label="Open Instagram"
              tone="primary"
              onPress={() => onOpenSite("instagram")}
              style={styles.heroCta}
            />
            <Button
              label="Open YouTube"
              tone="secondary"
              onPress={() => onOpenSite("youtube")}
              style={styles.secondCta}
            />
            <View style={styles.ctaMetaRow}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={colors.mint}
              />
              <Text style={styles.ctaMeta}>
                {ready
                  ? `${hiddenCount} of ${total} things hidden`
                  : "Loading your settings"}
              </Text>
            </View>
          </Reveal>

          <Reveal delay={120} style={styles.block}>
            <View style={styles.steps}>
              {STEPS.map((step, i) => (
                <View key={step.label} style={styles.step}>
                  <IconBadge name={step.icon} size="sm" />
                  <Text style={styles.stepLabel}>{step.label}</Text>
                  {i < STEPS.length - 1 ? (
                    <View style={styles.stepLink} />
                  ) : null}
                </View>
              ))}
            </View>
          </Reveal>

          <Reveal delay={170} style={styles.block}>
            <NavRow
              icon="shield-checkmark-outline"
              label="Block apps on your phone"
              hint="Instagram, TikTok, YouTube, or anything else"
              onPress={onOpenNativeBlock}
            />
          </Reveal>

          <Reveal delay={220} style={styles.block}>
            <Eyebrow>Hidden on Instagram</Eyebrow>
            <FilterPanel
              site={INSTAGRAM_SITE}
              filters={instagram}
              ready={ready}
              onToggle={updateInstagram}
            />
          </Reveal>

          <Reveal delay={250} style={styles.block}>
            <Eyebrow>Hidden on YouTube</Eyebrow>
            <FilterPanel
              site={YOUTUBE_SITE}
              filters={youtube}
              ready={ready}
              onToggle={updateYoutube}
            />
            <Text style={styles.panelNote}>
              Everything else on YouTube works as usual. A link to a Short
              opens as a normal video, without the swipe feed.
            </Text>
          </Reveal>

          <Reveal delay={280} style={styles.block}>
            <Eyebrow tone="splice">TikTok</Eyebrow>
            <Panel tone="notice">
              <Text style={styles.panelBody}>
                TikTok is short video the whole way through, so there is no
                filtered version of it to browse. RotBlocker blocks it instead.
              </Text>
            </Panel>
            <NavRow
              icon="logo-tiktok"
              label="Block TikTok"
              hint="Same list as the other apps"
              tone="splice"
              onPress={onOpenNativeBlock}
            />
          </Reveal>

          <Reveal delay={310} style={styles.block}>
            <NavRow
              icon="help-circle-outline"
              label="How it works"
              tone="neutral"
              onPress={onOpenTutorial}
            />
            <NavRow
              icon="settings-outline"
              label="Setup guide"
              tone="neutral"
              onPress={onOpenSetup}
            />
          </Reveal>

          <Text style={styles.footer}>
            Everything runs on your device. No account, no tracking.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </SpliceBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    paddingRight: 26,
    paddingLeft: GUTTER,
    paddingTop: 14,
    paddingBottom: 52,
  },
  brand: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 34,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  thesisRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 6,
  },
  /** Drops the mark onto the baseline of the sentence it sits in. */
  inlineMark: { transform: [{ translateY: 2 }] },
  thesisLead: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 24,
  },
  heroCta: { marginTop: 22 },
  secondCta: { marginTop: 10 },
  ctaMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },
  ctaMeta: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 13,
  },
  block: { marginTop: 22, gap: 10 },
  steps: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  step: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  stepLabel: {
    fontFamily: fonts.bodyMed,
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  /** Hairline joining the step tiles, so they read as a sequence. */
  stepLink: {
    position: "absolute",
    top: 16,
    left: "68%",
    right: "-32%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  filterPanel: { padding: 0, gap: 0 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  rowDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.bodyMed,
    color: colors.text,
    fontSize: 15,
  },
  panelNote: {
    fontFamily: fonts.body,
    color: colors.textFaint,
    fontSize: 13,
    lineHeight: 19,
  },
  panelBody: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 26,
    fontFamily: fonts.body,
    color: colors.textFaint,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
});
