# Reellora: AI Video Generation Platform

## 1. Project Overview

Reellora is a creator-facing platform that turns curated news and trending stories into finished, publish-ready videos.

The platform discovers content from external sources, normalizes it, categorizes it, and presents it as a feed inside the creator dashboard. Each story arrives with associated assets. A creator reviews the feed, selects a story, and clicks Generate Video. That action sends a request to the backend, where the video-generation orchestration layer kicks off the pipeline.

The target workflow is:

External Sources → Content Discovery → Normalization + Categorization + Asset Extraction → Categorized News Feed → Creator clicks Generate Video → Generate Video API → Video Generation Orchestrator → Research/Script/Video Plan → Runway Video + TTS → Object Storage → FFmpeg Assembly → Quality Control → Final Video → Dashboard + Platform Publishing

The expected output is a professionally assembled video, typically around 5–8 minutes long for long-form platforms, containing generated visuals, narration, subtitles, branding, and platform-ready metadata. Short-form outputs can be produced from the same source later.

### Core principle

The dashboard and API collect creator intent, NestJS orchestrates the pipeline, Runway generates the raw AI media, object storage stores media assets, FFmpeg produces the final video, and platform-specific publishers distribute the finished result.

### Central product question

The architecture answers: what content is available, and what does the creator want to turn into a video?

The dashboard is the bridge between Reellora's content intelligence system and its AI video-generation pipeline.

---

## 2. Architectural Goals

The architecture should be:

- **Creator-driven** — generation is triggered by explicit user intent, not only by automation.
- **Asynchronous** — long-running AI and video operations must not block HTTP requests.
- **Fault tolerant** — individual generation failures should be retryable at the failed stage.
- **Observable** — every stage should expose status and errors.
- **Idempotent** — retries should not accidentally create duplicate content.
- **Provider-isolated** — Runway-specific implementation should not leak throughout the application.
- **Media-oriented** — large files should move through object storage rather than application memory.
- **Scalable** — multiple videos and scenes should be processable concurrently.
- **Resumable** — a failed scene should not require regenerating the entire video.
- **Platform-ready** — final output can be adapted for YouTube, TikTok, Instagram, and other platforms.
- **Replaceable** — AI providers and publishers can eventually be changed without rewriting the whole system.

---

## 3. System Architecture

The system has two main regions: the content discovery side and the video generation side. The dashboard sits between them.

Content Discovery:
- External sources such as RSS feeds, news APIs, and financial APIs are polled periodically.
- Discovered content is normalized into a common news format.
- Each item is categorized and its assets are extracted.
- The result is stored and surfaced in the dashboard feed.

Dashboard:
- Presents a categorized feed of news items.
- Allows filtering by category.
- Lets creators view a story or click Generate Video.
- Shows generation progress and finished videos.

Video Generation:
- A backend API receives the generate request and creates a video generation job.
- The orchestrator coordinates research, script writing, video planning, scene generation, assembly, and quality control.
- The final video returns to the dashboard.
- From the dashboard, the creator can publish to connected platforms or enable automatic publishing in settings.

The key shift from the old architecture is that generation is no longer automatic for every discovered item. The dashboard is the control point. Not every piece of news becomes a video.

---

## 4. Content Discovery, Categories & News Assets

### Categories as first-class concepts

Categories organize the dashboard feed and drive content discovery priorities. They are chosen for underserved niches that have strong RPM potential on platforms such as YouTube and TikTok. Examples include African Business, Banking & Finance, African Stocks, Technology, African Economy, Real Estate, Lifestyle, Travel, and Energy.

Categories should be configuration-driven rather than hard-coded. Each category can later define target platforms, target audience, and enabled status. For the MVP, the system can be seeded with African Business News and a small set of sources.

### Content discovery layer

The content discovery layer discovers, imports, normalizes, categorizes, and enriches content from external sources. It is broader than simple RSS ingestion.

Responsibilities:
- Poll configured sources
- Parse RSS, API responses, and publisher feeds
- Normalize different formats into a common internal news representation
- Classify items into categories
- Extract associated assets such as images, videos, thumbnails, charts, and documents
- Detect and merge duplicates
- Preserve source attribution and raw metadata
- Track publication dates and discovery timestamps

This layer does not generate scripts, perform final research, generate video, call Runway, render media, or publish to platforms. Its output is a normalized news item with optional source assets.

