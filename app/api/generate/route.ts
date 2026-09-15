import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
  createJob,
  updateJob,
  checkRateLimit,
  acquireRenderSlot,
  enqueueJob,
} from '@/lib/job-store';
import { processJob } from '@/lib/renderer';
import { generateRemotionCode } from '@/lib/gemini';
import {
  DURATION_PRESETS,
  RESOLUTION_PRESETS,
  STYLE_PRESETS,
  DEFAULT_OPTIONS,
  type DurationPreset,
  type ResolutionPreset,
  type StylePreset,
} from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, options } = body;

    // ── Input Validation ──
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return Response.json(
        { error: 'Prompt is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (prompt.length > 2000) {
      return Response.json(
        { error: 'Prompt must be under 2000 characters' },
        { status: 400 }
      );
    }

    // ── Validate options ──
    const duration: DurationPreset =
      options?.duration && options.duration in DURATION_PRESETS
        ? options.duration
        : DEFAULT_OPTIONS.duration;

    const resolution: ResolutionPreset =
      options?.resolution && options.resolution in RESOLUTION_PRESETS
        ? options.resolution
        : DEFAULT_OPTIONS.resolution;

    const style: StylePreset =
      options?.style && STYLE_PRESETS.includes(options.style)
        ? options.style
        : DEFAULT_OPTIONS.style;

    // ── Create job ──
    const jobId = uuidv4();
    const templateDesign = options?.templateDesign;
    const jobOptions = { duration, resolution, style, templateDesign };
    createJob(jobId, prompt.trim(), jobOptions);

    let parsedConfig: any = null;
    try {
      const timelineJson = await generateRemotionCode(prompt.trim(), jobOptions);
      parsedConfig = JSON.parse(timelineJson);
      if (templateDesign) {
        parsedConfig.templateDesign = templateDesign;
      }
      updateJob(jobId, { config: parsedConfig, progress: 30 });
    } catch (aiErr) {
      console.warn('[Generate] Instant pre-generation deferred to background queue:', aiErr);
    }

    // ── Start rendering or queue ──
    if (acquireRenderSlot()) {
      // Fire and forget — don't await
      processJob(jobId).catch((err) => {
        console.error(`[Generate] Error starting job ${jobId}:`, err);
      });
    } else {
      enqueueJob(jobId);
    }

    return Response.json(
      {
        jobId,
        config: parsedConfig,
        message: 'Generation started',
      },
      {
        status: 202,
      }
    );
  } catch (error) {
    console.error('[Generate] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  return '127.0.0.1';
}
