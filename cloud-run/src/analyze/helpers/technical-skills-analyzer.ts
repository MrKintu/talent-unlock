import { BaseAnalyzer } from './base-analyzer';
import { AnalysisRequest, TechnicalSkillsAnalysis } from '../../types/analysis';

export class TechnicalSkillsAnalyzer extends BaseAnalyzer<TechnicalSkillsAnalysis> {
  protected buildPrompt(resumeText: string): string {
    return `You are a technical skills analysis AI. Your task is to analyze the resume text and return ONLY a JSON object with no additional text, markdown formatting, or explanation.

Resume Text:
${resumeText}

IMPORTANT FORMATTING RULES:
1. Return ONLY complete, valid JSON - no partial entries
2. Limit to maximum 20 skills, 5 projects, 3 certifications, and 3 recommendations
3. Each skill entry must be complete - if you can't complete an entry, omit it
4. Keep context arrays to maximum 3 items per skill
5. Keep all text fields under 250 characters
6. Ensure all JSON strings are properly escaped and terminated
7. Do not use any markdown formatting

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

CRITICAL: Ensure the response is complete, valid JSON. Do not include any text outside the JSON object.`;
  }

  protected parseResponse(text: string): TechnicalSkillsAnalysis {
    // Remove any markdown formatting if present
    const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();
    let parsed: TechnicalSkillsAnalysis;

    try {
      parsed = JSON.parse(cleanText);
    } catch (parseError) {
      console.log('Initial parse failed, attempting cleanup...', parseError);

      // More aggressive cleanup for common JSON issues
      let fixedText = cleanText
        // Remove any non-JSON text after the last closing brace
        .replace(/}[^}]*$/, '}')
        // Fix unterminated strings by adding missing quotes
        .replace(/([{,]\s*"[^"]+"\s*:\s*"[^"]*$)/gm, '$1"')
        // Fix unterminated arrays by adding missing brackets
        .replace(/(\[[^\]]*$)/g, '$1]')
        // Remove trailing commas in arrays and objects
        .replace(/,(\s*[}\]])/g, '$1')
        // Fix missing commas between array elements
        .replace(/}(\s*{)/g, '},$1')
        // Ensure all objects are properly closed
        .replace(/([^}\]]\s*)$/gm, '$1}')
        .trim();

      // If we still have an unterminated array at the root level, close it
      const openBrackets = (fixedText.match(/\[/g) || []).length;
      const closeBrackets = (fixedText.match(/\]/g) || []).length;
      if (openBrackets > closeBrackets) {
        fixedText += ']'.repeat(openBrackets - closeBrackets);
      }

      // If we still have an unterminated object at the root level, close it
      const openBraces = (fixedText.match(/{/g) || []).length;
      const closeBraces = (fixedText.match(/}/g) || []).length;
      if (openBraces > closeBraces) {
        fixedText += '}'.repeat(openBraces - closeBraces);
      }

      try {
        parsed = JSON.parse(fixedText);
        console.log('Successfully parsed after cleanup');
      } catch (secondError) {
        console.error('Failed to parse even after cleanup:', secondError);
        // Return a valid but empty structure rather than throwing
        parsed = {
          technicalSkills: [],
          technicalProjects: [],
          certifications: [],
          recommendations: []
        };
      }
    }

    // Ensure all arrays exist and are valid
    parsed.technicalSkills = Array.isArray(parsed.technicalSkills) ? parsed.technicalSkills : [];
    parsed.technicalProjects = Array.isArray(parsed.technicalProjects) ? parsed.technicalProjects : [];
    parsed.certifications = Array.isArray(parsed.certifications) ? parsed.certifications : [];
    parsed.recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];

    // Validate and clean each technical skill
    parsed.technicalSkills = parsed.technicalSkills
      .filter(skill => skill && typeof skill === 'object')
      .map(skill => ({
        name: String(skill.name || ''),
        category: String(skill.category || 'other'),
        level: ['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level)
          ? skill.level
          : 'intermediate',
        yearsOfExperience: Number(skill.yearsOfExperience) || 0,
        lastUsed: Number(skill.lastUsed) || new Date().getFullYear(),
        context: Array.isArray(skill.context) ? skill.context.map(String) : []
      }));

    return parsed;
  }
} 