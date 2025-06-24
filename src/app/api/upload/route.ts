import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ApiResponse, ResumeUpload } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin
initAdmin();

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
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

        if (!file) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'No file provided'
            }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Invalid file type. Please upload a PDF or Word document.'
            }, { status: 400 });
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'File size too large. Please upload a file smaller than 10MB.'
            }, { status: 400 });
        }

        // Generate unique filename with user ID
        const timestamp = Date.now();
        const fileName = `resumes/${userId}/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);

        // Upload file to Firebase Storage
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        // Create upload record in Firestore
        const db = getFirestore();
        const uploadData: ResumeUpload = {
            id: `${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            downloadUrl,
            uploadDate: new Date(),
            status: 'completed',
            progress: 100
        };

        await db.collection('resumes').doc(uploadData.id).set(uploadData);

        return NextResponse.json<ApiResponse<ResumeUpload>>({
            success: true,
            data: uploadData,
            message: 'File uploaded successfully'
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to upload file'
        }, { status: 500 });
    }
}
