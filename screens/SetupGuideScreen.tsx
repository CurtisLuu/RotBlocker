import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SpliceBackground } from "../components/SpliceBackground";
import {
  IconBadge,
  NavRow,
  Panel,
  Reveal,
  ScreenHeader,
  type IconName,
} from "../components/Kit";
import { isNativeBlockingAvailable } from "../lib/nativeBlock";
import { colors, fonts, GUTTER } from "../theme";

type Props = {
  onBack: () => void;
  onOpenNativeBlock: () => void;
};

type GuideBlock = {
  step: string;
  icon: IconName;
  title: string;
  body: string;
  points?: string[];
  note?: string;
};

const BLOCKS: GuideBlock[] = [
  {
    step: "1",
    icon: "notifications-outline",
    title: "Keep Instagram installed",
    body: "You need the Instagram app to receive message and story notifications. RotBlocker can't receive them for you.",
  },
  {
    step: "2",
    icon: "shield-checkmark-outline",
    title: "Block the Instagram app",
    body: "Screen Time stops Instagram from opening. When you try, you'll see RotBlocker's screen instead.",
    points: [
      "Open Block the Instagram app from the home screen",
      "Allow Screen Time access when your phone asks",
      "Choose Instagram from the list",
    ],
    note: "This needs a development or production build, not Expo Go. Add your Apple Team ID first.",
  },
  {
    step: "3",
    icon: "phone-portrait-outline",
    title: "Browse from RotBlocker",
    body: "Open Instagram from the home screen. Reels are hidden, and messages, stories, and your feed work as usual.",
  },
];

export function SetupGuideScreen({ onBack, onOpenNativeBlock }: Props) {
  const nativeReady = isNativeBlockingAvailable();

  return (
    <SpliceBackground>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Setup guide" onBack={onBack} />

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Reveal>
            <Text style={styles.lead}>
              Three steps: keep the app for notifications, block it from
              opening, and browse here instead.
            </Text>
            <NavRow
              icon="shield-checkmark-outline"
              label="Block the Instagram app"
              hint={nativeReady ? undefined : "Needs a full build to work"}
              onPress={onOpenNativeBlock}
            />
          </Reveal>

          {BLOCKS.map((block, i) => (
            <Reveal key={block.step} delay={60 + i * 45}>
              <Panel>
                <View style={styles.cardHeader}>
                  <IconBadge name={block.icon} />
                  <View style={styles.cardHeadText}>
                    <Text style={styles.stepText}>Step {block.step}</Text>
                    <Text style={styles.cardTitle}>{block.title}</Text>
                  </View>
                </View>
                <Text style={styles.cardBody}>{block.body}</Text>
                {block.points?.length ? (
                  <View style={styles.points}>
                    {block.points.map((point) => (
                      <View key={point} style={styles.pointRow}>
                        <Ionicons
                          name="ellipse"
                          size={5}
                          color={colors.mint}
                          style={styles.bullet}
                        />
                        <Text style={styles.pointText}>{point}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                {block.note ? (
                  <Text style={styles.note}>{block.note}</Text>
                ) : null}
              </Panel>
            </Reveal>
          ))}

          <Reveal delay={220}>
            <NavRow
              icon="open-outline"
              label="Open Shortcuts"
              hint="Optional. Not needed if blocking works."
              tone="neutral"
              onPress={() => Linking.openURL("shortcuts://")}
            />
          </Reveal>
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
    gap: 14,
  },
  lead: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  cardHeadText: { flex: 1, gap: 1 },
  stepText: {
    fontFamily: fonts.monoMed,
    color: colors.mint,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: 16,
  },
  cardBody: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  points: { gap: 8, marginTop: 2 },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bullet: { marginTop: 7 },
  pointText: {
    flex: 1,
    fontFamily: fonts.body,
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  note: {
    fontFamily: fonts.body,
    color: colors.textFaint,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
});
