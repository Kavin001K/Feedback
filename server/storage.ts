import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, inArray } from "drizzle-orm";
import pg from "pg";
import {
  users,
  videos,
  feedSessions,
  telemetryLogs,
  appEvents,
  surveyResponses,
  type User,
  type Video,
  type InsertVideo,
  type InsertTelemetry,
  type InsertFeedSession,
  type InsertAppEvent,
  type InsertSurveyResponse,
  type FeedSession,
  type TelemetryLog,
  type SurveyResponse,
} from "@shared/schema";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export async function createUser(data: { deviceUuid: string; condition: string }): Promise<User> {
  // If device already exists, return it to avoid duplicates
  const existing = await getUserByDevice(data.deviceUuid);
  if (existing) return existing;
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function getUser(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUserByDevice(deviceUuid: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.deviceUuid, deviceUuid));
  return user;
}

export async function getVideosByTopics(
  topics: string[],
  condition: string,
  type: string = "content",
): Promise<Video[]> {
  const velocity = condition === "high_velocity" ? "high" : "low";

  return db
    .select()
    .from(videos)
    .where(
      and(
        inArray(videos.topic, topics),
        eq(videos.type, type),
        eq(videos.velocityTag, velocity),
      ),
    );
}

export async function getVideosByVelocity(
  condition: string,
  type: string = "content",
): Promise<Video[]> {
  const velocity = condition === "high_velocity" ? "high" : "low";
  return db
    .select()
    .from(videos)
    .where(and(eq(videos.type, type), eq(videos.velocityTag, velocity)));
}

export async function getAdVideos(): Promise<Video[]> {
  return db.select().from(videos).where(eq(videos.type, "ad"));
}

export async function getAllVideos(): Promise<Video[]> {
  return db.select().from(videos);
}

export async function insertVideo(video: InsertVideo): Promise<Video> {
  const [v] = await db.insert(videos).values(video).returning();
  return v;
}

export async function createFeedSession(session: InsertFeedSession): Promise<FeedSession> {
  const [s] = await db.insert(feedSessions).values(session).returning();
  return s;
}

export async function endFeedSession(sessionId: string): Promise<void> {
  await db.update(feedSessions).set({ endedAt: new Date() }).where(eq(feedSessions.id, sessionId));
}

export async function logTelemetry(entry: InsertTelemetry): Promise<TelemetryLog> {
  const [t] = await db.insert(telemetryLogs).values(entry).returning();
  return t;
}

export async function logAppEvent(entry: InsertAppEvent): Promise<void> {
  await db.insert(appEvents).values(entry);
}

export async function logSurveyResponse(entry: InsertSurveyResponse): Promise<SurveyResponse> {
  const [s] = await db.insert(surveyResponses).values(entry).returning();
  return s;
}

export async function getVideoCount(): Promise<number> {
  const result = await db.select().from(videos);
  return result.length;
}
