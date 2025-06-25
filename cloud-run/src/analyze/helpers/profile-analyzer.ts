import { BaseAnalyzer } from './base-analyzer';
import { AnalysisRequest, ProfileAnalysis } from '../../types/analysis';

interface RawSkill {
    name?: string;
    level?: string;
    confidence?: number;
}

interface RawExperience {
    role?: string;
    company?: string;
    duration?: number;
    highlights?: string[];
}

interface RawEducation {
    degree?: string;
    institution?: string;
    year?: number;
}

interface RawRecommendation {
    type?: string;
    description?: string;
    priority?: string;
}

interface RawProfileAnalysis {
    skills?: RawSkill[];
    experience?: RawExperience[];
    education?: RawEducation[];
    recommendations?: RawRecommendation[];
}

export class ProfileAnalyzer extends BaseAnalyzer<ProfileAnalysis> {
    protected buildPrompt(resumeText: string): string {
        return `You are a resume analysis AI. Your task is to analyze the resume text and return ONLY a JSON object with no additional text, markdown formatting, or explanation.

Resume Text:
${resumeText}

Return a JSON object with exactly this structure:
{
  "skills": [
    {
      "name": "skill name (max 50 chars)",
      "level": "beginner/intermediate/advanced/expert",
      "confidence": 0.95
    }
  ],
  "experience": [
    {
      "role": "job title (max 100 chars)",
      "company": "company name (max 100 chars)",
      "duration": 24,
      "highlights": ["achievement (max 200 chars per item, max 5 items)"]
    }
  ],
  "education": [
    {
      "degree": "degree name (max 100 chars)",
      "institution": "institution name (max 100 chars)",
      "year": 2020
    }
  ],
  "recommendations": [
    {
      "type": "skill/certification/experience",
      "description": "detailed recommendation (max 200 chars)",
      "priority": "high/medium/low"
    }
  ]
}

IMPORTANT:
1. Return ONLY the JSON object. Do not include any markdown formatting, explanations, or additional text.
2. Strictly follow the character limits for each field.
3. For experience highlights, include at most 5 most important achievements.
4. Ensure all strings are properly escaped and terminated.`;
    }

    protected parseResponse(text: string): ProfileAnalysis {
        try {
            // Remove any markdown formatting if present
            const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();

            // Try to parse the JSON
            let parsed: RawProfileAnalysis;
            try {
                parsed = JSON.parse(cleanText);
            } catch (parseError) {
                // If parsing fails, try to clean up common issues
                const fixedText = cleanText
                    // Fix unterminated strings by adding missing quotes
                    .replace(/([^"])(")([^"]*$)/g, '$1$2$3"')
                    // Remove any trailing commas in arrays and objects
                    .replace(/,(\s*[}\]])/g, '$1')
                    // Ensure arrays and objects are properly closed
                    .replace(/([^}\]])\s*$/g, '$1}')
                    .trim();
                parsed = JSON.parse(fixedText);
            }

            // Validate and sanitize the data
            return {
                skills: Array.isArray(parsed.skills) ? parsed.skills.map(skill => ({
                    name: String(skill.name || '').slice(0, 50),
                    level: (['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level as string)
                        ? skill.level
                        : 'intermediate') as 'beginner' | 'intermediate' | 'advanced' | 'expert',
                    confidence: Number(skill.confidence) || 0.5
                })) : [],
                experience: Array.isArray(parsed.experience) ? parsed.experience.map(exp => ({
                    role: String(exp.role || '').slice(0, 100),
                    company: String(exp.company || '').slice(0, 100),
                    duration: Number(exp.duration) || 0,
                    highlights: Array.isArray(exp.highlights)
                        ? exp.highlights.slice(0, 5).map(h => String(h).slice(0, 200))
                        : []
                })) : [],
                education: Array.isArray(parsed.education) ? parsed.education.map(edu => ({
                    degree: String(edu.degree || '').slice(0, 100),
                    institution: String(edu.institution || '').slice(0, 100),
                    year: typeof edu.year === 'number' && Number.isInteger(edu.year) ? edu.year : null
                })) : [],
                recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map(rec => ({
                    type: (['skill', 'certification', 'experience'].includes(rec.type as string)
                        ? rec.type
                        : 'skill') as 'skill' | 'certification' | 'experience',
                    description: String(rec.description || '').slice(0, 200),
                    priority: (['high', 'medium', 'low'].includes(rec.priority as string)
                        ? rec.priority
                        : 'medium') as 'high' | 'medium' | 'low'
                })) : []
            };
        } catch (error) {
            console.error('Error parsing profile analysis:', error);
            // Return a valid but empty analysis object rather than throwing
            return {
                skills: [],
                experience: [],
                education: [],
                recommendations: []
            };
        }
    }
} 