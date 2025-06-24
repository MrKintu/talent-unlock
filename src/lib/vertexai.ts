import { VertexAI } from '@google-cloud/vertexai';
import { VERTEX_AI } from './constants';

const vertex_ai = new VertexAI({
    project: process.env.VERTEX_AI_PROJECT_ID!,
    location: process.env.VERTEX_AI_LOCATION!,
});

export const model = vertex_ai.preview.getGenerativeModel({
    model: VERTEX_AI.MODEL,
});

export default vertex_ai;