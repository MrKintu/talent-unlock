import { BaseAnalyzer } from './base-analyzer';
import { TechnicalSkillsAnalysis, BaseAnalysisResult } from '../../types/analysis';

export class TechnicalSkillsAnalyzer extends BaseAnalyzer<TechnicalSkillsAnalysis> {
    protected component = 'technical-skills';
    protected prompt = `
    Analyze the resume and extract technical skills information:
    - Programming languages
    - Frameworks and libraries
    - Tools and technologies
    - Development methodologies
    - Infrastructure and cloud platforms

    For each skill identified:
    - Determine the proficiency level (beginner, intermediate, advanced, expert)
    - Calculate a confidence score (0-1) based on evidence in the resume
    - Consider factors like years of experience, project complexity, and recency

    Format the response as JSON with the following structure:
    {
      "skills": [
        {
          "name": "skill name",
          "level": "beginner|intermediate|advanced|expert",
          "confidence": 0.95
        }
      ]
    }
  `;

    protected parseResponse(text: string): Omit<TechnicalSkillsAnalysis, keyof BaseAnalysisResult> {
        try {
            const parsed = JSON.parse(text) as Partial<TechnicalSkillsAnalysis>;

            if (!Array.isArray(parsed.skills)) {
                throw new Error('Skills must be an array');
            }

            // Validate each skill entry
            parsed.skills.forEach((skill, index) => {
                if (!skill.name || typeof skill.name !== 'string') {
                    throw new Error(`Invalid skill name at index ${index}`);
                }

                if (!['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level)) {
                    throw new Error(`Invalid skill level at index ${index}`);
                }

                if (typeof skill.confidence !== 'number' || skill.confidence < 0 || skill.confidence > 1) {
                    throw new Error(`Invalid confidence score at index ${index}`);
                }
            });

            return {
                skills: parsed.skills
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to parse technical skills analysis';
            throw new Error(`Invalid technical skills analysis format: ${errorMessage}`);
        }
    }
} 