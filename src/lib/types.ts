export interface User {
    id: string;
    email?: string;
    name?: string;
    countryOfOrigin?: string;
    targetRole?: string;
    yearsOfExperience?: number;
    createdAt: Date;
}

export interface UserProfile {
    userId: string;
    countryOfOrigin: string;
    targetRole: string;
    yearsOfExperience: string;
    updatedAt: Date;
}

export interface ResumeUpload {
    id: string;
    userId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    downloadUrl: string;
    uploadDate: Date;
    status: 'completed' | 'error';
    progress: number;
    isActive?: boolean;
}

export interface Skill {
    name: string;
    confidence: number;
    category: 'technical' | 'soft' | 'language' | 'certification';
    internationalName?: string;
    canadianEquivalent?: string;
    relevanceScore: number;
}

export interface AnalysisResult {
    id: string;
    resumeId: string;
    userId?: string;
    originalSkills: Skill[];
    mappedSkills: Skill[];
    canadianEquivalents: Skill[];
    missingSkills: Skill[];
    recommendations: string[];
    overallScore: number;
    processingTime: number;
    createdAt: Date;
    status: 'processing' | 'completed' | 'error';
}

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary?: {
        min: number;
        max: number;
        currency: string;
    };
    description: string;
    requirements: string[];
    skills: string[];
    matchPercentage: number;
    applicationUrl?: string;
    postedDate: Date;
    source: 'indeed' | 'linkedin' | 'glassdoor' | 'custom';
}

export interface JobMatch {
    id: string;
    analysisId: string;
    userId?: string;
    jobs: Job[];
    topMatches: Job[];
    averageMatchScore: number;
    createdAt: Date;
}

export interface CareerPath {
    currentRole: string;
    targetRole: string;
    steps: CareerStep[];
    estimatedTime: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface CareerStep {
    title: string;
    description: string;
    duration: string;
    resources: string[];
    cost?: number;
    priority: 'high' | 'medium' | 'low';
}

export interface UploadProgress {
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    message?: string;
}

export interface AnalysisProgress {
    step: 'extracting' | 'mapping' | 'matching' | 'completed';
    progress: number;
    message: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
