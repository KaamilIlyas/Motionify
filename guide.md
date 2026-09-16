## 1. Overview

**Motionify** is a full-stack web application that turns text prompts into crisp, 10-second 1080p 60fps SaaS launch videos.

### The Core Concept: AI-to-Code
Traditional AI video generators (like Sora or Runway) create blurry text, distorted UI layouts, and take a long time to generate. 

Motionify solves this with a two-part system:
1. **AI (Gemini) handles the script:** It writes a structured 3-act story (Hook, Product Proof, Call to Action) in JSON.
2. **Remotion handles the rendering:** It runs React components frame-by-frame inside headless Chromium and compiles a razor-sharp MP4 video using FFmpeg.

---

## 2. System Pipeline (How It Works)

```
[User Prompt] 
      │
      ▼
1. Story Generation (app/api/generate/route.ts + lib/gemini.ts)
   Gemini creates a 3-act storyboard JSON (Hook, Proof, CTA).
      │
      ▼
2. Job Queue (lib/job-store.ts)
   Sets up a temp folder in /tmp/motionify/<jobId> with config.json and template.tsx.
   Limits concurrent renders so the server does not overload.
      │
      ▼
3. Headless Rendering (lib/renderer.ts)
   Remotion bundles the React code and runs it in headless Chromium.
   Steps through 600 frames (10 seconds @ 60fps).
      │
      ▼
4. Video Encoding (FFmpeg)
   Compiles raw frames into a 1080p H.264 MP4 file.
      │
      ▼
5. Instant Playback & Download (app/page.tsx + app/api/download/[jobId]/route.ts)
   The browser polls the status and streams the finished MP4 video.
```

---

## 3. Tech Stack & Why It Was Chosen

| Technology | Role | Why It Was Chosen |
| :--- | :--- | :--- |
| **Next.js 16 & React 19** | Full-stack app & APIs | Single codebase for the studio interface, background jobs, and API routes. |
| **Remotion** | Programmatic video engine | Renders React components as real video. Guarantees sharp text and smooth 60fps motion. |
| **FFmpeg** | Video encoding | Encodes browser frames directly into standard H.264 MP4 files. |
| **Google Gemini 2.5 Flash** | Narrative storyboard generator | Fast response (<2 seconds) and strictly adheres to JSON schemas. Has fallbacks to Groq/OpenRouter. |
| **Pure CSS 3D & SVG** | Visual mockups | Browser windows, phone mockups, and cards are styled with CSS 3D transforms instead of Three.js to avoid headless WebGL crashes. |
| **Tailwind CSS v4** | Studio UI | Fast, lightweight styling for the dark-mode studio interface. |

---

## 4. The 4 Visual Archetypes

Motionify includes 4 built-in design styles inside `lib/template.tsx`:

1. **AI Copilot (`saas-window`):**
   - 3D tilted browser window with macOS buttons.
   - Dynamic metric badge (e.g. `+340%`), animated sparkline chart, and terminal bar.
2. **Speed Engine (`kinetic-punch`):**
   - High-energy kinetic typography cuts.
   - Holographic radar circle, laser sweeps, and speed benchmark cards.
3. **Mobile App (`mobile-showcase`):**
   - 3D smartphone frame with Dynamic Island notch.
   - Floating iOS notification banner, circular progress ring, and app rating badge.
4. **Fintech Grid (`fintech-grid`):**
   - Cyber grid background with perspective floor.
   - 3D metallic credit card with gold chip, and live transaction ledger (`+$12.4M`).

---

## 5. Key Engineering Problems & Solutions

### 1. Sharp Text vs. Blurry AI Video
- **Problem:** AI diffusion models cannot generate clear UI cards or legible text.
- **Solution:** AI only plans the story structure. React and Remotion draw all text and UI elements as clean vector code.

### 2. Preventing Browser Stutter & Lag
- **Problem:** Playing heavy animations inside the user's browser slows down their machine.
- **Solution:** All heavy rendering happens on the server. The user only sees a lightweight progress bar, followed by the finished MP4 video via native hardware-accelerated playback.

### 3. Avoiding WebGL Crashes in Headless Servers
- **Problem:** 3D libraries (Three.js/WebGL) often crash in headless Docker and Linux servers without GPUs.
- **Solution:** All 3D angles and cards are built using mathematical CSS 3D transforms (`perspective`, `rotateX`, `rotateY`) and SVGs, which work 100% reliably on standard CPUs.

### 4. Server Resource Protection
- **Problem:** Multiple video render jobs at the same time can run the server out of memory.
- **Solution:** An in-memory queue (`lib/job-store.ts`) limits active renders to 2 at a time, buffering the rest and cleaning up temporary files after 10 minutes.

---

## 6. Project Structure

```
motionify-app/
├── app/
│   ├── api/generate/route.ts        # Starts video generation job
│   ├── api/status/[jobId]/route.ts  # Checks job progress (0% to 100%)
│   ├── api/download/[jobId]/route.ts# Streams completed MP4 file
│   ├── layout.tsx                   # Page layout, fonts, and favicon
│   ├── page.tsx                     # Main Studio UI
│   ├── icon.svg                     # Custom SVG brand favicon
│   └── favicon.ico                  # Fallback favicon
├── components/
│   ├── StudioHeader.tsx             # Navbar and brand logo
│   ├── ArchetypeSelector.tsx        # Card selector for the 4 design styles
│   ├── ProgressTracker.tsx          # Real-time render progress bar
│   └── StudioMonitor.tsx            # Video preview and download buttons
├── lib/
│   ├── config.ts                    # Global settings (fps, duration, limits)
│   ├── gemini.ts                    # Storyboard AI prompt & schema validation
│   ├── job-store.ts                 # In-memory queue & rate limiter
│   ├── renderer.ts                  # Remotion bundling & Chromium render loop
│   └── template.tsx                 # React video template for the 4 archetypes
└── guide.md                         # This architecture guide
```
