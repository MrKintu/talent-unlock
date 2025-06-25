import { model } from '../../lib/vertexai';
import { AnalysisRequest, AnalysisResponse, BaseAnalysisResult } from '../../types/analysis';

export abstract class BaseAnalyzer<T extends BaseAnalysisResult> {
    protected abstract component: string;
    protected abstract prompt: string;

    public async analyze(request: AnalysisRequest): Promise<AnalysisResponse> {
        try {
            const prompt = this.buildPrompt(request.resumeText);
            const result = await model.generateContent(prompt);
            const response = await result.response;

            if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('No analysis generated');
            }

            const text = response.candidates[0].content.parts[0].text;
            const analysisResult = this.parseResponse(text);
            return {
                success: true,
                data: {
                    ...analysisResult,
                    component: this.component,
                    timestamp: new Date()
                }
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error(`Error in ${this.component} analysis:`, errorMessage);
            return {
                success: false,
                error: `Failed to analyze ${this.component}: ${errorMessage}`
            };
        }
    }

    protected buildPrompt(resumeText: string): string {
        return `
      ${this.prompt}
      
      Resume Text:
      ${resumeText}
      
      Please provide the analysis in a structured JSON format matching the expected type.
      Focus only on ${this.component} analysis.
      Be specific and provide evidence from the resume where possible.
    `;
    }

    protected abstract parseResponse(text: string): Omit<T, keyof BaseAnalysisResult>;
} 