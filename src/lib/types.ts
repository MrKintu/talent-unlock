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
    // Social links
    socialLinks?: {
        github?: string;
        linkedin?: string;
        portfolio?: string;
    };
    // Skills with proficiency level
    skills?: {
        name: string;
        proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        endorsements?: number;
    }[];
    // Goals and achievements
    goals?: {
        id: string;
        title: string;
        description: string;
        category: 'career' | 'skills' | 'education' | 'certification';
        status: 'in_progress' | 'completed' | 'not_started';
        deadline?: Date;
        completedAt?: Date;
        progress?: number;
    }[];
    // Digital trophies/badges
    achievements?: {
        id: string;
        title: string;
        description: string;
        category: 'skills' | 'career' | 'education' | 'community';
        earnedAt: Date;
        icon: string;
        level: 'bronze' | 'silver' | 'gold' | 'platinum';
    }[];
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
