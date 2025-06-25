import { BaseAnalyzer } from './base-analyzer';
import { ProfileAnalysis, BaseAnalysisResult } from '../../types/analysis';

export class ProfileAnalyzer extends BaseAnalyzer<ProfileAnalysis> {
    protected component = 'profile';
    protected prompt = `
    Analyze the resume and extract the following information:
    1. Career stage (entry, mid, senior, or executive)
    2. Overall experience level
    3. Leadership experience details

    Consider:
    - Years of experience
    - Role progression
    - Management responsibilities
    - Project leadership
    - Team size managed
    - Strategic impact
    
    Format the response as JSON with the following structure:
    {
      "careerStage": "entry|mid|senior|executive",
      "experienceLevel": "string description",
      "leadershipExperience": {
        "level": "string description",
        "details": ["array of specific examples"]
      }
    }
  `;

    protected parseResponse(text: string): Omit<ProfileAnalysis, keyof BaseAnalysisResult> {
        try {
            const parsed = JSON.parse(text) as Partial<ProfileAnalysis>;

            // Validate the required fields
            if (!parsed.careerStage || !parsed.experienceLevel || !parsed.leadershipExperience) {
                throw new Error('Missing required fields in profile analysis');
            }

            // Validate career stage
            if (!['entry', 'mid', 'senior', 'executive'].includes(parsed.careerStage)) {
                throw new Error('Invalid career stage value');
            }

            // Validate leadership experience structure
            if (!parsed.leadershipExperience.level || !Array.isArray(parsed.leadershipExperience.details)) {
                throw new Error('Invalid leadership experience structure');
            }

            return {
                careerStage: parsed.careerStage,
                experienceLevel: parsed.experienceLevel,
                leadershipExperience: {
                    level: parsed.leadershipExperience.level,
                    details: parsed.leadershipExperience.details
                }
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to parse profile analysis';
            throw new Error(`Invalid profile analysis format: ${errorMessage}`);
        }
    }
} 