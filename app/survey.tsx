import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useScrollLab } from "@/context/ScrollLabContext";

const DECOY_BRANDS = [
  "Vertex Apparel",
  "Prism Audio",
  "Lunar Fitness",
  "Bolt Mobility",
  "Echo Wellness",
  "Summit Gear",
  "Cipher Security",
  "Forge Tools",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SurveyScreen() {
  const insets = useSafeAreaInsets();
  const { adBrandsShown, submitSurvey } = useScrollLab();
  const [step, setStep] = useState<"recall" | "confidence">("recall");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const targetBrand = useMemo(() => {
    if (adBrandsShown.length === 0) return "Unknown Brand";
    const randomIndex = Math.floor(Math.random() * adBrandsShown.length);
    return adBrandsShown[randomIndex];
  }, [adBrandsShown]);

  const brandChoices = useMemo(() => {
    const decoys = shuffle(
      DECOY_BRANDS.filter((b) => !adBrandsShown.includes(b)),
    ).slice(0, 3);
    return shuffle([targetBrand, ...decoys]);
  }, [targetBrand, adBrandsShown]);

  const handleBrandSelect = (brand: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBrand(brand);
  };

  const handleConfirmRecall = () => {
    if (!selectedBrand) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep("confidence");
  };

  const handleConfidenceSelect = (level: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConfidence(level);
  };

  const handleSubmit = async () => {
    if (!selectedBrand || confidence === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await submitSurvey(selectedBrand, targetBrand, confidence);
    router.replace("/complete");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0A0F", "#18183A", "#0A0A0F"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: topInset + 30, paddingBottom: bottomInset + 20 }]}>
        {step === "recall" ? (
          <Animated.View entering={FadeIn.duration(500)} style={styles.inner}>
            <View style={styles.iconWrap}>
              <Ionicons name="help-circle" size={48} color={Colors.dark.primary} />
            </View>

            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <Text style={styles.title}>Brand Recall Test</Text>
              <Text style={styles.subtitle}>
                Which of these brands did you see in your feed today?
              </Text>
            </Animated.View>

            <View style={styles.options}>
              {brandChoices.map((brand, idx) => (
                <Animated.View key={brand} entering={FadeInDown.delay(300 + idx * 100).duration(400)}>
                  <Pressable
                    onPress={() => handleBrandSelect(brand)}
                    style={({ pressed }) => [
                      styles.optionBtn,
                      selectedBrand === brand && styles.optionSelected,
                      { opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedBrand === brand && styles.optionTextSelected,
                      ]}
                    >
                      {brand}
                    </Text>
                    {selectedBrand === brand && (
                      <Ionicons name="checkmark-circle" size={22} color={Colors.dark.primary} />
                    )}
                  </Pressable>
                </Animated.View>
              ))}
            </View>

            <View style={{ flex: 1 }} />

            <Pressable
              onPress={handleConfirmRecall}
              disabled={!selectedBrand}
              style={({ pressed }) => [
                styles.nextBtn,
                !selectedBrand && styles.nextBtnDisabled,
                { opacity: pressed && selectedBrand ? 0.85 : 1 },
              ]}
            >
              <LinearGradient
                colors={
                  selectedBrand
                    ? [Colors.dark.primary, "#5A4BD6"]
                    : [Colors.dark.surfaceLight, Colors.dark.surfaceLight]
                }
                style={styles.nextGradient}
              >
                <Text style={[styles.nextText, !selectedBrand && { color: Colors.dark.textMuted }]}>
                  Next
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={selectedBrand ? "#FFF" : Colors.dark.textMuted}
                />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(500)} style={styles.inner}>
            <View style={styles.iconWrap}>
              <Ionicons name="speedometer" size={48} color={Colors.dark.accent} />
            </View>

            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <Text style={styles.title}>How confident are you?</Text>
              <Text style={styles.subtitle}>
                Rate your confidence in your brand recall answer
              </Text>
            </Animated.View>

            <View style={styles.confidenceRow}>
              {[1, 2, 3, 4, 5].map((level) => (
                <Animated.View key={level} entering={FadeInUp.delay(200 + level * 60).duration(300)}>
                  <Pressable
                    onPress={() => handleConfidenceSelect(level)}
                    style={({ pressed }) => [
                      styles.confBtn,
                      confidence === level && styles.confBtnSelected,
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.confNum,
                        confidence === level && styles.confNumSelected,
                      ]}
                    >
                      {level}
                    </Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>

            <View style={styles.confLabels}>
              <Text style={styles.confLabel}>Not sure</Text>
              <Text style={styles.confLabel}>Very sure</Text>
            </View>

            <View style={{ flex: 1 }} />

            <Pressable
              onPress={handleSubmit}
              disabled={confidence === 0}
              style={({ pressed }) => [
                styles.nextBtn,
                confidence === 0 && styles.nextBtnDisabled,
                { opacity: pressed && confidence > 0 ? 0.85 : 1 },
              ]}
            >
              <LinearGradient
                colors={
                  confidence > 0
                    ? [Colors.dark.accentGreen, "#00C853"]
                    : [Colors.dark.surfaceLight, Colors.dark.surfaceLight]
                }
                style={styles.nextGradient}
              >
                <Text style={[styles.nextText, confidence === 0 && { color: Colors.dark.textMuted }]}>
                  Submit
                </Text>
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={confidence > 0 ? "#FFF" : Colors.dark.textMuted}
                />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
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
    paddingHorizontal: 24,
  },
  inner: {
    flex: 1,
  },
  iconWrap: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(108,92,231,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },
  options: {
    marginTop: 32,
    gap: 12,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.surface,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
  },
  optionSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: "rgba(108,92,231,0.1)",
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textSecondary,
  },
  optionTextSelected: {
    color: Colors.dark.text,
    fontFamily: "Inter_600SemiBold",
  },
  confidenceRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
    gap: 14,
  },
  confBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.dark.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
  },
  confBtnSelected: {
    borderColor: Colors.dark.accent,
    backgroundColor: "rgba(0,210,255,0.1)",
  },
  confNum: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.textSecondary,
  },
  confNumSelected: {
    color: Colors.dark.accent,
  },
  confLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 12,
  },
  confLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textMuted,
  },
  nextBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  nextText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#FFF",
  },
});
