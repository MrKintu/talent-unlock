import { Job } from '@/lib/types';

export interface JobSearchResponse {
    success: boolean;
    data: Job[];
    message?: string;
    error?: string;
}

class JobService {
    async searchJobs(token: string, analysisId: string, skills: string[]): Promise<JobSearchResponse> {
        const response = await fetch(`/api/jobs?analysisId=${analysisId}&skills=${skills.join(',')}`);
        return response.json();
    }
}

export const jobService = new JobService(); 