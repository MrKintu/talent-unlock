import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, UserProfile } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin
initAdmin();

export async function POST(request: NextRequest) {
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

        const data = await request.json();
        const {
            countryOfOrigin,
            targetRole,
            yearsOfExperience,
            socialLinks,
            skills,
            goals,
            achievements
        } = data;

        // Validate required fields
        if (!countryOfOrigin || !targetRole || !yearsOfExperience) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 });
        }

        // Create or update user profile
        const db = getFirestore();
        const profileData: UserProfile = {
            userId,
            countryOfOrigin,
            targetRole,
            yearsOfExperience,
            updatedAt: new Date(),
            // Optional fields
            socialLinks: socialLinks || {},
            skills: Array.isArray(skills) ? skills : [],
            goals: Array.isArray(goals) ? goals : [],
            achievements: Array.isArray(achievements) ? achievements : []
        };

        await db.collection('userProfiles').doc(userId).set(profileData, { merge: true });

        return NextResponse.json<ApiResponse<UserProfile>>({
            success: true,
            data: profileData,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to update profile'
        }, { status: 500 });
    }
}

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
        const profileDoc = await db.collection('userProfiles').doc(userId).get();

        if (!profileDoc.exists) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Profile not found'
            }, { status: 404 });
        }

        const profileData = profileDoc.data() as UserProfile;

        return NextResponse.json<ApiResponse<UserProfile>>({
            success: true,
            data: profileData
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to fetch profile'
        }, { status: 500 });
    }
} 