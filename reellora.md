<!-- INPUT SOURCES
  Reuters Africa RSS · Bloomberg Africa · BusinessDay Nigeria API
  African Development Bank reports · IMF/World Bank Africa data
        ↓
INTELLIGENCE LAYER
  Extract key facts/figures · identify story angle · pull statistics
        ↓
SCRIPT GENERATION (Claude/GPT-4 API)
  8-minute script per topic — hook, context, analysis, conclusion
  Tone: authoritative but accessible, for an African business audience
        ↓
VOICEOVER (ElevenLabs)
  Deep, authoritative African-accented voice — channel identity
        ↓
VISUALS
  Maps (Datawrapper API) · auto-generated charts/graphs
  Stock footage (Pexels API) · AI concept images (Flux API)
        ↓
ASSEMBLY (FFmpeg pipeline)
  Burned-in captions · background music (corporate/afrobeats fusion)
  Lower thirds for stats · branded intro/outro
        ↓
AUTO-PUBLISH (YouTube API)
  Optimized title/description/tags · auto-generated thumbnail
  Scheduled for peak audience time -->
  # Automated News-to-YouTube Video Generation Pipeline

## 1. Project Overview

This project is an automated content-to-video pipeline that transforms news/content discovered from RSS feeds into finished, YouTube-ready videos.

The target workflow is:

```text
RSS Feeds
    ↓
Content Ingestion
    ↓
Research & Analysis
    ↓
YouTube Script Generation
    ↓
Video Planning / Storyboarding
    ↓
Runway Video + TTS Generation
    ↓
Asset Management / Azure Blob Storage
    ↓
FFmpeg Composition & Post-Processing
    ↓
Quality Control
    ↓
YouTube Publishing
```

The expected output is a professionally assembled video, typically around 5–8 minutes long, containing generated visuals, narration, subtitles, branding, and YouTube metadata.

### Core architectural principle

> **NestJS orchestrates the pipeline, Runway generates the raw AI media, Amazon S3 Storage stores media assets, FFmpeg produces the final video, and the YouTube integration publishes the finished result.**

Runway is the selected AI video-generation engine for this project. Its TTS/narration capability is also part of the planned media-generation workflow, so a separate TTS provider is not required initially.

---

# 2. Architectural Goals

The architecture should be:

- **Asynchronous** — long-running AI/video operations must not block HTTP requests.
- **Fault tolerant** — individual generation failures should be retryable.
- **Observable** — every stage should expose status and errors.
- **Idempotent** — retries should not accidentally create duplicate content.
- **Provider-isolated** — Runway-specific implementation should not leak throughout the application.
- **Media-oriented** — large files should move through object storage rather than application memory.
- **Scalable** — multiple videos and scenes should be processable concurrently.
- **Resumable** — a failed scene should not require regenerating the entire video.
- **YouTube-ready** — final output must satisfy the technical requirements of the publishing stage.
- **Replaceable** — AI providers can eventually be changed without rewriting the whole system.

---

# 3. High-Level Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                        CONTENT PIPELINE                      │
└──────────────────────────────────────────────────────────────┘

                        RSS FEEDS
                            │
                            ▼
                 ┌─────────────────────┐
                 │ 1. INGESTION        │
                 │                     │
                 │ RSS → Articles      │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ 2. RESEARCH &       │
                 │    ANALYSIS         │
                 │                     │
                 │ Facts / Context     │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ 3. SCRIPT           │
                 │    GENERATION       │
                 │                     │
                 │ 5–8 min narration   │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ 4. VIDEO PLANNER    │
                 │                     │
                 │ Script → Scenes     │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ 5. RUNWAY           │
                 │    GENERATION       │
                 │                     │
                 │ Video + TTS         │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ 6. ASSET            │
                 │    MANAGEMENT       │
                 │                     │
                 │ Amazon S3 Bucket  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ 7. MEDIA            │
                 │    PROCESSING       │
                 │                     │
                 │ FFmpeg              │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ 8. QUALITY CONTROL  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ 9. YOUTUBE          │
                 │    PUBLISHING       │
                 └─────────────────────┘
