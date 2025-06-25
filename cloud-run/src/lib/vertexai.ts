import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI
const vertexai = new VertexAI({
    project: 'hackthebrain-2025',
    location: 'northamerica-northeast1',
});

// Get the model
const model = vertexai.preview.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
    },
});

export { vertexai, model };