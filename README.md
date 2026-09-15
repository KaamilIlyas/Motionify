# Motionify

AI-powered SaaS launch commercial generator. Creates agency-grade, 10-second (60fps) motion graphic product videos from simple product descriptions using programmatic React animation and Remotion rendering.

---

## Features

- **4 Commercial Design Archetypes:**
  - `AI Copilot`: 3D browser window with metric badge, live terminal, and animated SVG sparkline.
  - `Speed Engine`: Kinetic typography promo with holographic radar circle and velocity benchmark card.
  - `Mobile App`: 3D smartphone frame with Dynamic Island, circular progress ring, and App Store badge.
  - `Fintech Checkout`: Cyber telemetry grid, 3D metallic card with microchip, and live currency settlement ledger.
- **AI Narrative Synthesis:** Gemini / Groq generates a structured 3-act launch story (Hook, Product Proof, Climax).
- **Programmatic Video Rendering:** Remotion renders React components frame-by-frame into production-grade H.264 MP4.
- **Hardware-Accelerated Playback:** Lag-free HTML5 video playback and instant download.
- **Responsive Studio UI:** Works across all screen sizes down to 320px mobile.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Video Engine:** Remotion (`@remotion/bundler`, `@remotion/renderer`)
- **AI Providers:** Google Gemini API (`gemini-2.5-flash`) / Groq / OpenRouter fallback
- **Styling & Motion:** Tailwind CSS v4, Framer Motion

---

## Getting Started

### Prerequisites

- Node.js 18+
- Chrome or Chromium installed (required by Remotion for headless rendering)
- Google Gemini API key or Groq API key

### 1. Environment Setup

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
# Optional fallbacks
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 2. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How It Works

```
User Input ──► Next.js API ──► LLM (Gemini/Groq) ──► 3-Act Video Config
                                                            │
User Downloads MP4 ◄── /api/download ◄── Remotion Renderer ◄┘
```

1. **User inputs brand identity & key metric** in the studio form or selects a preset archetype.
2. **API invokes LLM** to produce a typed 3-act commercial storyboard JSON.
3. **Remotion Bundler & Renderer** builds the React motion graphics composition in headless Chromium.
4. **H.264 MP4** is saved to `/tmp/motionify/` and streamed to the client for playback and download.
