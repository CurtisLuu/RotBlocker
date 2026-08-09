import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, radius } from "../theme";

export type IconName = ComponentProps<typeof Ionicons>["name"];

/* ------------------------------------------------------------------ Reveal */

/**
 * Entrance for a block of content: lift and fade, staggered by index.
 * Motion here says "the bench is being laid out" — it runs once, on mount,
 * and never on interaction.
 */
export function Reveal({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 340,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [delay, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ Button */

type ButtonTone = "primary" | "secondary" | "quiet" | "danger";

export function Button({
  label,
  hint,
  tone = "secondary",
  onPress,
  disabled,
  busy,
  style,
}: {
  label: string;
  hint?: string;
  tone?: ButtonTone;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled || busy) }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        btn.base,
        btn[tone],
        pressed && btnPressed[tone],
        (disabled || busy) && btn.disabled,
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator
          color={tone === "primary" ? colors.onMint : colors.text}
        />
      ) : (
        <>
          <Text style={[btn.label, btnLabel[tone]]}>{label}</Text>
          {hint ? (
            <Text style={[btn.hint, tone === "primary" && btn.hintOnMint]}>
              {hint}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const btn = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderWidth: 1,
    minHeight: 48,
  },
  primary: {
    backgroundColor: colors.mint,
    borderColor: colors.mint,
  },
  secondary: {
    backgroundColor: colors.panel,
    borderColor: colors.lineStrong,
  },
  quiet: {
    backgroundColor: "transparent",
    borderColor: colors.line,
  },
  danger: {
    backgroundColor: colors.spliceDim,
    borderColor: colors.splice,
  },
  disabled: { opacity: 0.45 },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
  hintOnMint: { color: "rgba(4,18,12,0.7)" },
});

const btnLabel = StyleSheet.create({
  primary: { color: colors.onMint },
  secondary: { color: colors.text },
  quiet: { color: colors.textMuted },
  danger: { color: colors.splice },
});

const btnPressed = StyleSheet.create({
  primary: { backgroundColor: "#52A183", borderColor: "#52A183" },
  secondary: { backgroundColor: colors.panelHi, borderColor: colors.textFaint },
  quiet: { backgroundColor: colors.panel },
  danger: { backgroundColor: "#3A1E15" },
});

/* ------------------------------------------------------------------- Panel */

export function Panel({
  children,
  style,
  tone = "default",
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: "default" | "notice";
}) {
  return (
    <View style={[panel.base, tone === "notice" && panel.notice, style]}>
      {children}
    </View>
  );
}

const panel = StyleSheet.create({
  base: {
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 10,
  },
  notice: {
    borderColor: colors.lineStrong,
    borderLeftWidth: 3,
    borderLeftColor: colors.splice,
  },
});

/* ----------------------------------------------------------------- Eyebrow */

/**
 * A section label. Plain sentence case rather than tracked-out uppercase mono:
 * the caps read as a system readout, which is the wrong register for a heading
 * that's just telling someone what the next few rows are.
 */
export function Eyebrow({
  children,
  tone = "mint",
}: {
  children: string;
  tone?: "mint" | "splice" | "faint";
}) {
  return (
    <Text
      style={[
        eyebrow.base,
        tone === "splice" && { color: colors.splice },
        tone === "faint" && { color: colors.textFaint },
      ]}
    >
      {children}
    </Text>
  );
}

const eyebrow = StyleSheet.create({
  base: {
    fontFamily: fonts.bodySemi,
    color: colors.mint,
    fontSize: 14,
  },
});

/* --------------------------------------------------------------- IconBadge */

/** An icon on a tinted tile. Carries meaning that would otherwise be a label. */
export function IconBadge({
  name,
  tone = "mint",
  size = "md",
}: {
  name: IconName;
  tone?: "mint" | "splice" | "neutral";
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "lg" ? 52 : size === "sm" ? 32 : 40;
  const glyph = size === "lg" ? 26 : size === "sm" ? 17 : 20;
  const color =
    tone === "splice"
      ? colors.splice
      : tone === "neutral"
        ? colors.textMuted
        : colors.mint;
  const bg =
    tone === "splice"
      ? colors.spliceDim
      : tone === "neutral"
        ? colors.panelHi
        : colors.mintDim;

  return (
    <View
      style={[
        badge.wrap,
        { width: box, height: box, borderRadius: radius.lg, backgroundColor: bg },
      ]}
    >
      <Ionicons name={name} size={glyph} color={color} />
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});

/* ------------------------------------------------------------------ NavRow */

/**
 * A tappable list row: icon, label, chevron. Replaces the stack of full-width
 * buttons that made every screen read like a wall of calls to action.
 */
export function NavRow({
  icon,
  label,
  hint,
  tone = "neutral",
  onPress,
}: {
  icon: IconName;
  label: string;
  hint?: string;
  tone?: "mint" | "splice" | "neutral";
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [row.wrap, pressed && row.pressed]}
    >
      <IconBadge name={icon} tone={tone} />
      <View style={row.copy}>
        <Text style={row.label}>{label}</Text>
        {hint ? <Text style={row.hint}>{hint}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.textFaint} />
    </Pressable>
  );
}

const row = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
  },
  pressed: { backgroundColor: colors.panelHi },
  copy: { flex: 1, gap: 2 },
  label: {
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: 15,
  },
  hint: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});

/* ------------------------------------------------------------ ScreenHeader */

export function ScreenHeader({
  title,
  onBack,
  backLabel = "Home",
}: {
  title: string;
  onBack: () => void;
  backLabel?: string;
}) {
  return (
    <View style={header.bar}>
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        hitSlop={8}
        style={({ pressed }) => [header.back, pressed && header.backPressed]}
      >
        <Text style={header.chevron}>←</Text>
        <Text style={header.backText}>{backLabel}</Text>
      </Pressable>
      <Text style={header.title}>{title}</Text>
    </View>
  );
}

const header = StyleSheet.create({
  bar: {
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 14,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    paddingVertical: 4,
  },
  backPressed: { opacity: 0.6 },
  chevron: {
    fontFamily: fonts.mono,
    color: colors.mint,
    fontSize: 15,
  },
  backText: {
    fontFamily: fonts.bodyMed,
    color: colors.textMuted,
    fontSize: 14,
  },
  title: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 26,
    letterSpacing: -0.4,
  },
});
