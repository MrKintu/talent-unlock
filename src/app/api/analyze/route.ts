import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/vertexai';
import { ApiResponse, AnalysisResult, Skill } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { resumeContent, resumeId, userId } = await request.json();

    if (!resumeContent) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Resume content is required'
      }, { status: 400 });
    }

    const startTime = Date.now();

    // AI prompt for skills extraction and mapping
    const prompt = `
    Analyze this resume and extract skills, then map them to Canadian equivalents. 
    Focus on technical skills, soft skills, languages, and certifications.
    
    Resume Content:
    ${resumeContent}
    
    Please provide a JSON response with the following structure:
    {
      "originalSkills": [
        {
          "name": "skill name",
          "confidence": 0.95,
          "category": "technical|soft|language|certification",
          "relevanceScore": 0.9
        }
      ],
      "mappedSkills": [
        {
          "name": "Canadian equivalent skill name",
          "confidence": 0.95,
          "category": "technical|soft|language|certification",
          "internationalName": "original skill name",
          "canadianEquivalent": "Canadian equivalent",
          "relevanceScore": 0.9
        }
      ],
      "missingSkills": [
        {
          "name": "skill that would be valuable",
          "confidence": 0.8,
          "category": "technical|soft|language|certification",
          "relevanceScore": 0.7
        }
      ],
      "recommendations": [
        "Specific recommendation for skill development",
        "Certification suggestion",
        "Learning path recommendation"
      ],
      "overallScore": 0.85
    }
    
    Focus on:
    1. Technical skills relevant to Canadian tech industry
    2. Soft skills valued in Canadian workplace culture
    3. Language proficiency (English/French)
    4. Professional certifications recognized in Canada
    5. Industry-specific terminology mapping
    `;

    // Call Vertex AI
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse AI response
    let analysisData;
    try {
      // Extract JSON from AI response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Failed to parse AI analysis'
      }, { status: 500 });
    }

    const processingTime = Date.now() - startTime;

    // Create analysis result
    const analysisResult: AnalysisResult = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resumeId,
      userId,
      originalSkills: analysisData.originalSkills || [],
      mappedSkills: analysisData.mappedSkills || [],
      canadianEquivalents: analysisData.mappedSkills || [],
      missingSkills: analysisData.missingSkills || [],
      recommendations: analysisData.recommendations || [],
      overallScore: analysisData.overallScore || 0,
      processingTime,
      createdAt: new Date(),
      status: 'completed'
    };

    return NextResponse.json<ApiResponse<AnalysisResult>>({
      success: true,
      data: analysisResult,
      message: 'Analysis completed successfully'
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Failed to analyze resume'
    }, { status: 500 });
  }
}