```

---

# 4. Layer 1 — Content Ingestion

## Purpose

The ingestion layer is responsible for discovering and importing source content into the application.

Its fundamental question is:

> **What new content has entered the system?**

RSS is the primary input mechanism.

## Responsibilities

### RSS polling

The service periodically checks configured RSS feeds.

Examples:

- BBC
- CNN
- Al Jazeera
- Reuters
- Other configured publishers

The list of feeds should be configuration-driven rather than hard-coded.

### RSS parsing

The service parses RSS/XML documents and extracts fields such as:

- title
- URL
- publication date
- author
- source
- summary
- media references
- categories

### Article normalization

Different publishers structure RSS feeds differently.

The ingestion layer should normalize these differences into a common internal representation.

Example:

```typescript
interface Article {
  id: string;
  source: string;
  title: string;
  url: string;
  summary?: string;
  content?: string;
  author?: string;
  publishedAt: Date;
  discoveredAt: Date;
}
```

### Duplicate detection

The same article may appear during multiple polling cycles.

The ingestion layer should prevent duplicate article records using identifiers such as:

- canonical URL
- RSS GUID
- source + external ID
- content hash

### Source tracking

Every article should retain its source information.

This is important for:

- attribution
- research
- auditing
- debugging
- future content verification

### Raw content preservation

Where practical, preserve the original RSS payload or normalized source information so later stages can trace where a story came from.

## What this layer should NOT do

It should not:

- generate scripts
- perform final research
- generate video
- call Runway
- render media
- upload to YouTube

Its output is an **ingested content item**.

---

# 5. Layer 2 — Research & Analysis

## Purpose

The research layer transforms raw articles into structured information that can safely and intelligently drive script generation.

Its fundamental question is:

> **What do we actually know about this story?**

The ingestion layer gives us an article.

The research layer determines:

- important facts
- context
- entities
- events
- chronology
- supporting information
- potentially conflicting information

## Responsibilities

### Content analysis

Extract the important information from the article.

Example:

```json
{
  "topic": "Major offshore oil discovery",
  "keyFacts": [
    "...",
    "...",
    "..."
  ]
}
```

### Entity extraction

Identify:

- people
- companies
- organizations
- countries
- cities
- locations
- products
- events

### Timeline extraction

Where relevant, identify:

```text
Event A
   ↓
Event B
   ↓
Announcement
   ↓
Expected next step
```

This becomes useful to the script writer and video planner.

### Context gathering

A single RSS article may not contain enough information for a useful YouTube video.

The research layer can enrich the story using additional approved sources.

### Fact organization

The research output should distinguish between:

- confirmed facts
- claims
- context
- opinions
- uncertain information

This reduces the chance of the script presenting speculation as fact.

## Output

The research stage should produce a structured research object.

Example:

```typescript
interface ResearchResult {
  topic: string;
  summary: string;
  keyFacts: string[];
  entities: Entity[];
  timeline: TimelineEvent[];
  sources: SourceReference[];
  uncertainties: string[];
}
```

## What this layer should NOT do

It should not:

- create final video prompts
- generate Runway assets
- compose video
- publish to YouTube

Its job is to prepare reliable information for the script layer.

---

# 6. Layer 3 — Script Generation

## Purpose

The script generation layer transforms research into a YouTube-style narration script.

Its fundamental question is:

> **What should the audience hear?**

The expected output is generally a 5–8 minute script.

## Responsibilities

### Story structure

The script should have a coherent structure, for example:

```text
Hook
 ↓
Context
 ↓
Main development
 ↓
Evidence / details
 ↓
Why it matters
 ↓
What happens next
 ↓
