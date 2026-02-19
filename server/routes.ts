import type { Express } from "express";
import { createServer, type Server } from "node:http";
import {
  createUser,
  getUser,
  getVideosByTopics,
  getVideosByVelocity,
  getAdVideos,
  createFeedSession,
  endFeedSession,
  logTelemetry,
  logAppEvent,
  logSurveyResponse,
  getVideoCount,
} from "./storage";
import { seedDatabase } from "./seed";

export async function registerRoutes(app: Express): Promise<Server> {
  const count = await getVideoCount();
  if (count === 0) {
    console.log("No videos found, seeding database...");
    await seedDatabase();
  }

  app.post("/api/users", async (req, res) => {
    try {
      const { deviceUuid } = req.body;
      if (!deviceUuid) {
        return res.status(400).json({ error: "deviceUuid required" });
      }
      const condition = Math.random() > 0.5 ? "high_velocity" : "low_velocity";
      const user = await createUser({
        deviceUuid,
        condition,
      });
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await getUser(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.post("/api/feed", async (req, res) => {
    try {
      const { topics, userId } = req.body;
      if (!topics || !Array.isArray(topics) || topics.length === 0) {
        return res.status(400).json({ error: "Topics required" });
      }

      const user = userId ? await getUser(userId) : null;
      const condition = user?.condition || "low_velocity";
      const expectedVelocity = condition === "high_velocity" ? "high" : "low";

      let contentVideos = await getVideosByTopics(topics, condition);
      if (contentVideos.length < 12) {
        const velocityPool = await getVideosByVelocity(condition);
        const byId = new Set(contentVideos.map((v) => v.id));
        for (const v of velocityPool) {
          if (!byId.has(v.id)) {
            contentVideos.push(v);
          }
          if (contentVideos.length >= 12) break;
        }
      }

      const allAds = await getAdVideos();
      const ads = allAds.filter((ad) => ad.velocityTag === expectedVelocity);

      const shuffled = contentVideos.sort(() => Math.random() - 0.5).slice(0, 12);
      const shuffledAds = (ads.length > 0 ? ads : allAds)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const feed: any[] = [];
      let contentIdx = 0;
      let adIdx = 0;

      for (let i = 0; i < 15; i++) {
        if ((i === 4 || i === 9 || i === 14) && adIdx < shuffledAds.length) {
          feed.push({ ...shuffledAds[adIdx], feedIndex: i });
          adIdx++;
        } else if (shuffled.length > 0) {
          feed.push({ ...shuffled[contentIdx % shuffled.length], feedIndex: i });
          contentIdx++;
        }
      }

      const session = await createFeedSession({ userId, condition });

      res.json({ feed, sessionId: session.id, condition });
    } catch (error) {
      console.error("Error building feed:", error);
      res.status(500).json({ error: "Failed to build feed" });
    }
  });

  app.post("/api/telemetry", async (req, res) => {
    try {
      const entry = req.body;
      if (entry.dwellTimeMs < 300) {
        return res.json({ logged: false, reason: "Below threshold" });
      }
      const log = await logTelemetry(entry);
      res.json({ logged: true, id: log.id });
    } catch (error) {
      console.error("Error logging telemetry:", error);
      res.status(500).json({ error: "Failed to log telemetry" });
    }
  });

  app.post("/api/telemetry/batch", async (req, res) => {
    try {
      const { entries } = req.body;
      if (!Array.isArray(entries)) return res.status(400).json({ error: "entries array required" });
      
      let logged = 0;
      for (const entry of entries) {
        if (entry.dwellTimeMs >= 300) {
          await logTelemetry(entry);
          logged++;
        }
      }
      res.json({ logged });
    } catch (error) {
      res.status(500).json({ error: "Failed to batch log telemetry" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      await logAppEvent(req.body);
      res.json({ logged: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to log event" });
    }
  });

  app.post("/api/sessions/:id/end", async (req, res) => {
    try {
      await endFeedSession(req.params.id);
      res.json({ ended: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  app.post("/api/survey", async (req, res) => {
    try {
      const response = await logSurveyResponse(req.body);
      res.json(response);
    } catch (error) {
      console.error("Error logging survey:", error);
      res.status(500).json({ error: "Failed to log survey" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
