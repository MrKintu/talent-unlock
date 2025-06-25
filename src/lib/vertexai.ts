import { VertexAI } from '@google-cloud/vertexai';
import { VERTEX_AI } from './constants';

// Initialize Vertex AI
const vertexai = new VertexAI({
    project: process.env.VERTEX_AI_PROJECT_ID,
    location: VERTEX_AI.LOCATION,
});

// Get the model
const model = vertexai.preview.getGenerativeModel({
    model: VERTEX_AI.MODEL,
    generationConfig: {
        maxOutputTokens: 2048,
        temperature: VERTEX_AI.TEMPERATURE,
        topP: 0.8,
        topK: 40,
    },
});

export { vertexai, model };