Conclusion
```

### Audience-oriented writing

The script should be written for spoken delivery rather than as an academic article.

It should:

- sound natural when narrated
- avoid unnecessarily complex sentences
- maintain audience interest
- introduce context progressively
- avoid repetitive statements

### Duration targeting

The system should estimate narration duration based on word count and target speaking rate.

The script generator should target the configured duration rather than simply producing an arbitrary number of words.

### Metadata generation

The script stage may also produce:

- working title
- alternate titles
- description
- keywords
- suggested tags
- thumbnail concept

These can later be refined before publishing.

## Example output

```typescript
interface VideoScript {
  title: string;
  hook: string;
  sections: ScriptSection[];
  conclusion: string;
  estimatedDurationSeconds: number;
}
```

## Important separation

The script generator primarily determines:

> **WHAT IS SAID**

It does not determine exactly:

> **WHAT IS SHOWN**

That is the responsibility of the Video Planner.

---

# 7. Layer 4 — Video Planner / Storyboard

## Purpose

The Video Planner converts the spoken script into a visual production plan.

This is one of the most important layers in the system.

Its fundamental question is:

> **How should this story be visually presented?**

A 5–8 minute script should not be sent to Runway as one large generation request.

Instead, it should be broken into scenes.

## Responsibilities

### Scene segmentation

Break the script into visually meaningful scenes.

Example:

```text
Scene 01 — Hook
Scene 02 — Background
Scene 03 — Main event
Scene 04 — Location
Scene 05 — Key person
Scene 06 — Reaction
...
Scene N — Conclusion
```

### Scene duration

Each scene receives a target duration.

Because AI video generation is clip-based, a long narration section may require multiple visual clips.

### Visual prompt generation

The planner converts narration into visual instructions.

Example:

```json
{
  "narration": "The company announced a major offshore discovery.",
  "visual": {
    "type": "runway",
    "prompt": "Cinematic aerial view of a modern offshore oil platform..."
  }
}
```

### Visual strategy

The planner should eventually be able to choose between visual types such as:

```text
runway_video
image
stock_video
map
chart
text_graphic
archive_media
```

Runway is the selected AI video engine, but not every second of a YouTube video necessarily needs to be AI-generated.

### Narration mapping

Each scene should identify exactly which narration belongs to it.

This creates synchronization between:

```text
Narration
    +
Visual
```

### Transition planning

The planner can specify:

- cut
- fade
- dissolve
- zoom
- graphic transition
- lower-third appearance

These instructions are later consumed by the composition layer.

## Example VideoPlan

```typescript
interface VideoPlan {
  videoId: string;
  title: string;
  estimatedDurationSeconds: number;
  scenes: VideoScene[];
}

interface VideoScene {
  id: string;
  order: number;
  narration: string;
  durationSeconds: number;

  visual: {
    type: 'runway' | 'image' | 'stock' | 'graphic' | 'map';
    prompt?: string;
    referenceImageUrl?: string;
  };

  transition?: {
    type: string;
    durationSeconds?: number;
  };
}
```

## What this layer should NOT do

It should not:

- directly render the final video
- perform FFmpeg operations
- upload to YouTube
- permanently store generated media

It produces the **production blueprint**.

---

# 8. Layer 5 — Runway Generation

## Purpose

The Runway layer is the AI media-generation engine.

Its fundamental question is:

> **Can we generate the visual media and narration required by this scene?**

Runway is responsible for generating the raw AI media required by the VideoPlan.

## Responsibilities

### Video generation

For each Runway scene:

```text
Visual Prompt
      ↓
Runway
      ↓
Generated Video Clip
```

Depending on the selected Runway workflow, generation may use:

- text-to-video
- image-to-video
- other supported generation inputs

### TTS / narration generation

Runway's TTS capability is part of this architecture.

Therefore the initial system does NOT require a separate TTS provider.

Conceptually:

```text
Scene narration
      ↓
Runway TTS
      ↓
Narration audio
```

### Generation job management

Runway generation is asynchronous.

The application should maintain a job record such as:

```typescript
interface VideoGenerationJob {
  id: string;
  sceneId: string;
  provider: 'runway';
  providerTaskId: string;
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed';
  outputUrl?: string;
  error?: string;
}
```

### Polling / task monitoring

The service monitors Runway generation tasks until they reach a terminal state.

### Retry handling

Transient failures should be retryable.

Permanent failures should be recorded and surfaced to the orchestration layer.

### Provider isolation

Only the Runway provider implementation should know the Runway SDK/API details.

Use an abstraction such as:

```typescript
interface VideoGenerator {
  generate(
    request: VideoGenerationRequest,
  ): Promise<VideoGenerationJob>;

  getStatus(
    jobId: string,
  ): Promise<VideoGenerationStatus>;

  cancel(
    jobId: string,
  ): Promise<void>;
}
```

Then:

```text
VideoGenerator
      │
      └── RunwayVideoGenerator
```

This means the rest of the application does not depend directly on Runway.

## What this layer should NOT do

Runway should not be responsible for:

- assembling the complete 5–8 minute video
- YouTube upload
- final application storage
- final video QC
- application-level orchestration

Runway generates **raw scene media**.

---

# 9. Layer 6 — Asset Management

## Purpose

The Asset Management layer owns the lifecycle of media files generated or consumed by the pipeline.

The project uses Azure Blob Storage as the primary object storage layer.

Its fundamental question is:

> **Where are our media assets, and how do we reliably manage them?**

## Responsibilities

### Store generated media

When Runway generates a scene:

```text
Runway
   ↓
