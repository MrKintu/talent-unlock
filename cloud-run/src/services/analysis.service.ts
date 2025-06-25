import { db } from '../lib/firebase-admin';
import { ProfileAnalyzer } from '../analyze/helpers/profile-analyzer';
import { TechnicalSkillsAnalyzer } from '../analyze/helpers/technical-skills-analyzer';
import { AhaMomentsAnalyzer } from '../analyze/helpers/aha-moments-analyzer';

interface CreateAnalysisRequest {
    userId: string;
    resumeId: string;
}

export interface AnalysisResponse {
    id: string;
    userId: string;
    resumeId: string;
    status: 'processing' | 'completed' | 'failed';
    results?: any;
    error?: string;
    createdAt: Date;
    completedAt?: Date;
}

export class AnalysisService {
    private static profileAnalyzer = new ProfileAnalyzer();
    private static technicalSkillsAnalyzer = new TechnicalSkillsAnalyzer();
    private static ahaAnalyzer = new AhaMomentsAnalyzer();

    static async create(request: CreateAnalysisRequest) {
        const { userId, resumeId } = request;

        console.log('Creating analysis', {
            userId,
            resumeId
        });
        // Get User data
        const userDoc = await db.collection('userProfile').doc(userId).get();
        if (!userDoc.exists) {
            throw new Error('User not found');
        }
        const userData = userDoc.data();

        // Get resume data
        const resumeDoc = await db.collection('resumes').doc(resumeId).get();
        if (!resumeDoc.exists) {
            throw new Error('Resume not found');
        }

        const resumeData = resumeDoc.data();
        const resumeText = resumeData?.extractedText;
        if (!resumeText) {
            throw new Error('Resume text is empty');
        }

        // Create analysis record
        const analysisRef = await db.collection('analysis').add({
            userId,
            resumeId,
            status: 'processing',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Run analyses sequentially with delay to avoid rate limiting
        try {
            // Run profile analysis first
            const profileResults = await this.profileAnalyzer.analyze({ userId, resumeId, resumeText });

            // Wait 2 seconds before running technical skills analysis
            await new Promise(resolve => setTimeout(resolve, 5000));

            const technicalResults = await this.technicalSkillsAnalyzer.analyze({ userId, resumeId, resumeText });

            await new Promise(resolve => setTimeout(resolve, 5000));

            const ahaResults = await this.ahaAnalyzer.analyze({ userId, resumeId, resumeText, userData });
            // Update analysis record with results
            await analysisRef.update({
                status: 'completed',
                profileResults,
                technicalResults,
                ahaResults,
                completedAt: new Date(),
                updatedAt: new Date()
            });

            return {
                id: analysisRef.id,
                status: 'completed',
                profileResults,
                technicalResults,
                ahaResults
            };
        } catch (error) {
            console.error('Error in analysis:', error);

            // Update analysis record with error
            await analysisRef.update({
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                completedAt: new Date(),
                updatedAt: new Date()
            });

            throw error;
        }
    }

    static async getById(id: string) {
        const doc = await db.collection('analysis').doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return {
            id: doc.id,
            ...doc.data()
        };
    }

    static async listByUser(userId: string) {
        const snapshot = await db.collection('analysis')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    static async verifyOwnership(analysisId: string, userId: string): Promise<boolean> {
        const doc = await db.collection('analysis').doc(analysisId).get();
        if (!doc.exists) {
            return false;
        }
        return doc.data()?.userId === userId;
    }
} 