import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, ResumeUpload } from '@/lib/types';
import { auth, storage, db } from '@/lib/firebase-admin';
import { FIREBASE, ERROR_MESSAGES } from '@/lib/constants';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const authHeader = request.headers.get('Authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: ERROR_MESSAGES.AUTH.DEFAULT
            }, { status: 401 });
        }

        let decodedToken;
        try {
            const token = authHeader.split('Bearer ')[1];
            decodedToken = await auth.verifyIdToken(token);
        } catch (error) {
            console.error('Token verification error:', error);
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: ERROR_MESSAGES.AUTH.DEFAULT
            }, { status: 401 });
        }

        const userId = decodedToken.uid;

        if (!file) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'No file provided'
            }, { status: 400 });
        }

        // Validate file type
        if (!FIREBASE.STORAGE.ALLOWED_FILE_TYPES.includes(file.type as typeof FIREBASE.STORAGE.ALLOWED_FILE_TYPES[number])) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Invalid file type. Please upload a PDF or Word document.'
            }, { status: 400 });
        }

        // Validate file size
        if (file.size > FIREBASE.STORAGE.MAX_FILE_SIZE) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'File size too large. Please upload a file smaller than 10MB.'
            }, { status: 400 });
        }

        // Generate unique filename with user ID
        const timestamp = Date.now();
        const fileName = `${FIREBASE.STORAGE.RESUME_PATH}/${userId}/${timestamp}_${file.name}`;

        // Convert File to Buffer for Admin SDK
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) {
            throw new Error('Storage bucket not configured');
        }

        // Upload file using Admin SDK
        const bucket = storage.bucket(bucketName);
        const fileRef = bucket.file(fileName);
        await fileRef.save(buffer, {
            metadata: {
                contentType: file.type
            }
        });

        // Get download URL
        const [downloadUrl] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-01-2500' // Long expiry for permanent access
        });

        // Create upload record in Firestore
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
        const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.STORAGE.DEFAULT;
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: errorMessage
        }, { status: 500 });
    }
}