Generated Asset
   ↓
Asset Manager
   ↓
Azure Blob Storage
```

### Organize assets

A recommended structure is:

```text
videos/
  {videoId}/

    script/
      script.json

    scenes/
      {sceneId}/
        video.mp4
        narration.mp3
        metadata.json

    final/
      video.mp4
      thumbnail.jpg
      subtitles.vtt
```

### Asset metadata

Maintain metadata such as:

```typescript
interface MediaAsset {
  id: string;
  videoId: string;
  sceneId?: string;
  type: 'video' | 'audio' | 'image' | 'subtitle';
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number;
}
```

### Temporary asset management

Some files are intermediate files and may eventually be deleted.

The asset layer should support lifecycle policies.

### Stable application references

The rest of the application should reference an internal asset ID or storage key rather than depending on external Runway URLs.

## Why this matters

Runway is an external generation provider.

Your application should not depend on an external generation URL remaining available forever.

Once an asset is generated:

```text
External provider
       ↓
Your storage
       ↓
Your pipeline
```

---

# 10. Layer 7 — Media Processing / FFmpeg

## Purpose

The Media Processing layer transforms individual media assets into the final video.

Its fundamental question is:

> **How do we turn the generated assets into one professional video?**

This is where the existing FFmpeg work belongs.

## Responsibilities

### Scene composition

Combine:

```text
Scene video
+
Narration
```

into synchronized scene outputs where required.

### Concatenation

Combine all scene outputs:

```text
Scene 01
Scene 02
Scene 03
...
Scene N
      ↓
   FFmpeg
      ↓
final.mp4
```

### Audio processing

Handle:

- narration volume
- background music
- audio mixing
- audio normalization
- silence management
- synchronization

### Subtitles

Generate or consume subtitle files and optionally burn them into the video.

Supported formats may include:

- SRT
- VTT
- ASS

### Branding

Apply:

- channel logo
- watermark
- intro
- outro
- lower thirds
- visual identity

### Video formatting

Handle:

- 16:9 YouTube format
- resolution
- frame rate
- codec
- bitrate
- pixel format

### Transitions

Apply the transitions specified by the Video Planner.

### Thumbnail processing

Generate or process the final thumbnail where required.

## Important principle

FFmpeg is the **final media assembly engine**.

Runway generates the raw AI assets.

FFmpeg turns them into the final product.

---

# 11. Layer 8 — Quality Control

## Purpose

The Quality Control layer verifies that the final video is valid before publication.

Its fundamental question is:

> **Is this video actually ready for YouTube?**

## Responsibilities

### File validation

Check:

- file exists
- file is readable
- file size is reasonable
- correct MIME type
- no obvious corruption

### Video validation

Check:

- duration
- resolution
- frame rate
- video stream
- codec
- aspect ratio

### Audio validation

Check:

- audio stream exists
- duration matches video appropriately
- audio is not missing
- audio levels are within expected range

### Subtitle validation

Check:

- subtitle file exists if required
- timestamps are valid
- subtitle duration is compatible with video

### Scene validation

Optionally verify that all expected scenes have successfully produced assets.

```text
Scene 01 ✓
Scene 02 ✓
Scene 03 ✓
Scene 04 ✓
...
Scene N  ✓
```

### AI-based QC

A later version can use AI to check:

- visual relevance
- narration/visual alignment
- missing scenes
- unexpected visual artifacts
- inappropriate generated content

This should initially be optional rather than blocking the entire MVP.

---

# 12. Layer 9 — YouTube Publishing

## Purpose

The YouTube Publishing layer takes an approved final video and publishes it.

Its fundamental question is:

> **How do we publish the finished asset to YouTube?**

## Responsibilities

### Video upload

Upload the final MP4.

### Metadata

Set:

- title
- description
- tags
- category
- language
- visibility

### Thumbnail

Upload the generated thumbnail.

### Scheduling

Support:

- immediate publishing
- private upload
- unlisted upload
- scheduled publishing

### Upload tracking

Persist:

```typescript
interface YouTubePublication {
  videoId: string;
  youtubeVideoId?: string;
  status:
    | 'pending'
    | 'uploading'
    | 'published'
    | 'failed';
  publishedAt?: Date;
  error?: string;
}
```

### Idempotency

A failed request should not accidentally publish duplicate videos.

The publishing layer should track the internal video ID and YouTube video ID.

## What this layer should NOT do

It should not:

- generate videos
- call Runway
- run FFmpeg
- create scripts
- research articles

It only publishes completed assets.

---

# 13. Queue / Orchestration Layer

The layers above describe business responsibilities.

Because this is a media pipeline, they should NOT be executed as one long HTTP request.

A queue/orchestration layer should coordinate them.

BullMQ with Redis is a good fit for this architecture.

## Example workflow

```text
article.ingest
      ↓
