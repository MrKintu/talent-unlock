import express from 'express';
import cors from 'cors';
import analyzeRouter from './analyze/router';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'healthy' });
});

// Analysis routes
app.use('/analyze', analyzeRouter);

// Start the server and log the port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Environment:', {
        VERTEX_AI_PROJECT_ID: process.env.VERTEX_AI_PROJECT_ID,
        GOOGLE_CLOUD_PROJECT_ID: process.env.VERTEX_AI_PROJECT_ID,
        PORT: process.env.PORT
    });
}); 