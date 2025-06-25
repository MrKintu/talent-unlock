import { Analysis } from '@/lib/types';

export interface AnalysisResponse {
    success: boolean;
    data: Analysis;
    message?: string;
    error?: string;
}

export interface AnalysisResult {
    skills: Array<{
        name: string;
        level: string;
        confidence: number;
    }>;
    experience: Array<{
        role: string;
        company: string;
        duration: number;
        highlights: string[];
    }>;
    education: Array<{
        degree: string;
        institution: string;
        year: number;
        country?: string;
        accreditation?: 'recognized' | 'unrecognized' | 'pending_verification';
        credibilityScore?: number;
        recognitionStatus?: 'fully_recognized' | 'partially_recognized' | 'requires_assessment' | 'not_recognized';
        gapAnalysis?: {
            missingRequirements: string[];
            additionalSteps: string[];
            estimatedTimeToEquivalency: number;
            licensingExamsRequired: string[];
        };
        equivalency?: {
            localEquivalent: string;
            coveragePercentage: number;
            recognizingBodies: string[];
        };
    }>;
    recommendations: Array<{
        type: 'skill' | 'certification' | 'experience' | 'education_upgrade';
        description: string;
        priority: 'high' | 'medium' | 'low';
        category?: 'immediate' | 'short_term' | 'long_term';
        actionable?: boolean;
        timeframe?: '1-3 months' | '3-6 months' | '6-12 months' | '1+ years';
    }>;
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

    async retryAnalysis(token: string, resumeId: string, analysisId: string): Promise<AnalysisResponse> {
        const response = await fetch(`/api/analyze`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ resumeId, analysisId, retry: true })
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

    async updateAnalysisResults(token: string, analysisId: string, results: AnalysisResult): Promise<AnalysisResponse> {
        const response = await fetch(`/api/analyze/${analysisId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ results })
        });

        return response.json();
    }

    async deleteAnalysis(token: string, analysisId: string): Promise<{ success: boolean; message?: string }> {
        const response = await fetch(`/api/analyze/${analysisId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.json();
    }
}

export const analysisService = new AnalysisService(); 