research.generate
      ↓
script.generate
      ↓
video.plan
      ↓
scene.generate × N
      ↓
asset.store
      ↓
video.compose
      ↓
video.qc
      ↓
youtube.upload
```

## Scene-level parallelism

Scenes can be generated independently.

For example:

```text
                Video Plan
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
    Scene 01     Scene 02     Scene 03
       ↓            ↓            ↓
     Runway       Runway       Runway
       ↓            ↓            ↓
      Asset        Asset        Asset
       └────────────┼────────────┘
                    ↓
                FFmpeg
```

This is one of the major reasons the system should use queues.

## Queue responsibilities

The queue system should handle:

- asynchronous processing
- retries
- concurrency
- delayed jobs
- failed jobs
- backoff
- job status
- worker isolation

---

# 14. Database Model

The database should represent the pipeline state.

A conceptual model:

```text
Article
   │
   ▼
Research
   │
   ▼
Video
   │
   ├── Script
   │
   ├── VideoPlan
   │      │
   │      └── Scene[]
   │             │
   │             ├── GenerationJob
   │             └── MediaAsset
   │
   ├── FinalMedia
   │
   ├── QualityCheck
   │
   └── YouTubePublication
```

## Suggested entities

```text
Article
Research
Video
Script
VideoScene
GenerationJob
MediaAsset
RenderJob
QualityCheck
YouTubePublication
```

---

# 15. Video Lifecycle

A video should have a state machine.

Example:

```text
DISCOVERED
    ↓
RESEARCHING
    ↓
SCRIPT_GENERATING
    ↓
PLANNING
    ↓
GENERATING_MEDIA
    ↓
MEDIA_READY
    ↓
RENDERING
    ↓
QUALITY_CHECK
    ↓
READY_TO_PUBLISH
    ↓
UPLOADING
    ↓
PUBLISHED
```

Failure states should be explicit:

```text
GENERATION_FAILED
RENDER_FAILED
QC_FAILED
UPLOAD_FAILED
```

A retry should transition the relevant stage back to a processing state rather than restart the entire pipeline unnecessarily.

---

# 16. Recommended NestJS Module Structure

```text
src/
│
├── ingestion/
│   ├── ingestion.module.ts
│   ├── ingestion.service.ts
│   ├── rss/
│   └── article/
│
├── research/
│   ├── research.module.ts
│   ├── research.service.ts
│   └── providers/
│
├── script/
│   ├── script.module.ts
│   ├── script.service.ts
│   └── prompts/
│
├── video-planning/
│   ├── video-planning.module.ts
│   ├── video-planner.service.ts
│   ├── schemas/
│   └── prompts/
│
├── video-generation/
│   ├── video-generation.module.ts
│   ├── video-generator.interface.ts
│   ├── video-generation.service.ts
│   │
│   └── runway/
│       ├── runway.module.ts
│       ├── runway.service.ts
│       ├── runway.types.ts
│       └── runway.mapper.ts
│
├── assets/
│   ├── assets.module.ts
│   ├── asset.service.ts
│   └── azure/
│       ├── azure-storage.service.ts
│       └── azure-storage.types.ts
│
├── media-processing/
│   ├── media-processing.module.ts
│   ├── ffmpeg.service.ts
│   ├── composition.service.ts
│   ├── audio.service.ts
│   └── subtitle.service.ts
│
├── quality-control/
│   ├── quality-control.module.ts
│   ├── quality-control.service.ts
│   └── validators/
│
├── youtube/
│   ├── youtube.module.ts
│   ├── youtube.service.ts
│   └── youtube.types.ts
│
├── queues/
│   ├── queues.module.ts
│   ├── ingestion/
│   ├── research/
│   ├── script/
│   ├── video-generation/
│   ├── rendering/
│   └── publishing/
│
└── common/
    ├── database/
    ├── logging/
    ├── config/
    └── errors/
