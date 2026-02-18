import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

function AnimatedRing({ delay, size }: { delay: number; size: number }) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 2000 }),
          withTiming(0.8, { duration: 2000 }),
        ),
        -1,
        true,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.15, { duration: 2000 }),
          withTiming(0.4, { duration: 2000 }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: Colors.dark.accentGreen,
        },
        style,
      ]}
    />
  );
}

export default function CompleteScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0A0F", "#0F1A1A", "#0A0A0F"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: topInset + 60, paddingBottom: bottomInset + 20 }]}>
        <View style={styles.successContainer}>
          <AnimatedRing delay={0} size={160} />
          <AnimatedRing delay={400} size={200} />
          <AnimatedRing delay={800} size={240} />
          <Animated.View entering={FadeIn.delay(300).duration(600)} style={styles.checkCircle}>
            <Ionicons name="checkmark" size={48} color={Colors.dark.accentGreen} />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(500).duration(600)}>
          <Text style={styles.title}>Simulation Complete</Text>
          <Text style={styles.subtitle}>
            Thank you for participating in this research session.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).duration(600)} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="videocam" size={22} color={Colors.dark.primary} />
            <View>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>Videos Viewed</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="megaphone" size={22} color={Colors.dark.adBadge} />
            <View>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Ads Shown</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="analytics" size={22} color={Colors.dark.accent} />
            <View>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Data Captured</Text>
            </View>
          </View>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Animated.View entering={FadeInDown.delay(900).duration(600)}>
          <View style={styles.footerInfo}>
            <Ionicons name="shield-checkmark" size={18} color={Colors.dark.accentGreen} />
            <Text style={styles.footerText}>
              Your data has been anonymized and securely recorded for analysis.
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  successContainer: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0,230,118,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(0,230,118,0.3)",
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 24,
  },
  statsContainer: {
    marginTop: 36,
    width: "100%",
    gap: 12,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 16,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
    marginTop: 1,
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
  },
  footerText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textMuted,
    flex: 1,
    lineHeight: 18,
  },
});
