import fs from 'fs/promises';
import { getJob } from '@/lib/job-store';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  if (!jobId) {
    return Response.json({ error: 'Job ID is required' }, { status: 400 });
  }

  const job = getJob(jobId);

  if (!job) {
    return Response.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.status !== 'completed' || !job.outputPath) {
    return Response.json(
      { error: 'Video not ready yet', status: job.status },
      { status: 202 }
    );
  }

  try {
    // Check if file exists
    await fs.access(job.outputPath);

    // Read the file
    const fileBuffer = await fs.readFile(job.outputPath);
    const stat = await fs.stat(job.outputPath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(stat.size),
        'Content-Disposition': `attachment; filename="motionify-${jobId.slice(0, 8)}.mp4"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return Response.json(
      { error: 'Video file not found' },
      { status: 404 }
    );
  }
}
