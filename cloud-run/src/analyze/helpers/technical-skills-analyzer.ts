import { BaseAnalyzer } from './base-analyzer';
import { AnalysisRequest, TechnicalSkillsAnalysis } from '../../types/analysis';

export class TechnicalSkillsAnalyzer extends BaseAnalyzer<TechnicalSkillsAnalysis> {
    protected buildPrompt(resumeText: string): string {
        return `You are a technical skills analysis AI. Your task is to analyze the resume text and return ONLY a JSON object with no additional text, markdown formatting, or explanation.

Resume Text:
${resumeText}

Return a JSON object with exactly this structure:
{
  "technicalSkills": [
    {
      "name": "skill name",
      "category": "programming/framework/tool/database/cloud/etc",
      "level": "beginner/intermediate/advanced/expert",
      "yearsOfExperience": 2,
      "lastUsed": 2024,
      "context": ["brief examples of how this skill was used"]
    }
  ],
  "technicalProjects": [
    {
      "name": "project name",
      "description": "brief description",
      "technologies": ["tech1", "tech2"],
      "role": "role in project",
      "impact": ["measurable outcomes"]
    }
  ],
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing organization",
      "year": 2024,
      "relevance": "high/medium/low"
    }
  ],
  "recommendations": [
    {
      "skillGap": "identified skill gap",
      "suggestion": "specific suggestion to address the gap",
      "priority": "high/medium/low",
      "rationale": "why this is important"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object. Do not include any markdown formatting, explanations, or additional text.`;
    }

    protected parseResponse(text: string): TechnicalSkillsAnalysis {
        // Remove any markdown formatting if present
        const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();
        const parsed = JSON.parse(cleanText);

        // Validate the required fields
        if (!parsed.technicalSkills || !Array.isArray(parsed.technicalSkills)) {
            throw new Error('Missing or invalid technical skills array');
        }
        if (!parsed.technicalProjects || !Array.isArray(parsed.technicalProjects)) {
            throw new Error('Missing or invalid technical projects array');
        }
        if (!parsed.certifications || !Array.isArray(parsed.certifications)) {
            throw new Error('Missing or invalid certifications array');
        }
        if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
            throw new Error('Missing or invalid recommendations array');
        }

        return parsed;
    }
} 