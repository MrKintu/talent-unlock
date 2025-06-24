import { Analysis } from '@/lib/types';

export interface AnalysisResponse {
    success: boolean;
    data: Analysis;
    message?: string;
}

class AnalysisService {
    async getAnalysis(token: string, analysisId: string): Promise<AnalysisResponse> {
        const response = await fetch(`/api/analyze/${analysisId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.json();
    }

    async startAnalysis(token: string, resumeId: string): Promise<AnalysisResponse> {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ resumeId })
        });

        return response.json();
    }

    async getAnalysisList(token: string): Promise<{ success: boolean; data: Analysis[]; message?: string }> {
        const response = await fetch('/api/analyze', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.json();
    }
}

export const analysisService = new AnalysisService(); 