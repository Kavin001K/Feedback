# ScrollLab - Behavioral Research Platform

## Overview
ScrollLab is a TikTok-style vertical video feed app designed to research how content velocity impacts ad recall and CTR. It functions as a mobile behavioral research tool with full telemetry tracking.

## Architecture
- **Frontend**: React Native + Expo Router (file-based routing, no tabs)
- **Backend**: Express.js on port 5000, PostgreSQL via Drizzle ORM
- **Video**: expo-video for playback
- **Theme**: Dark theme, Inter font family
- **State**: React Context (ScrollLabContext) for global state

## User Flow
1. **Welcome** (`app/index.tsx`) - App intro, auto-creates anonymous user with A/B condition
2. **Topics** (`app/topics.tsx`) - Select up to 3 interest topics
3. **Feed** (`app/feed.tsx`) - Full-screen vertical video feed with ads at positions 5, 10, 15
4. **Survey** (`app/survey.tsx`) - Brand recall test + confidence rating after 15 videos
5. **Complete** (`app/complete.tsx`) - Session summary

## Database Tables
- `users` - Anonymous users with A/B condition assignment
- `videos` - Content + ad videos with velocity tags
- `feed_sessions` - Per-session tracking with condition
- `telemetry_logs` - Dwell time, scroll velocity, ad clicks per video
- `app_events` - Background/foreground state changes
- `survey_responses` - Brand recall + confidence data

## Key Features
- Millisecond dwell time tracking with 300ms threshold filter
- Scroll velocity correlation logging
- A/B condition randomization (high/low velocity)
- Ad injection at fixed positions with brand rotation
- Feed locking after 15 videos
- AppState background/foreground tracking
- Batched telemetry uploads

## Recent Changes
- 2026-02-18: Initial build - full app with all screens, database, and telemetry
