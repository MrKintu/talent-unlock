import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, ResumeUpload } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebase-admin';
import { storage } from '@/lib/firebase';
import { ref, deleteObject } from 'firebase/storage';

// Initialize Firebase Admin
initAdmin();

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);
        const userId = decodedToken.uid;

        const db = getFirestore();
        const resumesSnapshot = await db.collection('resumes')
            .where('userId', '==', userId)
            .orderBy('uploadDate', 'desc')
            .get();

        const resumes = resumesSnapshot.docs.map(doc => doc.data() as ResumeUpload);

        return NextResponse.json<ApiResponse<ResumeUpload[]>>({
            success: true,
            data: resumes
        });

    } catch (error) {
        console.error('Resume fetch error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to fetch resumes'
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);
        const userId = decodedToken.uid;

        const { resumeId } = await request.json();
        if (!resumeId) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Resume ID is required'
            }, { status: 400 });
        }

        const db = getFirestore();
        const resumeDoc = await db.collection('resumes').doc(resumeId).get();

        if (!resumeDoc.exists) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Resume not found'
            }, { status: 404 });
        }

        const resumeData = resumeDoc.data() as ResumeUpload;
        if (resumeData.userId !== userId) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Unauthorized'
            }, { status: 403 });
        }

        // Delete file from storage
        const storageRef = ref(storage, `resumes/${userId}/${resumeData.fileName}`);
        await deleteObject(storageRef);

        // Delete document from Firestore
        await db.collection('resumes').doc(resumeId).delete();

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            message: 'Resume deleted successfully'
        });

    } catch (error) {
        console.error('Resume delete error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to delete resume'
        }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);
        const userId = decodedToken.uid;

        const { resumeId } = await request.json();
        if (!resumeId) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Resume ID is required'
            }, { status: 400 });
        }

        const db = getFirestore();

        // First, unset all active resumes for this user
        const batch = db.batch();
        const activeResumes = await db.collection('resumes')
            .where('userId', '==', userId)
            .where('isActive', '==', true)
            .get();

        activeResumes.forEach(doc => {
            batch.update(doc.ref, { isActive: false });
        });

        // Then set the selected resume as active
        const resumeRef = db.collection('resumes').doc(resumeId);
        batch.update(resumeRef, { isActive: true });

        await batch.commit();

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            message: 'Resume set as active successfully'
        });

    } catch (error) {
        console.error('Resume update error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to update resume'
        }, { status: 500 });
    }
} 