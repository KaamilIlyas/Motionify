# 🎬 Motionify — AI Motion Graphics Generator

Motionify is a web application that takes a text prompt and generates professional motion graphics videos. It uses AI to write React-based animation code and renders it into a downloadable MP4 video.

---

## ⚙️ How It Works (Step-by-Step)

Instead of generating expensive frame-by-frame images like traditional AI video models, Motionify uses a highly efficient, hybrid **AI-to-React-to-Video** approach:

```
[ User Input ]
      │
      ▼
┌──────────────┐
│  Next.js API │ ──► Appends framework specs & instructions
└──────────────┘
      │
      ▼
┌──────────────┐
│  OpenRouter  │ ──► Generates custom React/TSX code on-the-fly
└──────────────┘
      │
      ▼
┌──────────────┐
│   Compiler   │ ──► Bundles code. If it fails, reads error stack
│  Auto-Heal   │     and asks AI to fix/repair code automatically!
└──────────────┘
      │
      ▼
┌──────────────┐
│   Remotion   │ ──► Launches headless Chromium, renders frames, compiles MP4
└──────────────┘
      │
      ▼
[ Download MP4 ]
```

### 1. User Inputs a Prompt
A user enters a prompt (e.g., *"Create a 30-second luxury watch video with a drawing geometric clock face"*).

### 2. Prompt is Sent to OpenRouter
The Next.js backend sends this prompt along with a detailed system instruction ([`lib/prompts.ts`](file:///Users/kamililyas/Documents/saas/motionify-app/lib/prompts.ts)) containing design patterns, styling parameters, and video specs to **OpenRouter** using the free **`google/gemma-4-31b-it:free`** model.

### 3. AI Generates Custom React Code
The AI writes custom React/TSX animation code using Remotion primitives (like `interpolate()`, `spring()`, and `AbsoluteFill`).
* *Why?* This gives the AI **total design freedom** to create custom shapes, timeline structures, SVGs, and text effects bespoke to the user's specific prompt.

### 4. Code is Saved Locally
The Next.js backend writes the generated code to a temporary workspace on disk:
`/tmp/motionify/<jobId>/index.tsx`

### 5. Compiler & Auto-Healing Validation
Before rendering, the backend attempts to bundle the code using `@remotion/bundler`. 
* **If it fails to compile:** The system catches the error stack (e.g. `ReferenceError: height is not defined`) and makes a fast follow-up request to OpenRouter to **auto-heal/repair the code** based on the compiler diagnostics. It then overwrites the file and tries again. This ensures a near-100% compilation success rate.

### 6. Remotion Renders the Video
Once compiled successfully, Remotion launches a **headless Chromium** browser window in the background, steps through the animations frame-by-frame, captures screenshots, and compiles them into a high-quality **H.264 MP4 video**.

### 7. User Downloads the Video
While rendering occurs in the background, the frontend polls `/api/status/[jobId]` every 2 seconds. Once complete, the user downloads the MP4.

---

## 🛠️ Setup & Running

### Prerequisites
* **Node.js** (v18+)
* **Chrome/Chromium** installed on the host machine (Remotion requires it to render the video).

### 1. Configure Keys
Create or open your local `.env.local` file at the root of the project and add your OpenRouter API key:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 2. Run the App
```bash
# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
