export interface AnalysisRequest {
    resumeId: string;
    userId: string;
    resumeText: string;
}

export interface AnalysisResponse {
    success: boolean;
    data?: any;
    error?: string;
}

export interface BaseAnalysisResult {
    component: string;
    timestamp: Date;
}

export interface ProfileAnalysis extends BaseAnalysisResult {
    careerStage: 'entry' | 'mid' | 'senior' | 'executive';
    experienceLevel: string;
    leadershipExperience: {
        level: string;
        details: string[];
    };
}

export interface TechnicalSkillsAnalysis extends BaseAnalysisResult {
    skills: {
        name: string;
        level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        confidence: number;
    }[];
}

export interface SoftSkillsAnalysis extends BaseAnalysisResult {
    skills: {
        category: string;
        skills: string[];
        evidence: string[];
    }[];
}

export interface ExperienceAnalysis extends BaseAnalysisResult {
    positions: {
        role: string;
        company: string;
        duration: number;
        highlights: string[];
        impact: string[];
    }[];
}

export interface EducationAnalysis extends BaseAnalysisResult {
    degrees: {
        degree: string;
        institution: string;
        year: number;
        field: string;
    }[];
    certifications: {
        name: string;
        issuer: string;
        year: number;
    }[];
}

export interface DomainExpertiseAnalysis extends BaseAnalysisResult {
    industries: {
        name: string;
        level: string;
        years: number;
    }[];
    specializations: string[];
    toolsAndPlatforms: string[];
}

export interface MatchingAttributesAnalysis extends BaseAnalysisResult {
    preferences: {
        workStyle: string[];
        companySize: string[];
        industry: string[];
        location: string[];
        roleType: string[];
    };
}

export interface RecommendationsAnalysis extends BaseAnalysisResult {
    recommendations: {
        type: 'skill' | 'certification' | 'experience';
        description: string;
        priority: 'high' | 'medium' | 'low';
        rationale: string;
    }[];
}

export interface CareerTrajectoryAnalysis extends BaseAnalysisResult {
    currentLevel: string;
    potentialPaths: {
        role: string;
        timeframe: string;
        requiredSkills: string[];
        suggestedSteps: string[];
    }[];
}

export interface CompatibilityScoresAnalysis extends BaseAnalysisResult {
    scores: {
        startupFit: number;
        enterpriseFit: number;
        consultingFit: number;
        productFit: number;
        researchFit: number;
    };
    rationale: {
        strengths: string[];
        challenges: string[];
    };
} 