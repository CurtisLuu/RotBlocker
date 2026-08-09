import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StruckReels } from "../components/StruckReels";
import { SpliceBackground } from "../components/SpliceBackground";
import { colors, fonts } from "../theme";

type Props = {
  onFinished: () => void;
};

type Step = {
  eyebrow: string;
  title: string;
  body: string;
  points?: string[];
  showStamp?: boolean;
};

const STEPS: Step[] = [
  {
    eyebrow: "Welcome",
    title: "Cut the rot. Keep the people.",
    body: "RotBlocker is free and open source. Use Instagram for messages and friends — without losing an hour to the short-form feed.",
    showStamp: true,
    points: [
      "Filters stay on your phone",
      "No account, no tracking",
      "MIT licensed forever",
    ],
  },
  {
    eyebrow: "The deal",
    title: "Notifications from Instagram. Scrolling here.",
    body: "Delete Instagram and DM pushes die with it. Keep the app for alerts — just don’t browse there.",
    points: [
      "Native Instagram = notification inbox",
      "RotBlocker = where you open Instagram",
      "Reels get cut before they hook you",
    ],
  },
  {
    eyebrow: "Inside the app",
    title: "A filtered Instagram session",
    body: "Open Instagram loads the mobile site here. RotBlocker hides Reels (and optionally Explore) while DMs and stories stay usable.",
    points: [
      "Not Meta’s native UI — a filtered web session",
      "Home-screen toggles control the cut",
      "When Instagram redesigns, we update the filters",
    ],
  },
  {
    eyebrow: "Limit the habit",
    title: "Block native opens. Keep the pings.",
    body: "In a real iOS build, Block native apps shields Instagram with Screen Time. Apple won’t let apps create Shortcuts for you — shielding replaces that redirect.",
    points: [
      "Home → Block native apps",
      "Pick Instagram in Apple’s picker",
      "Shield opens → jump back to RotBlocker",
    ],
  },
  {
    eyebrow: "Ready",
    title: "Open Instagram on purpose.",
    body: "Use RotBlocker when you mean to. Leave native Instagram quiet except for notifications. That’s the whole product.",
  },
];

export function TutorialScreen({ onFinished }: Props) {
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  const progress = useMemo(() => STEPS.map((_, i) => i <= index), [index]);

  const goTo = (next: number) => {
    Animated.sequence([
      Animated.timing(fade, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
    // Swap content mid-fade
    setTimeout(() => setIndex(next), 120);
  };

  useEffect(() => {
    fade.setValue(1);
  }, [fade]);

  return (
    <SpliceBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <View style={styles.dots}>
            {progress.map((done, i) => (
              <View
                key={STEPS[i].eyebrow}
                style={[styles.dot, done && styles.dotActive]}
              />
            ))}
          </View>
          <Pressable onPress={onFinished} hitSlop={12}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <Animated.View style={[styles.bodyWrap, { opacity: fade }]}>
          <Text style={styles.eyebrow}>{step.eyebrow}</Text>
          {step.showStamp ? (
            <View style={styles.stampBlock}>
              <StruckReels size="lg" />
            </View>
          ) : null}
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>
          {step.points?.map((point) => (
            <View key={point} style={styles.pointRow}>
              <View style={styles.bullet} />
              <Text style={styles.point}>{point}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.footer}>
          {index > 0 ? (
            <Pressable
              onPress={() => goTo(index - 1)}
              style={({ pressed }) => [
                styles.secondary,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryText}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.secondaryPlaceholder} />
          )}
          <Pressable
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
            onPress={() => {
              if (isLast) onFinished();
              else goTo(index + 1);
            }}
          >
            <Text style={styles.primaryText}>
              {isLast ? "Get started" : "Next"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SpliceBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 28,
    paddingLeft: 36,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 16,
  },
  dots: { flexDirection: "row", gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 1,
    backgroundColor: colors.mist,
  },
  dotActive: {
    backgroundColor: colors.ink,
    width: 22,
  },
  skip: {
    fontFamily: fonts.bodyMed,
    color: colors.inkSoft,
    fontSize: 14,
  },
  bodyWrap: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
    paddingBottom: 20,
  },
  eyebrow: {
    fontFamily: fonts.bodySemi,
    color: colors.seal,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  stampBlock: { marginVertical: 4 },
  title: {
    fontFamily: fonts.displayExtra,
    color: colors.ink,
    fontSize: 34,
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  body: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 16,
    lineHeight: 24,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 2,
  },
  bullet: {
    width: 6,
    height: 6,
    marginTop: 8,
    backgroundColor: colors.stamp,
  },
  point: {
    flex: 1,
    fontFamily: fonts.bodyMed,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 16,
  },
  secondary: {
    flex: 1,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
  },
  secondaryPlaceholder: { flex: 1 },
  secondaryText: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
    fontSize: 15,
  },
  primary: {
    flex: 1.4,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: colors.seal,
  },
  primaryText: {
    fontFamily: fonts.bodySemi,
    color: colors.white,
    fontSize: 15,
  },
  pressed: { opacity: 0.85 },
});