### News assets

News items now carry assets. These can include images, video clips, thumbnails, charts, and documents. The asset manager stores references and metadata rather than the files themselves, while the actual files live in object storage.

These assets are available to the video planner, which can choose to reuse a source asset instead of generating a new visual. This reduces Runway costs and improves factual accuracy for stories that already have suitable media.

---

## 5. Dashboard, API & Orchestration

### Dashboard feed

The dashboard is the creator-facing surface. At this stage the feed is global, and users can filter by category. Each item shows title, source, category, summary, published date, and a preview asset where available.

Creators can:
- Browse the feed
- Filter by category
- View the original story
- Click Generate Video to start production
- Track generation progress
- Review finished videos
- Publish manually or manage auto-publish settings

### Generate video API

When a creator clicks Generate Video, the dashboard sends a request to the backend. The API validates the news item, creates a video record and a generation job, pushes the job to the orchestration queue, and returns immediately with a job identifier and queued status.

The frontend subscribes to job status and shows progress through stages such as preparing story, creating script, generating scenes, composing video, and quality check.

### Video generation orchestrator

The orchestrator is the central coordinator. It does not perform the actual media work. Its job is to dispatch and track each stage.

It receives a generation request tied to a specific news item and optional settings such as platform, duration, and style. It then moves the video through lifecycle states, dispatching work to the queue system and reporting status back to the dashboard.

The orchestrator is also where conditional decisions happen, such as whether a story needs research or can move straight to script generation.

### Queue responsibilities

The queue system, such as BullMQ with Redis, handles asynchronous processing, retries, concurrency, delayed jobs, failed jobs, backoff, job status, and worker isolation. Scene generation can run in parallel to reduce total pipeline time.

---

## 6. Video Pipeline Stages

### Conditional research

Research is no longer mandatory for every item. The orchestrator decides whether a story needs enrichment based on category, source, complexity, or user preference.

When research runs, it extracts important facts, context, entities, events, chronology, supporting information, and potential conflicts. Its output is a structured research result that the script layer can consume without re-reading the original source.

### Script generation

The script layer converts research and/or source news into a spoken narrative. It produces a 5–8 minute script with a strong hook, clear context, factual body, and concise conclusion. It also suggests title, description, and tags.

It does not decide visual scenes, generate media, or publish videos. Its output is a video script.

### Video planner

The video planner converts the script into visual scenes. It receives the news item, its assets, any research, the script, and generation settings. For each scene it chooses the best visual source: an existing source asset, a generated Runway clip, or a graphic such as a chart or map.

This intelligent reuse of source assets substantially reduces generation cost.

### Runway generation

Runway is the selected AI video-generation engine. It generates raw AI video and text-to-speech narration for scenes where source assets are insufficient.

Runway-specific implementation should be isolated behind a provider interface so the rest of the application does not depend on it directly. Runway should not decide scenes, assemble videos, or publish to platforms.

### Asset management

The asset manager stores and versions all media used by the pipeline, including ingested source assets and generated clips. It stores references in the database and files in object storage such as Azure Blob, Amazon S3, Cloudflare R2, or MinIO.

It does not generate media or assemble videos.

### FFmpeg assembly

FFmpeg assembles raw assets into the final video. Responsibilities include scene composition, concatenation, audio processing, subtitles, branding, video formatting, transitions, and thumbnail processing.

It does not generate AI media or decide platform strategy. Its output is a final MP4.

### Quality control

Quality control verifies that the final output is ready for publication. It performs file validation, video validation, audio validation, subtitle validation, scene validation, and AI-based checks where appropriate.

Failures should be explicit and retryable at the failed stage rather than restarting the entire pipeline.

### Publishing

Publishing is platform-agnostic. The system uses platform adapters such as a YouTube publisher, TikTok publisher, and Instagram publisher. Each adapter handles upload, metadata, thumbnails, scheduling, status tracking, and idempotency for its platform.

By default, publishing is a separate user action from generation. A creator can enable automatic publishing in personalization settings.

The video generation engine should not care where the video will ultimately be published. This keeps generation isolated from distribution.

---

## 7. Data Model & Lifecycles

### Conceptual model

A Category owns many Content Feeds. Each feed produces News items. Each news item can have many News Assets and many generated Videos.

