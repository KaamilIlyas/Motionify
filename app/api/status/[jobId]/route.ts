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

  const response: Record<string, unknown> = {
    jobId: job.id,
    status: job.status,
    progress: job.progress,
  };

  if (job.config) {
    response.config = job.config;
  }

  if (job.status === 'completed') {
    response.downloadUrl = `/api/download/${job.id}`;
  }

  if (job.status === 'error') {
    response.error = job.error;
  }

  return Response.json(response);
}
