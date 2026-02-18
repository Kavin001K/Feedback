import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useScrollLab } from "@/context/ScrollLabContext";

const TOPICS = [
  { id: "Tech", icon: "hardware-chip-outline" as const, color: "#6C5CE7" },
  { id: "Sports", icon: "basketball-outline" as const, color: "#FF6B35" },
  { id: "Nature", icon: "leaf-outline" as const, color: "#00E676" },
  { id: "Food", icon: "restaurant-outline" as const, color: "#FFB74D" },
  { id: "Comedy", icon: "happy-outline" as const, color: "#FF5252" },
  { id: "Fitness", icon: "fitness-outline" as const, color: "#00D2FF" },
  { id: "Music", icon: "musical-notes-outline" as const, color: "#E040FB" },
  { id: "Gaming", icon: "game-controller-outline" as const, color: "#7C4DFF" },
  { id: "Travel", icon: "airplane-outline" as const, color: "#26C6DA" },
  { id: "Fashion", icon: "shirt-outline" as const, color: "#F48FB1" },
  { id: "Education", icon: "school-outline" as const, color: "#66BB6A" },
  { id: "Science", icon: "flask-outline" as const, color: "#42A5F5" },
];

function TopicButton({
  topic,
  selected,
  onPress,
  index,
}: {
  topic: { id: string; icon: string; color: string };
  selected: boolean;
  onPress: () => void;
  index: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(150 + index * 50).duration(350)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.topicButton,
          selected && { borderColor: topic.color, backgroundColor: `${topic.color}15` },
          { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
      >
        <View style={[styles.topicIconWrap, { backgroundColor: `${topic.color}20` }]}>
          <Ionicons
            name={topic.icon as any}
            size={24}
            color={selected ? topic.color : Colors.dark.textSecondary}
          />
        </View>
        <Text style={[styles.topicLabel, selected && { color: Colors.dark.text }]}>
          {topic.id}
        </Text>
        {selected && (
          <View style={[styles.checkBadge, { backgroundColor: topic.color }]}>
            <Ionicons name="checkmark" size={14} color="#FFF" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function TopicsScreen() {
  const insets = useSafeAreaInsets();
  const { setSelectedTopics } = useScrollLab();
  const [selected, setSelected] = useState<string[]>([]);
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const toggleTopic = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((t) => t !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleContinue = async () => {
    if (selected.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTopics(selected);
    router.push("/feed");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0A0F", "#12122A", "#0A0A0F"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.headerFixed, { paddingTop: topInset + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
        </Pressable>

        <Animated.View entering={FadeIn.delay(100).duration(500)}>
          <Text style={styles.step}>SELECT YOUR INTERESTS</Text>
          <Text style={styles.title}>What interests you?</Text>
          <Text style={styles.subtitle}>
            Choose up to 3 topics to personalize your feed
          </Text>
        </Animated.View>

        <View style={styles.selectedCount}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < selected.length && { backgroundColor: Colors.dark.primary },
              ]}
            />
          ))}
          <Text style={styles.countText}>{selected.length}/3 selected</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 100 }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {TOPICS.map((topic, idx) => (
          <TopicButton
            key={topic.id}
            topic={topic}
            selected={selected.includes(topic.id)}
            onPress={() => toggleTopic(topic.id)}
            index={idx}
          />
        ))}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 12 }]}>
        <LinearGradient
          colors={["transparent", Colors.dark.background, Colors.dark.background]}
          style={styles.bottomGradient}
          pointerEvents="none"
        />
        <Pressable
          onPress={handleContinue}
          disabled={selected.length === 0}
          style={({ pressed }) => [
            styles.continueBtn,
            selected.length === 0 && styles.continueBtnDisabled,
            { opacity: pressed && selected.length > 0 ? 0.85 : 1 },
          ]}
        >
          <LinearGradient
            colors={
              selected.length > 0
                ? [Colors.dark.primary, "#5A4BD6"]
                : [Colors.dark.surfaceLight, Colors.dark.surfaceLight]
            }
            style={styles.continueGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text
              style={[
                styles.continueText,
                selected.length === 0 && { color: Colors.dark.textMuted },
              ]}
            >
              Start Scrolling
            </Text>
            <Ionicons
              name="play"
              size={18}
              color={selected.length > 0 ? "#FFF" : Colors.dark.textMuted}
            />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  headerFixed: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  step: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.primary,
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  selectedCount: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.border,
  },
  countText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textMuted,
    marginLeft: 8,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 10,
    paddingTop: 4,
  },
  topicButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    gap: 12,
  },
  topicIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  topicLabel: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  bottomGradient: {
    ...StyleSheet.absoluteFillObject,
    top: -30,
  },
  continueBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  continueText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#FFF",
  },
});
