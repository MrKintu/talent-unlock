import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { storage, db } from '@/lib/firebase-admin';
import { ResumeUpload } from '@/lib/types';

// Initialize Document AI client with explicit credentials
const client = new DocumentProcessorServiceClient({
    projectId: '757257062079',
    keyFilename: './documentai-key.json'  // Using the key file directly
});

const location = process.env.PROCESSOR_LOCATION;
const processorId = process.env.PROCESSOR_ID;
const projectId = process.env.PROCESSOR_PROJECT_ID;

const processorName = `projects/${projectId}/locations/${location}/processors/${processorId}`;

export class DocumentParserService {
    static async processDocument(resumeId: string): Promise<void> {
        try {
            const resumeDoc = await db.collection('resumes').doc(resumeId).get();
            if (!resumeDoc.exists) {
                throw new Error('Resume not found');
            }

            const resumeData = resumeDoc.data() as ResumeUpload;
            const timestamp = resumeData.id.split('_')[0];
            const filePath = `resumes/${resumeData.userId}/${timestamp}_${resumeData.fileName}`;

            const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
            const [fileContent] = await bucket.file(filePath).download();

            const request = {
                name: processorName,
                rawDocument: {
                    content: fileContent.toString('base64'),
                    mimeType: resumeData.fileType,
                }
            };

            const [result] = await client.processDocument(request);

            if (!result.document?.text) {
                throw new Error('Failed to extract text from document');
            }

            await db.collection('resumes').doc(resumeId).update({
                extractedText: result.document.text,
                processingStatus: 'completed',
                updatedAt: new Date()
            });

        } catch (error: unknown) {
            console.error('Error processing document:', error);
            await db.collection('resumes').doc(resumeId).update({
                processingStatus: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                updatedAt: new Date()
            });
            throw error;
        }
    }
} 