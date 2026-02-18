import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const { width, height } = Dimensions.get("window");

function FloatingLine({ delay, left, h }: { delay: number; left: number; h: number }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-30, { duration: 3000 }),
          withTiming(30, { duration: 3000 }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left,
          top: height * 0.15,
          width: 2,
          height: h,
          backgroundColor: Colors.dark.primary,
          opacity: 0.15,
          borderRadius: 1,
        },
        style,
      ]}
    />
  );
}

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/register");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0A0F", "#12122A", "#0A0A0F"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {[...Array(8)].map((_, i) => (
        <FloatingLine
          key={i}
          delay={i * 400}
          left={width * 0.1 + i * (width * 0.1)}
          h={100 + Math.random() * 200}
        />
      ))}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topInset + 40, paddingBottom: bottomInset + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View entering={FadeIn.delay(200).duration(800)} style={styles.logoContainer}>
          <Animated.View style={[styles.logoCircle, pulseStyle]}>
            <Ionicons name="analytics" size={40} color={Colors.dark.accent} />
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <Text style={styles.title}>ScrollLab</Text>
          <Text style={styles.subtitle}>Behavioral Research Platform</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.descContainer}>
          <Text style={styles.description}>
            Experience a personalized video feed while we study how content velocity impacts engagement and recall.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800).duration(600)} style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="eye-outline" size={22} color={Colors.dark.primary} />
            <Text style={styles.infoText}>Watch curated content</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="pulse-outline" size={22} color={Colors.dark.accent} />
            <Text style={styles.infoText}>Data collected silently</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark-outline" size={22} color={Colors.dark.accentGreen} />
            <Text style={styles.infoText}>Fully anonymized</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000).duration(600)} style={styles.buttonWrap}>
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.startButton,
              { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <LinearGradient
              colors={[Colors.dark.primary, "#5A4BD6"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </LinearGradient>
          </Pressable>

          <Text style={styles.disclaimer}>
            You will be asked to provide consent before any data is collected.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 28,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(108, 92, 231, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(108, 92, 231, 0.3)",
  },
  title: {
    fontSize: 42,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
    textAlign: "center",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.primary,
    textAlign: "center",
    marginTop: 6,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  descContainer: {
    marginTop: 24,
    paddingHorizontal: 10,
  },
  description: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  infoCards: {
    marginTop: 28,
    gap: 12,
    width: "100%",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  infoText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.text,
  },
  buttonWrap: {
    width: "100%",
    marginTop: 32,
  },
  startButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  buttonText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#FFF",
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textMuted,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
});
