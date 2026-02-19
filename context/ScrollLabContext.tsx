import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useRef,
  useCallback,
  useEffect,
} from "react";
import * as Crypto from "expo-crypto";
import { apiRequest } from "@/lib/query-client";

interface VideoItem {
  id: string;
  type: string;
  velocityTag: string;
  topic: string;
  videoUrl: string;
  brandName: string | null;
  feedIndex: number;
}

interface TelemetryEntry {
  userId: string;
  videoId: string;
  sessionId: string;
  dwellTimeMs: number;
  isAdClicked: boolean;
  scrollIndex: number;
  visiblePercent: number;
  scrollVelocity: number | null;
  swipeLatencyMs?: number | null;
}

interface UserProfile {
  deviceUuid?: string;
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

interface ScrollLabContextValue {
  userId: string | null;
  sessionId: string | null;
  condition: string | null;
  selectedTopics: string[];
  feed: VideoItem[];
  currentIndex: number;
  adBrandsShown: string[];
  isSessionActive: boolean;
  setSelectedTopics: (topics: string[]) => void;
  registerUser: (profile: UserProfile) => Promise<void>;
  loadFeed: () => Promise<void>;
  setCurrentIndex: (idx: number) => void;
  logDwellTime: (entry: Omit<TelemetryEntry, "userId" | "sessionId">) => void;
  logAdClick: (videoId: string, scrollIndex: number) => void;
  logEvent: (eventType: string) => void;
  endSession: () => void;
  submitSurvey: (selectedBrand: string, correctBrand: string, confidence: number) => Promise<void>;
}

const ScrollLabContext = createContext<ScrollLabContextValue | null>(null);

export function ScrollLabProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [feed, setFeed] = useState<VideoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const telemetryQueue = useRef<TelemetryEntry[]>([]);
  const flushInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const adBrandsShown = useMemo(() => {
    return feed
      .filter((v) => v.type === "ad" && v.brandName)
      .map((v) => v.brandName as string);
  }, [feed]);

  const registerUser = useCallback(async (profile: UserProfile) => {
    try {
      // generate a stable device UUID if not provided
      const deviceUuid = profile.deviceUuid || Crypto.randomUUID();

      const res = await apiRequest("POST", "/api/users", {
        deviceUuid,
      });
      const user = await res.json();
      setUserId(user.id);
      setCondition(user.condition);
    } catch (err) {
      console.error("Failed to register user:", err);
      throw err;
    }
  }, []);

  const loadFeed = useCallback(async () => {
    if (!userId || selectedTopics.length === 0) return;
    try {
      const res = await apiRequest("POST", "/api/feed", {
        topics: selectedTopics,
        userId,
      });
      const data = await res.json();
      setFeed(data.feed);
      setSessionId(data.sessionId);
      setCondition(data.condition);
      setIsSessionActive(true);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Failed to load feed:", err);
    }
  }, [userId, selectedTopics]);

  const flushTelemetry = useCallback(async () => {
    if (telemetryQueue.current.length === 0) return;
    const entries = [...telemetryQueue.current];
    telemetryQueue.current = [];
    try {
      await apiRequest("POST", "/api/telemetry/batch", { entries });
    } catch (err) {
      console.error("Failed to flush telemetry:", err);
    }
  }, []);

  const logDwellTime = useCallback(
    (entry: Omit<TelemetryEntry, "userId" | "sessionId">) => {
      if (!userId || !sessionId) return;
      telemetryQueue.current.push({
        ...entry,
        userId,
        sessionId,
      });
    },
    [userId, sessionId, flushTelemetry],
  );

  const logAdClick = useCallback(
    (videoId: string, scrollIndex: number) => {
      if (!userId || !sessionId) return;
      apiRequest("POST", "/api/telemetry", {
        userId,
        videoId,
        sessionId,
        dwellTimeMs: 1000,
        isAdClicked: true,
        scrollIndex,
        visiblePercent: 100,
        scrollVelocity: 0,
      }).catch(console.error);
    },
    [userId, sessionId],
  );

  const logEvent = useCallback(
    (eventType: string) => {
      if (!userId) return;
      apiRequest("POST", "/api/events", {
        userId,
        sessionId,
        eventType,
      }).catch(console.error);
    },
    [userId, sessionId],
  );

  const endSession = useCallback(() => {
    setIsSessionActive(false);
    if (flushInterval.current) {
      clearInterval(flushInterval.current);
      flushInterval.current = null;
    }
    flushTelemetry();
    if (sessionId) {
      apiRequest("POST", `/api/sessions/${sessionId}/end`).catch(console.error);
    }
  }, [sessionId, flushTelemetry]);

  const submitSurvey = useCallback(
    async (selectedBrand: string, correctBrand: string, confidence: number) => {
      if (!userId || !sessionId) return;
      const isCorrect =
        selectedBrand.toLowerCase() === correctBrand.toLowerCase();
      await apiRequest("POST", "/api/survey", {
        userId,
        sessionId,
        selectedBrand,
        correctBrand,
        isCorrect,
        confidence,
      });
    },
    [userId, sessionId],
  );

  useEffect(() => {
    if (!sessionId) return;
    if (flushInterval.current) clearInterval(flushInterval.current);
    flushInterval.current = setInterval(() => {
      flushTelemetry();
    }, 10000);

    return () => {
      if (flushInterval.current) clearInterval(flushInterval.current);
      flushInterval.current = null;
    };
  }, [sessionId, flushTelemetry]);

  useEffect(() => {
    return () => {
      flushTelemetry();
    };
  }, [flushTelemetry]);

  const value = useMemo(
    () => ({
      userId,
      sessionId,
      condition,
      selectedTopics,
      feed,
      currentIndex,
      adBrandsShown,
      isSessionActive,
      setSelectedTopics,
      registerUser,
      loadFeed,
      setCurrentIndex,
      logDwellTime,
      logAdClick,
      logEvent,
      endSession,
      submitSurvey,
    }),
    [
      userId,
      sessionId,
      condition,
      selectedTopics,
      feed,
      currentIndex,
      adBrandsShown,
      isSessionActive,
      registerUser,
      loadFeed,
      setCurrentIndex,
      logDwellTime,
      logAdClick,
      logEvent,
      endSession,
      submitSurvey,
    ],
  );

  return (
    <ScrollLabContext.Provider value={value}>
      {children}
    </ScrollLabContext.Provider>
  );
}

export function useScrollLab() {
  const context = useContext(ScrollLabContext);
  if (!context) {
    throw new Error("useScrollLab must be used within ScrollLabProvider");
  }
  return context;
}
