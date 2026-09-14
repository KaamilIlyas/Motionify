import fs from 'fs/promises';
import path from 'path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import {
  RENDER_BASE_DIR,
  DURATION_PRESETS,
  RESOLUTION_PRESETS,
  VIDEO_FPS,
} from './config';
import {
  updateJob,
  releaseRenderSlot,
  dequeueJob,
  acquireRenderSlot,
  getJob,
  type Job,
} from './job-store';
import { generateRemotionCode, repairRemotionCode } from './gemini';

// ─── Main Render Pipeline ────────────────────────────────────────────────────

export async function processJob(jobId: string): Promise<void> {
  const job = getJob(jobId);
  if (!job) {
    console.error(`[Renderer] Job ${jobId} not found`);
    return;
  }

  try {
    // ── Step 1: Get or Generate Timeline JSON ──
    let timelineJson = '';
    if (job.config) {
      timelineJson = typeof job.config === 'string' ? job.config : JSON.stringify(job.config, null, 2);
      updateJob(jobId, { status: 'generating', progress: 30 });
    } else {
      updateJob(jobId, { status: 'generating', progress: 10 });
      timelineJson = await generateRemotionCode(job.prompt, job.options);
      try {
        const parsed = JSON.parse(timelineJson);
        updateJob(jobId, { config: parsed, progress: 30 });
      } catch {
        updateJob(jobId, { progress: 30 });
      }
    }

    // ── Step 2: Set up temp job workspace ──
    const jobDir = path.join(RENDER_BASE_DIR, jobId);
    await fs.mkdir(jobDir, { recursive: true });

    // Write the Timeline JSON config
    const configPath = path.join(jobDir, 'config.json');
    await fs.writeFile(configPath, timelineJson, 'utf-8');

    // Copy the static template component as template.tsx and index.tsx in the directory
    const templateSourcePath = path.join(process.cwd(), 'lib', 'template.tsx');
    const threeSceneSourcePath = path.join(process.cwd(), 'lib', 'ThreeScene.tsx');
    const entryPoint = path.join(jobDir, 'template.tsx');
    const indexDest = path.join(jobDir, 'index.tsx');
    const threeSceneDest = path.join(jobDir, 'ThreeScene.tsx');
    await fs.copyFile(templateSourcePath, entryPoint);
    await fs.copyFile(templateSourcePath, indexDest);
    await fs.copyFile(threeSceneSourcePath, threeSceneDest);

    // Write a minimal tsconfig for the bundler
    await fs.writeFile(
      path.join(jobDir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2018',
            module: 'commonjs',
            jsx: 'react-jsx',
            esModuleInterop: true,
            strict: false,
            skipLibCheck: true,
            outDir: './dist',
          },
          include: ['*.tsx', '*.ts'],
        },
        null,
        2
      )
    );

    updateJob(jobId, { progress: 40 });

    // ── Step 3 & 4: Bundle & Select Composition (With Auto-Healing for JSON syntax) ──
    updateJob(jobId, { status: 'rendering', progress: 50 });

    let bundleLocation: string;
    let composition: any;
    const { frames: durationFrames } = DURATION_PRESETS[job.options.duration];
    const { width, height } = RESOLUTION_PRESETS[job.options.resolution];

    const compileAndValidate = async () => {
      const loc = await bundle({
        entryPoint,
        publicDir: path.join(process.cwd(), 'public'),
        webpackOverride: (config) => {
          return {
            ...config,
            resolve: {
              ...config.resolve,
              modules: [
                ...(config.resolve?.modules || ['node_modules']),
                path.join(process.cwd(), 'node_modules'),
              ],
            },
          };
        },
      });

      const comp = await selectComposition({
        serveUrl: loc,
        id: 'RemotionVideo',
        inputProps: {},
        timeoutInMilliseconds: 10000,
      });

      return { loc, comp };
    };

    try {
      const result = await compileAndValidate();
      bundleLocation = result.loc;
      composition = result.comp;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`[Renderer] Build failed for job ${jobId}. Attempting JSON auto-heal... Error:`, errorMsg);
      
      updateJob(jobId, { progress: 45, status: 'generating' });

      try {
        // Query AI to repair the JSON
        const repairedJson = await repairRemotionCode(timelineJson, errorMsg);
        timelineJson = repairedJson;
        
        // Write the repaired JSON
        await fs.writeFile(configPath, repairedJson, 'utf-8');
        
        // Try compiling and selecting again
        updateJob(jobId, { status: 'rendering', progress: 50 });
        const result = await compileAndValidate();
        bundleLocation = result.loc;
        composition = result.comp;
        console.log(`[Renderer] Auto-heal succeeded for job ${jobId}!`);
      } catch (repairError) {
        console.error(`[Renderer] Auto-heal failed for job ${jobId}:`, repairError);
        throw new Error(`Rendering failed after auto-heal attempt. Original error: ${errorMsg}. Repair error: ${repairError instanceof Error ? repairError.message : String(repairError)}`);
      }
    }

    updateJob(jobId, { progress: 70 });

    // ── Step 5: Render to MP4 ──
    const outputPath = path.join(jobDir, 'output.mp4');

    await renderMedia({
      composition: {
        ...composition,
        width,
        height,
        fps: VIDEO_FPS,
        durationInFrames: durationFrames,
      },
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      chromiumOptions: {
        gl: 'angle',
      },
      timeoutInMilliseconds: 60000,
      onProgress: ({ progress }) => {
        // Map render progress from 70% to 95%
        const mappedProgress = Math.round(70 + progress * 25);
        updateJob(jobId, { progress: mappedProgress });
      },
    });

    // ── Step 6: Done ──
    updateJob(jobId, {
      status: 'completed',
      progress: 100,
      outputPath,
    });

    console.log(`[Renderer] Job ${jobId} completed: ${outputPath}`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown render error';
    console.error(`[Renderer] Job ${jobId} failed:`, errorMessage);

    updateJob(jobId, {
      status: 'error',
      error: errorMessage,
    });
  } finally {
    // Release render slot and process next in queue
    releaseRenderSlot();
    processNextInQueue();
  }
}

// ─── Queue Processing ────────────────────────────────────────────────────────

export function processNextInQueue(): void {
  const nextJobId = dequeueJob();
  if (!nextJobId) return;

  if (acquireRenderSlot()) {
    // Fire and forget
    processJob(nextJobId).catch((err) => {
      console.error(`[Queue] Error processing job ${nextJobId}:`, err);
      releaseRenderSlot();
    });
  } else {
    // Put it back if we can't acquire a slot (safety net)
    const { enqueueJob } = require('./job-store');
    enqueueJob(nextJobId);
  }
}

// ─── Cleanup helper ──────────────────────────────────────────────────────────

export async function cleanupJobFiles(jobId: string): Promise<void> {
  const jobDir = path.join(RENDER_BASE_DIR, jobId);
  try {
    await fs.rm(jobDir, { recursive: true, force: true });
    console.log(`[Cleanup] Removed files for job ${jobId}`);
  } catch {
    // Silent fail
  }
}
