import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        databaseURL: `https://${process.env.GOOGLE_CLOUD_PROJECT_ID}.firebaseio.com`,
    });
}

const auth = admin.auth();
const db = admin.firestore();

export { auth, db }; 