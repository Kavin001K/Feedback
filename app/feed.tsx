import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  AppState,
  Platform,
  ViewToken,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useScrollLab } from "@/context/ScrollLabContext";
import VideoCard from "@/components/VideoCard";

const { width, height } = Dimensions.get("window");

interface FeedItem {
  id: string;
  type: string;
  velocityTag: string;
  topic: string;
  videoUrl: string;
  brandName: string | null;
  feedIndex: number;
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const {
    userId,
    sessionId,
    feed,
    currentIndex,
    isSessionActive,
    loadFeed,
    setCurrentIndex,
    logDwellTime,
    logAdClick,
    logEvent,
    endSession,
  } = useScrollLab();

  const [isLoading, setIsLoading] = useState(true);
  const viewStartTime = useRef<number>(Date.now());
  const currentViewId = useRef<string | null>(null);
  const scrollVelocityRef = useRef<number>(0);
  const videosViewed = useRef<number>(0);
  const adExposures = useRef<Map<string, number>>(new Map());
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const init = async () => {
      await loadFeed();
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        logEvent("app_backgrounded");
        flushCurrentDwell();
      } else if (state === "active") {
        logEvent("app_foregrounded");
        viewStartTime.current = Date.now();
      }
    });
    return () => sub.remove();
  }, [logEvent]);

  const flushCurrentDwell = useCallback(() => {
    if (currentViewId.current && feed.length > 0) {
      const dwellMs = Date.now() - viewStartTime.current;
      const item = feed.find((f) => f.id === currentViewId.current);
      if (item && dwellMs >= 300) {
        logDwellTime({
          videoId: item.id,
          dwellTimeMs: dwellMs,
          isAdClicked: false,
          scrollIndex: item.feedIndex,
          visiblePercent: 80,
          scrollVelocity: scrollVelocityRef.current,
        });

        if (item.type === "ad" && item.brandName) {
          const prev = adExposures.current.get(item.brandName) || 0;
          adExposures.current.set(item.brandName, prev + dwellMs);
        }
      }
    }
  }, [feed, logDwellTime]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const visibleItem = viewableItems[0].item as FeedItem;

        if (currentViewId.current && currentViewId.current !== visibleItem.id) {
          flushCurrentDwell();
        }

        currentViewId.current = visibleItem.id;
        viewStartTime.current = Date.now();
        const idx = visibleItem.feedIndex;
        setCurrentIndex(idx);
        videosViewed.current = Math.max(videosViewed.current, idx + 1);

        if (videosViewed.current >= 16) {
          flushCurrentDwell();
          endSession();
          setTimeout(() => {
            router.replace("/survey");
          }, 300);
        }
      }
    },
  ).current;

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const velocity = e.nativeEvent.velocity?.y || 0;
      scrollVelocityRef.current = velocity;
    },
    [],
  );

  const handleAdClick = useCallback(
    (videoId: string, scrollIndex: number) => {
      logAdClick(videoId, scrollIndex);
    },
    [logAdClick],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => (
      <VideoCard
        videoUrl={item.videoUrl}
        type={item.type}
        brandName={item.brandName}
        topic={item.topic}
        feedIndex={item.feedIndex}
        isActive={currentIndex === item.feedIndex}
        onAdClick={() => handleAdClick(item.id, item.feedIndex)}
      />
    ),
    [currentIndex, handleAdClick],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
    [],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Building your feed...</Text>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
        <Text style={styles.headerTitle}>ScrollLab</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={feed}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.id}-${item.feedIndex}`}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollEnabled={isSessionActive}
        removeClippedSubviews={Platform.OS !== "web"}
        maxToRenderPerBatch={3}
        windowSize={3}
        initialNumToRender={2}
      />

      <View style={[styles.progressBar, { bottom: Platform.OS === "web" ? 34 : insets.bottom + 8 }]}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min((videosViewed.current / 15) * 100, 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.min(videosViewed.current, 15)}/15
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textSecondary,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
    gap: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,82,82,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF5252",
  },
  liveText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#FF5252",
    letterSpacing: 1,
  },
  progressBar: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 100,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.5)",
  },
});