A Video can have Research, a Script, a Video Plan, many Scenes, Generation Jobs, Media Assets, a Render Job, a Quality Check, and Publications.

This distinction is important: News is the source content, and Video is a generated product derived from that news.

### Suggested entities

Category, ContentFeed, News, NewsAsset, VideoGenerationRequest, Video, Research, Script, VideoPlan, VideoScene, GenerationJob, MediaAsset, RenderJob, QualityCheck, Publication, UserFeedInteraction.

### News lifecycle

News items move through states independently of video generation:

Discovered → Normalized → Categorized → Published to Feed → Available

News can also be Archived if it becomes stale.

### Video lifecycle

Videos move through their own state machine:

Requested → Queued → Researching → Script Generating → Planning → Generating Media → Media Ready → Rendering → Quality Check → Ready → Published

Failure states include Generation Failed, Render Failed, QC Failed, and Upload Failed.

Because News and Video are separate, one news article can eventually produce multiple videos such as a YouTube long-form video, a TikTok short, and an Instagram Reel.

---

## 8. Implementation Structure

The backend can be organized into modules that mirror the architecture:

- Content module: discovery, categories, news, and source assets
- Video module: generation orchestrator, research, script, planning, scenes, and rendering
- AI module: LLM integration and Runway provider
- Assets module: storage service and object storage provider
- Media processing module: FFmpeg, composition, subtitles, and audio
- Quality control module: validators and checks
- Publishing module: platform adapters for YouTube, TikTok, and Instagram
- Queues module: workers for generation, research, script, Runway, rendering, and publishing
- Common module: database, configuration, logging, and error handling

---

## 9. Operational Concerns

### Error handling

- Fail at the right layer. A video provider failure should not crash the web server.
- Retry transient failures with backoff.
- Surface permanent failures visibly in the dashboard.
- Resume from the failure point rather than restarting the entire pipeline.
- Store every stage result so retries are cheap.

### Observability

Track job queue depth, stage durations, retry counts, provider latency and errors, storage usage, FFmpeg success and failure rates, and video lifecycle state transitions. Every stage should log its name, request identifier, timestamps, outcome, and relevant metadata.

### Cost control

AI video generation is expensive. Reduce cost by reusing source assets, batching scene generation, caching research and scripts for identical inputs, using cheaper models for drafts, and monitoring per-video cost.

The dashboard can show generation quota or estimated cost before a creator clicks Generate. Administrators can throttle generation or disable costly categories and sources.

### Development vs production

In development, use a small set of real RSS sources, mock Runway responses where possible, use local or dev object storage, run workers in the same process, and keep the dashboard and API on a local dev server.

In production, run Redis and BullMQ workers independently, use real object storage, add monitoring and alerting, implement rate limiting and cost quotas, and separate web servers from worker processes.

---

## 10. MVP Scope

The first implementation should avoid building every possible feature. The recommended MVP is:

- Poll a small set of African business news RSS sources
- Normalize and categorize discovered content
- Extract and store source asset references
- Present a global dashboard feed with category filtering
- Allow creators to click Generate Video
- Create a video generation request and enqueue it
- Run conditional research and script generation
- Plan scenes with simple asset reuse
- Generate missing visuals and narration with Runway
- Store media in object storage
- Assemble the final video with FFmpeg
- Run basic quality checks
- Return the finished video to the dashboard
- Support manual publishing to YouTube, with auto-publish behind a user setting

Initially avoid: multiple video providers, complicated AI QC, advanced stock-media routing, automatic scene correction, complex editing UI, multiple TTS providers, and full multi-platform publishing. Design for those, but build YouTube first.

---

## 11. Long-Term Direction

Once the MVP is stable, the system can evolve toward:

- More source types such as news APIs and financial data feeds
- More categories with platform-specific target strategies
- Multi-platform output from a single news item
- Smarter video planner that automatically chooses the cheapest accurate visual source
- More AI provider options behind the same interfaces
- Platform adapters for TikTok, Instagram, and others
- Personalization such as per-user feed preferences and saved templates

---

## 12. Core Principle

The most important architectural rule is:

> Each layer should know what it is responsible for, but should not know the internal implementation details of the layers around it.

This gives a pipeline that starts as a dashboard-driven, creator-triggered workflow but can eventually support automated, multi-platform generation without redesigning the entire system.
