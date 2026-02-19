import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  integer,
  boolean,
  real,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const videoTypeEnum = pgEnum("video_type", ["content", "ad"]);
export const velocityEnum = pgEnum("velocity_enum", ["high", "low"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceUuid: uuid("device_uuid").notNull(),
  condition: varchar("condition", { length: 50 }).notNull().default("low_velocity"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: videoTypeEnum("type").notNull().default("content"),
  velocityTag: velocityEnum("velocity_tag").notNull().default("low"),
  topic: varchar("topic", { length: 100 }).notNull(),
  videoUrl: text("video_url").notNull(),
  brandName: varchar("brand_name", { length: 100 }),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const feedSessions = pgTable("feed_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  condition: varchar("condition", { length: 50 }).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  totalScrolls: integer("total_scrolls").default(0),
  totalAdsSeen: integer("total_ads_seen").default(0),
  completed: boolean("completed").default(false),
});

export const telemetryLogs = pgTable("telemetry_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  videoId: uuid("video_id").references(() => videos.id).notNull(),
  sessionId: uuid("session_id").references(() => feedSessions.id),
  dwellTimeMs: integer("dwell_time_ms").notNull(),
  isAdClicked: boolean("is_ad_clicked").notNull().default(false),
  scrollIndex: integer("scroll_index"),
  visiblePercent: integer("visible_percent"),
  scrollVelocity: real("scroll_velocity"),
  swipeLatencyMs: integer("swipe_latency_ms"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

export const appEvents = pgTable("app_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  sessionId: uuid("session_id").references(() => feedSessions.id),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

export const surveyResponses = pgTable("survey_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  sessionId: uuid("session_id").references(() => feedSessions.id),
  selectedBrand: varchar("selected_brand", { length: 100 }).notNull(),
  correctBrand: varchar("correct_brand", { length: 100 }).notNull(),
  isCorrect: boolean("is_correct").notNull(),
  confidence: integer("confidence"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, createdAt: true });
export const insertTelemetrySchema = createInsertSchema(telemetryLogs).omit({ id: true, timestamp: true });
export const insertFeedSessionSchema = createInsertSchema(feedSessions).omit({ id: true, startedAt: true });
export const insertAppEventSchema = createInsertSchema(appEvents).omit({ id: true, timestamp: true });
export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({ id: true, timestamp: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type TelemetryLog = typeof telemetryLogs.$inferSelect;
export type InsertTelemetry = z.infer<typeof insertTelemetrySchema>;
export type FeedSession = typeof feedSessions.$inferSelect;
export type InsertFeedSession = z.infer<typeof insertFeedSessionSchema>;
export type AppEvent = typeof appEvents.$inferSelect;
export type InsertAppEvent = z.infer<typeof insertAppEventSchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
