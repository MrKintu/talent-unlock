import { getApps, initializeApp, cert, ServiceAccount } from 'firebase-admin/app';

export const initAdmin = () => {
    if (getApps().length === 0) {
        let serviceAccount: ServiceAccount;
        const credentials = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (!credentials) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
        }

        try {
            try {
                serviceAccount = JSON.parse(credentials) as ServiceAccount;
            } catch (e) {
                throw e;
            }

            if (!serviceAccount.projectId) {
                throw new Error('Invalid service account: missing projectId');
            }

            if (!serviceAccount.privateKey) {
                throw new Error('Invalid service account: missing privateKey');
            }

            if (!serviceAccount.clientEmail) {
                throw new Error('Invalid service account: missing clientEmail');
            }

            initializeApp({
                credential: cert(serviceAccount)
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to initialize Firebase Admin: ${error.message}`);
            }
            throw error;
        }
    }
}; 