```

---

# 17. Runway Provider Isolation

Do not make the rest of the application directly dependent on Runway.

Prefer:

```typescript
export interface VideoGenerator {
  generate(
    request: VideoGenerationRequest,
  ): Promise<VideoGenerationResult>;

  getStatus(
    providerTaskId: string,
  ): Promise<VideoGenerationStatus>;
}
```

Implementation:

```typescript
@Injectable()
export class RunwayVideoGenerator
  implements VideoGenerator {

  async generate(
    request: VideoGenerationRequest,
  ): Promise<VideoGenerationResult> {
    // Runway implementation
  }

  async getStatus(
    providerTaskId: string,
  ): Promise<VideoGenerationStatus> {
    // Runway implementation
  }
}
```

Then:

```text
Application
     │
     ▼
VideoGenerator interface
     │
     ▼
RunwayVideoGenerator
     │
     ▼
Runway API
```

This protects the rest of the application from provider-specific implementation details.

---

# 18. Storage Strategy

Azure Blob Storage remains the system's media storage layer.

Do not move large media through NestJS unnecessarily.

Prefer:

```text
Runway
  ↓
download/transfer
  ↓
Azure Blob
  ↓
FFmpeg worker
  ↓
Azure Blob
```

Rather than:

```text
Runway
  ↓
NestJS memory
  ↓
NestJS
  ↓
FFmpeg
```

The application should pass around:

- asset IDs
- storage keys
- URLs
- metadata

rather than large binary payloads.

---

# 19. Media Processing Philosophy

The system should distinguish between:

### Generation

Performed by Runway.

```text
"Create this visual."
"Generate narration."
```

### Storage

Performed by Azure Blob.

```text
"Keep this asset."
```

### Processing

Performed by FFmpeg.

```text
"Combine these assets."
"Normalize this audio."
"Add these subtitles."
```

### Publishing

Performed by YouTube integration.

```text
"Publish this completed video."
```

This separation is fundamental to the architecture.

---

# 20. End-to-End Example

Suppose the RSS layer discovers:

```text
"Major energy company announces new offshore discovery"
```

### Step 1 — Ingestion

```text
RSS
 ↓
Article #1001
```

### Step 2 — Research

```text
Article #1001
 ↓
ResearchResult
```

### Step 3 — Script

```text
ResearchResult
 ↓
7-minute YouTube script
```

### Step 4 — Video Planning

The script becomes:

```text
Scene 01 — Hook
Scene 02 — Location
Scene 03 — Company
Scene 04 — Discovery
Scene 05 — Technical explanation
Scene 06 — Economic implications
...
Scene 30 — Conclusion
```

### Step 5 — Runway

Each scene gets generated.

```text
Scene 01
 ├── Runway video
 └── Runway narration

Scene 02
 ├── Runway video
 └── Runway narration

...

Scene 30
 ├── Runway video
 └── Runway narration
```

### Step 6 — Storage

Assets are stored:

```text
Azure Blob
  ↓
videos/1001/scenes/scene-001/
videos/1001/scenes/scene-002/
...
```

### Step 7 — FFmpeg

```text
30 scenes
+
narration
+
music
+
subtitles
+
branding
      ↓
final.mp4
```

### Step 8 — QC

```text
final.mp4
 ↓
FFprobe + validation
 ↓
PASS
```

### Step 9 — YouTube

```text
final.mp4
+
title
+
description
+
thumbnail
 ↓
YouTube
```

---

# 21. Error Handling Philosophy

Failures should be isolated to the smallest possible unit.

Bad architecture:

```text
Scene 27 failed
     ↓
Restart entire video
```

Preferred architecture:

```text
Scene 27 failed
     ↓
Retry Scene 27
     ↓
Scene 27 succeeds
     ↓
Continue composition
```

Similarly:

```text
YouTube upload failed
     ↓
Retry upload
```

There should be no reason to regenerate Runway scenes merely because YouTube temporarily failed.

---

# 22. Observability

Every pipeline stage should produce structured logs.

Example:

```text
videoId=123
sceneId=27
stage=runway-generation
status=processing
providerTaskId=abc123
```

Track:

- job duration
- generation duration
- retries
- provider errors
- render duration
- file sizes
- upload duration
- total pipeline duration

This becomes particularly important once multiple videos are generated automatically.

---

# 23. Cost Control

AI video generation can become the most expensive component of the pipeline.

The architecture should therefore support:

- configurable model selection
- scene duration control
- maximum scenes per video
- retry limits
- concurrency limits
- draft vs production generation
- caching
- reuse of previously generated assets where appropriate

For example:

```text
Development
 ↓
