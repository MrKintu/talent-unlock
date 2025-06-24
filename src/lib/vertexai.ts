import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI
const vertexai = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT_ID!,
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

// Get the model
const model = vertexai.preview.getGenerativeModel({
    model: 'gemini-pro',
    generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
    },
});

export { vertexai, model };