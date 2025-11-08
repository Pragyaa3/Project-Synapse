// Simple in-memory job queue for async content processing
// For production, consider using Redis + BullMQ or Supabase Edge Functions

class JobQueue {
  constructor() {
    this.jobs = new Map(); // jobId -> job data
    this.processing = new Set(); // jobIds currently being processed
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
    this.concurrency = 5; // Process 5 jobs concurrently
    this.currentProcessing = 0;
  }

  // Add a job to the queue
  async addJob(type, data) {
    const jobId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const job = {
      id: jobId,
      type,
      data,
      status: 'pending',
      attempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      error: null,
      result: null
    };

    this.jobs.set(jobId, job);

    // Start processing if below concurrency limit
    this.processNext();

    return jobId;
  }

  // Get job status
  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  // Process next job in queue
  async processNext() {
    if (this.currentProcessing >= this.concurrency) {
      return; // Already at max concurrency
    }

    // Find next pending job
    const pendingJob = Array.from(this.jobs.values())
      .find(job => job.status === 'pending' && !this.processing.has(job.id));

    if (!pendingJob) {
      return; // No pending jobs
    }

    this.currentProcessing++;
    this.processing.add(pendingJob.id);

    try {
      await this.processJob(pendingJob);
    } catch (error) {
      console.error(`Job ${pendingJob.id} failed:`, error);
    } finally {
      this.processing.delete(pendingJob.id);
      this.currentProcessing--;

      // Process next job
      this.processNext();
    }
  }

  // Process a single job
  async processJob(job) {
    job.attempts++;
    job.status = 'processing';
    job.updatedAt = new Date().toISOString();

    try {
      let result;

      switch (job.type) {
        case 'classify':
          result = await this.handleClassifyJob(job.data);
          break;
        case 'image_upload':
          result = await this.handleImageUploadJob(job.data);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      job.status = 'completed';
      job.result = result;
      job.updatedAt = new Date().toISOString();

      return result;

    } catch (error) {
      job.error = error.message;

      if (job.attempts < this.maxRetries) {
        // Retry with exponential backoff
        job.status = 'pending';
        const delay = this.retryDelay * Math.pow(2, job.attempts - 1);

        console.log(`Job ${job.id} failed (attempt ${job.attempts}/${this.maxRetries}). Retrying in ${delay}ms...`);

        setTimeout(() => {
          this.processNext();
        }, delay);

      } else {
        // Max retries reached
        job.status = 'failed';
        job.updatedAt = new Date().toISOString();
        console.error(`Job ${job.id} failed permanently after ${this.maxRetries} attempts:`, error);
      }

      throw error;
    }
  }

  // Handle classification job
  async handleClassifyJob(data) {
    const { classifyContent } = await import('./claude.js');
    const result = await classifyContent(data.content, data.url, data.imageData);
    return result;
  }

  // Handle image upload job
  async handleImageUploadJob(data) {
    const { uploadImage } = await import('./supabase.js');
    const url = await uploadImage(data.imageData, data.itemId);
    return { imageUrl: url };
  }

  // Clean up old completed/failed jobs (call periodically)
  cleanup(olderThanMs = 3600000) { // Default: 1 hour
    const cutoff = Date.now() - olderThanMs;

    for (const [jobId, job] of this.jobs.entries()) {
      const jobTime = new Date(job.updatedAt).getTime();

      if (jobTime < cutoff && (job.status === 'completed' || job.status === 'failed')) {
        this.jobs.delete(jobId);
      }
    }
  }

  // Get queue stats
  getStats() {
    const jobs = Array.from(this.jobs.values());

    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      currentProcessing: this.currentProcessing,
      maxConcurrency: this.concurrency
    };
  }
}

// Singleton instance
let queueInstance = null;

export function getQueue() {
  if (!queueInstance) {
    queueInstance = new JobQueue();

    // Cleanup old jobs every 10 minutes
    setInterval(() => {
      queueInstance.cleanup();
    }, 600000);
  }

  return queueInstance;
}

export default getQueue;