Generate only 3 scenes
 ↓
Test composition
 ↓
Production
 ↓
Generate complete video
```

Do not generate an entire 8-minute video every time you are testing FFmpeg composition.

---

# 24. Development vs Production

## Development

Use:

```text
RSS
 ↓
Sample article
 ↓
Short script
 ↓
3–5 scenes
 ↓
Runway
 ↓
FFmpeg
 ↓
Local/temporary storage
```

This makes development considerably cheaper.

## Production

Use:

```text
RSS scheduler
 ↓
Research
 ↓
Script
 ↓
Video Plan
 ↓
Queue
 ↓
Runway workers
 ↓
Azure Blob
 ↓
FFmpeg workers
 ↓
QC
 ↓
YouTube
```

---

# 25. MVP Scope

The first implementation should avoid building every possible feature.

Recommended MVP:

```text
RSS
 ↓
Article
 ↓
LLM Research
 ↓
5–8 min Script
 ↓
Video Planner
 ↓
Runway
   ├── Video
   └── TTS
 ↓
Azure Blob
 ↓
FFmpeg
   ├── concatenate
   ├── audio
   ├── subtitles
   └── branding
 ↓
QC
 ↓
YouTube
```

Initially avoid over-engineering:

- multiple video providers
- complicated AI QC
- advanced stock-media routing
- sophisticated automatic scene correction
- complex editing UI
- multiple TTS providers

Those can be added after the core pipeline works reliably.

---

# 26. Long-Term Architecture

Once the MVP is stable, the system can evolve toward:

```text
                    VIDEO GENERATION
                          │
            ┌─────────────┼──────────────┐
            │             │              │
          Runway       Stock Media     Images
            │             │              │
            └─────────────┼──────────────┘
                          ↓
                    Asset Manager
                          ↓
                       FFmpeg
                          ↓
                         QC
                          ↓
                       YouTube
```

The Video Planner becomes intelligent enough to decide the best visual source for each scene.

For example:

```text
Historical event
    → archive/stock

Specific person
    → image + motion

Abstract concept
    → Runway

Location
    → map / image / Runway

Data
    → chart

Breaking-news footage
    → licensed source material
```

Runway remains the primary AI video-generation engine, but it does not have to generate every single visual.

---

# 27. Final Responsibility Matrix

| Layer | Primary Responsibility | Main Output |
|---|---|---|
| Ingestion | Discover and normalize source content | Article |
| Research | Understand and enrich the story | ResearchResult |
| Script | Write the spoken YouTube narrative | VideoScript |
| Video Planner | Convert script into visual scenes | VideoPlan |
| Runway | Generate AI video + TTS | Raw media |
| Asset Management | Store and manage media | MediaAsset |
| FFmpeg | Assemble and process media | Final MP4 |
| Quality Control | Verify final output | QC result |
| YouTube | Publish finished video | YouTube video |
| Queue/Orchestration | Coordinate asynchronous work | Pipeline state |

---

# 28. The Core Principle

The entire system can be summarized as:

```text
                    WHAT DO WE HAVE?
                           │
                         RSS
                           ↓
                    WHAT IS TRUE?
                           │
                       RESEARCH
                           ↓
                    WHAT DO WE SAY?
                           │
                        SCRIPT
                           ↓
                    WHAT DO WE SHOW?
                           │
                     VIDEO PLAN
                           ↓
                 HOW DO WE GENERATE IT?
                           │
                        RUNWAY
                    Video + TTS
                           ↓
                  WHERE DO WE KEEP IT?
                           │
                      AZURE BLOB
                           ↓
                  HOW DO WE ASSEMBLE IT?
                           │
                        FFmpeg
                           ↓
                   IS IT READY?
                           │
                          QC
                           ↓
                   WHERE DOES IT GO?
                           │
                       YOUTUBE
```

The most important architectural rule is:

> **Each layer should know what it is responsible for, but should not know the internal implementation details of the layers around it.**

This gives you a pipeline that can start relatively small but eventually support automated generation of many YouTube videos without having to redesign the entire system.
