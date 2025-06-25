import { NextResponse } from 'next/server';
import { model } from '@/lib/vertexai';
import { auth, db } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get request body
    const { resumeId } = await request.json();
    if (!resumeId) {
      return NextResponse.json({ success: false, message: 'Resume ID is required' }, { status: 400 });
    }

    // Get resume data
    const resumeDoc = await db.collection('resumes').doc(resumeId).get();
    if (!resumeDoc.exists) {
      return NextResponse.json({ success: false, message: 'Resume not found' }, { status: 404 });
    }

    const resumeData = resumeDoc.data();
    const resumeText = resumeData?.text || '';
    console.log(`debug: resumeText`, { resumeText, resumeId, userId, resumeDoc });

    // Create analysis record
    const analysisRef = await db.collection('analysis').add({
      userId,
      resumeId,
      status: 'processing',
      createdAt: new Date(),
    });

    // Start the analysis process
    try {
      // Prepare the prompt for Vertex AI
      const prompt = `You are a resume analysis AI. Your task is to analyze the resume text and return ONLY a JSON object with no additional text or explanation.

Resume Text:
${resumeText}

Return a JSON object with exactly this structure:
{
  "skills": [
    {
      "name": "skill name",
      "level": "beginner/intermediate/advanced/expert",
      "confidence": 0.95
    }
  ],
  "experience": [
    {
      "role": "job title",
      "company": "company name",
      "duration": 24,
      "highlights": ["achievement 1", "achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "institution name",
      "year": 2020
    }
  ],
  "recommendations": [
    {
      "type": "skill/certification/experience",
      "description": "detailed recommendation",
      "priority": "high/medium/low"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from AI model');
      }

      let analysisResults;
      try {
        console.log(`debug: response analysis`, JSON.stringify(response.candidates[0].content, null, 2));
        const responseText = response.candidates[0].content.parts[0].text.trim();
        analysisResults = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse AI response:', response.candidates[0].content.parts[0].text);
        throw new Error('Failed to parse AI response');
      }

      // Validate the response structure
      if (!analysisResults.skills || !Array.isArray(analysisResults.skills) ||
        !analysisResults.experience || !Array.isArray(analysisResults.experience) ||
        !analysisResults.education || !Array.isArray(analysisResults.education) ||
        !analysisResults.recommendations || !Array.isArray(analysisResults.recommendations)) {
        throw new Error('Invalid analysis results structure');
      }

      // Update the analysis with results
      await analysisRef.update({
        status: 'completed',
        results: analysisResults,
        completedAt: new Date()
      });

      return NextResponse.json({
        success: true,
        data: {
          id: analysisRef.id,
          status: 'completed',
          results: analysisResults
        }
      });

    } catch (analysisError) {
      console.error('Error in AI analysis:', analysisError);

      // Update analysis status to failed
      await analysisRef.update({
        status: 'failed',
        error: 'Failed to analyze resume'
      });

      return NextResponse.json({
        success: false,
        message: 'Failed to analyze resume'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in analysis:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get all analyses for the user
    const analysesSnapshot = await db.collection('analysis')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const analyses = analysesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      data: analyses
    });

  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
