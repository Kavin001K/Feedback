import { db } from "./storage";
import { videos } from "@shared/schema";

const contentVideos = [
  { type: "content", velocityTag: "high", topic: "Tech", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { type: "content", velocityTag: "high", topic: "Tech", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
  { type: "content", velocityTag: "high", topic: "Tech", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
  { type: "content", velocityTag: "low", topic: "Tech", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
  { type: "content", velocityTag: "low", topic: "Tech", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" },

  { type: "content", velocityTag: "high", topic: "Sports", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
  { type: "content", velocityTag: "high", topic: "Sports", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4" },
  { type: "content", velocityTag: "high", topic: "Sports", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
  { type: "content", velocityTag: "low", topic: "Sports", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4" },
  { type: "content", velocityTag: "low", topic: "Sports", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4" },

  { type: "content", velocityTag: "low", topic: "Nature", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { type: "content", velocityTag: "low", topic: "Nature", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { type: "content", velocityTag: "low", topic: "Nature", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { type: "content", velocityTag: "high", topic: "Nature", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
  { type: "content", velocityTag: "high", topic: "Nature", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },

  { type: "content", velocityTag: "low", topic: "Food", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
  { type: "content", velocityTag: "low", topic: "Food", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" },
  { type: "content", velocityTag: "high", topic: "Food", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
  { type: "content", velocityTag: "high", topic: "Food", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4" },
  { type: "content", velocityTag: "high", topic: "Food", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },

  { type: "content", velocityTag: "high", topic: "Comedy", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4" },
  { type: "content", velocityTag: "high", topic: "Comedy", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4" },
  { type: "content", velocityTag: "low", topic: "Comedy", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { type: "content", velocityTag: "low", topic: "Comedy", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { type: "content", velocityTag: "low", topic: "Comedy", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },

  { type: "content", velocityTag: "high", topic: "Fitness", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
  { type: "content", velocityTag: "high", topic: "Fitness", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
  { type: "content", velocityTag: "high", topic: "Fitness", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
  { type: "content", velocityTag: "low", topic: "Fitness", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" },
  { type: "content", velocityTag: "low", topic: "Fitness", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
];

const adVideos = [
  { type: "ad", velocityTag: "high", topic: "ad", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", brandName: "Apex Shoes" },
  { type: "ad", velocityTag: "high", topic: "ad", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", brandName: "Nova Tech" },
  { type: "ad", velocityTag: "high", topic: "ad", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", brandName: "Pulse Energy" },
  { type: "ad", velocityTag: "low", topic: "ad", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", brandName: "Zenith Watches" },
  { type: "ad", velocityTag: "low", topic: "ad", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", brandName: "Drift Coffee" },
  { type: "ad", velocityTag: "low", topic: "ad", videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", brandName: "Aura Skincare" },
];

export async function seedDatabase() {
  const allVideos = [...contentVideos, ...adVideos];
  
  for (const video of allVideos) {
    await db.insert(videos).values(video);
  }
  
  console.log(`Seeded ${allVideos.length} videos`);
}
