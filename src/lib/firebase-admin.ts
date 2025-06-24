import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
function getFirebaseAdmin() {
    if (getApps().length === 0) {
        const credentials = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (!credentials) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
        }

        try {
            const serviceAccount = JSON.parse(credentials);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
            });
        } catch (error) {
            console.error('Failed to initialize Firebase Admin:', error);
            throw error;
        }
    }
    return admin;
}

// Initialize Firebase Admin and export services
const firebase = getFirebaseAdmin();
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage(); 