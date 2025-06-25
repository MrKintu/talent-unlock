import express from 'express';
import { ProfileAnalyzer } from './helpers/profile-analyzer';
import { TechnicalSkillsAnalyzer } from './helpers/technical-skills-analyzer';
import { AnalysisRequest } from '../types/analysis';
import { auth, db } from './../lib/firebase-admin';
import { DocumentData } from 'firebase-admin/firestore';

const router = express.Router();
const profileAnalyzer = new ProfileAnalyzer();
const technicalSkillsAnalyzer = new TechnicalSkillsAnalyzer();

// Middleware to validate request body
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { resumeId } = { ...req.body, ...req.query };

    if (!resumeId) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: resumeId, userId, resumeText'
        });
    }

    next();
};


// Get analyses endpoint
router.get('/', async (req, res) => {
    try {
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Get all analyses for the user
        const analysesSnapshot = await db.collection('analysis')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const analyses = analysesSnapshot.docs.map((doc: DocumentData) => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.json({
            success: true,
            data: analyses
        });

    } catch (error) {
        console.error('Error fetching analyses:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Resume analysis endpoint
router.post('/', async (req, res) => {
    try {
        console.log('debug: req.body', req.body);
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Get request body
        const { resumeId } = req.body;
        if (!resumeId) {
            return res.status(400).json({ success: false, message: 'Resume ID is required' });
        }

        // Create analysis record
        const analysisRef = await db.collection('analysis').add({
            userId,
            resumeId,
            status: 'processing',
            createdAt: new Date(),
        });

        // Return immediately with the analysis ID
        res.json({
            success: true,
            data: {
                id: analysisRef.id,
                status: 'processing'
            }
        });
        console.log('debug: res', analysisRef?.id);
    } catch (error) {
        console.error('Error initiating analysis:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Profile analysis endpoint
router.post('/profile', validateRequest, async (req: express.Request, res: express.Response) => {
    const request: AnalysisRequest = {
        resumeId: req.body.resumeId,
        userId: req.body.userId,
        resumeText: req.body.resumeText
    };

    const result = await profileAnalyzer.analyze(request);
    res.json(result);
});

// Technical skills analysis endpoint
router.post('/technical-skills', validateRequest, async (req: express.Request, res: express.Response) => {
    const request: AnalysisRequest = {
        resumeId: req.body.resumeId,
        userId: req.body.userId,
        resumeText: req.body.resumeText
    };

    const result = await technicalSkillsAnalyzer.analyze(request);
    res.json(result);
});

// TODO: Add other analysis endpoints following the same pattern:
// router.post('/soft-skills', validateRequest, async (req, res) => { ... });
// etc.

export default router; 