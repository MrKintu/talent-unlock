import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/vertexai';
import { ApiResponse, AnalysisResult, Skill } from '@/lib/types';
import { ANALYSIS } from '@/lib/constants';
import { auth } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase-admin';
import { vertexai } from '@/lib/vertexai';

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

    // Create analysis record
    const analysisRef = await db.collection('analysis').add({
      userId,
      resumeId,
      fileUrl: resumeData?.fileUrl,
      status: 'pending',
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: analysisRef.id,
        status: 'pending'
      }
    });

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
