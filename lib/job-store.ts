import fs from 'fs/promises';
import path from 'path';
import {
  MAX_CONCURRENT_RENDERS,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  CLEANUP_AFTER_MS,
  CLEANUP_INTERVAL_MS,
  RENDER_BASE_DIR,
  type DurationPreset,
  type ResolutionPreset,
  type StylePreset,
} from './config';

// ─── Types ───────────────────────────────────────────────────────────────────

export type JobStatus =
  | 'queued'
  | 'generating'
  | 'rendering'
  | 'completed'
  | 'error';

export interface JobOptions {
  duration: DurationPreset;
  resolution: ResolutionPreset;
  style: StylePreset;
  templateDesign?: string;
}

export interface Job {
  id: string;
  status: JobStatus;
  prompt: string;
  progress: number;
  createdAt: number;
  outputPath?: string;
  error?: string;
  options: JobOptions;
  config?: any;
}

// ─── In-Memory Store ─────────────────────────────────────────────────────────

const jobs = new Map<string, Job>();
const rateLimitMap = new Map<string, number[]>();
let activeRenders = 0;
const renderQueue: string[] = [];

// ─── Job CRUD ────────────────────────────────────────────────────────────────

export function createJob(
  id: string,
  prompt: string,
  options: JobOptions
): Job {
  const job: Job = {
    id,
    status: 'queued',
    prompt,
    progress: 0,
    createdAt: Date.now(),
    options,
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function updateJob(id: string, updates: Partial<Job>): Job | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;
  Object.assign(job, updates);
  return job;
}

export function deleteJob(id: string): void {
  jobs.delete(id);
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Get existing timestamps and filter to current window
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => t > windowStart
  );
  rateLimitMap.set(ip, timestamps);

  const remaining = Math.max(0, RATE_LIMIT_MAX - timestamps.length);
  const resetAt =
    timestamps.length > 0
      ? timestamps[0] + RATE_LIMIT_WINDOW_MS
      : now + RATE_LIMIT_WINDOW_MS;

  if (timestamps.length >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt };
  }

  // Record this request
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  return { allowed: true, remaining: remaining - 1, resetAt };
}

// ─── Render Queue ────────────────────────────────────────────────────────────

export function canStartRender(): boolean {
  return activeRenders < MAX_CONCURRENT_RENDERS;
}

export function acquireRenderSlot(): boolean {
  if (activeRenders >= MAX_CONCURRENT_RENDERS) return false;
  activeRenders++;
  return true;
}

export function releaseRenderSlot(): void {
  activeRenders = Math.max(0, activeRenders - 1);
}

export function enqueueJob(jobId: string): void {
  renderQueue.push(jobId);
}

export function dequeueJob(): string | undefined {
  return renderQueue.shift();
}

export function getQueueLength(): number {
  return renderQueue.length;
}

export function getActiveRenders(): number {
  return activeRenders;
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

async function cleanupExpiredJobs(): Promise<void> {
  const now = Date.now();
  const expiredIds: string[] = [];

  for (const [id, job] of jobs) {
    if (now - job.createdAt > CLEANUP_AFTER_MS) {
      expiredIds.push(id);
    }
  }

  for (const id of expiredIds) {
    // Remove temp files
    const jobDir = path.join(RENDER_BASE_DIR, id);
    try {
      await fs.rm(jobDir, { recursive: true, force: true });
    } catch {
      // Directory may already be gone
    }
    jobs.delete(id);
  }

  if (expiredIds.length > 0) {
    console.log(`[Cleanup] Removed ${expiredIds.length} expired job(s)`);
  }
}

// Start cleanup interval
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

export function startCleanupScheduler(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(cleanupExpiredJobs, CLEANUP_INTERVAL_MS);
  // Don't let this timer keep the process alive
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

// Auto-start cleanup on module load
startCleanupScheduler();

// ─── Utility ─────────────────────────────────────────────────────────────────

export function getJobStats(): {
  total: number;
  active: number;
  queued: number;
} {
  let active = 0;
  let queued = 0;
  for (const job of jobs.values()) {
    if (job.status === 'generating' || job.status === 'rendering') active++;
    if (job.status === 'queued') queued++;
  }
  return { total: jobs.size, active, queued };
}
