// app/api/jobs/route.js
import { NextResponse } from 'next/server';
import getQueue from '@/lib/jobQueue';

// GET endpoint to check job status or queue stats
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');
    const queue = getQueue();

    if (jobId) {
      // Get specific job status
      const job = queue.getJob(jobId);

      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: job.id,
        type: job.type,
        status: job.status,
        attempts: job.attempts,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        error: job.error,
        result: job.result
      });
    }

    // Get queue stats
    const stats = queue.getStats();
    return NextResponse.json(stats);

  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve job information', details: error.message },
      { status: 500 }
    );
  }
}
