# Motionify

An AI-powered SaaS motion graphics engine. Generates 60fps Full HD commercial product launch videos from brand descriptions using Google Gemini for storyboarding and Remotion for programmatic video rendering.

## Features

- **4 Design Archetypes**: `AI Copilot` (browser & terminal UI), `Speed Engine` (kinetic typography promo), `Mobile App` (3D smartphone frame), and `Fintech Checkout` (telemetry grid & metallic card).
- **Automated Storyboarding**: Generates a typed 3-act launch script (Hook, Product Proof, Climax) via Google Gemini API (with Groq and OpenRouter fallbacks).
- **Programmatic Video Synthesis**: Remotion renders parameterized React components frame-by-frame in headless Chromium and encodes to H.264 MP4 via FFmpeg.
- **Hardware-Accelerated Studio**: Real-time browser playback, responsive preview, and one-click MP4 export.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Video Engine**: Remotion (`@remotion/bundler`, `@remotion/renderer`), FFmpeg
- **AI**: Google Gemini API (`gemini-2.5-flash`), Groq, OpenRouter
- **Styling & Motion**: Tailwind CSS v4, Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- Google Chrome or Chromium (required by Remotion for headless rendering)
- Google Gemini API key

### Setup

1. Clone and install dependencies:
   ```bash
   git clone https://github.com/KaamilIlyas/Motionify.git
   cd Motionify
   npm install
   ```

2. Configure environment variables in `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   # Optional fallbacks:
   GROQ_API_KEY=your_groq_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## License

MIT\n