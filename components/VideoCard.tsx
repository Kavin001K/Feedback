import React, { useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const { width, height } = Dimensions.get("window");

interface VideoCardProps {
  videoUrl: string;
  type: string;
  brandName: string | null;
  topic: string;
  feedIndex: number;
  isActive: boolean;
  onAdClick: () => void;
}

export default function VideoCard({
  videoUrl,
  type,
  brandName,
  topic,
  feedIndex,
  isActive,
  onAdClick,
}: VideoCardProps) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.volume = 0;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  const handleAdClick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAdClick();
  };

  const isAd = type === "ad";

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={false}
        contentFit="cover"
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
        style={styles.bottomGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "transparent"]}
        style={styles.topGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {isAd && (
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>AD</Text>
        </View>
      )}

      <View style={styles.overlay}>
        <View style={styles.topInfo}>
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>{feedIndex + 1}</Text>
          </View>
        </View>

        <View style={styles.bottomInfo}>
          {isAd && brandName ? (
            <Animated.View entering={FadeInUp.duration(400)}>
              <Text style={styles.brandTitle}>{brandName}</Text>
              <Text style={styles.brandSub}>Sponsored Content</Text>
              <Pressable
                onPress={handleAdClick}
                style={({ pressed }) => [
                  styles.learnMoreBtn,
                  { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
              >
                <Text style={styles.learnMoreText}>Learn More</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </Pressable>
            </Animated.View>
          ) : (
            <View>
              <View style={styles.topicTag}>
                <Text style={styles.topicTagText}>{topic}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.sideActions}>
          <Pressable style={styles.sideBtn}>
            <Ionicons name="heart-outline" size={28} color="#FFF" />
          </Pressable>
          <Pressable style={styles.sideBtn}>
            <Ionicons name="chatbubble-outline" size={26} color="#FFF" />
          </Pressable>
          <Pressable style={styles.sideBtn}>
            <Ionicons name="share-outline" size={26} color="#FFF" />
          </Pressable>
        </View>
      </View>

      {!isActive && (
        <View style={styles.pauseOverlay}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: "#000",
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topInfo: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  indexBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  indexText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.7)",
  },
  adBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: Colors.dark.adBadge,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 10,
  },
  adBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#FFF",
    letterSpacing: 1,
  },
  bottomInfo: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  brandTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#FFF",
    marginBottom: 4,
  },
  brandSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 16,
  },
  learnMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    alignSelf: "flex-start",
  },
  learnMoreText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFF",
  },
  topicTag: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  topicTagText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#FFF",
  },
  sideActions: {
    position: "absolute",
    right: 14,
    bottom: 140,
    gap: 20,
    alignItems: "center",
  },
  sideBtn: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});
