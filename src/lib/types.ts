import { ANALYSIS, USER_PROFILE, JOB } from './constants';

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
        proficiency: typeof ANALYSIS.PROFICIENCY_LEVELS[keyof typeof ANALYSIS.PROFICIENCY_LEVELS];
        endorsements?: number;
    }[];
    // Goals and achievements
    goals?: {
        id: string;
        title: string;
        description: string;
        category: keyof typeof USER_PROFILE.GOAL_CATEGORIES;
        status: keyof typeof USER_PROFILE.GOAL_STATUS;
        deadline?: Date;
        completedAt?: Date;
        progress?: number;
    }[];
    // Digital trophies/badges
    achievements?: {
        id: string;
        title: string;
        description: string;
        category: keyof typeof USER_PROFILE.ACHIEVEMENT_CATEGORIES;
        earnedAt: Date;
        icon: string;
        level: typeof USER_PROFILE.ACHIEVEMENT_LEVELS[keyof typeof USER_PROFILE.ACHIEVEMENT_LEVELS];
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
    category: keyof typeof ANALYSIS.SKILL_CATEGORIES;
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
        currency: typeof JOB.CURRENCY;
    };
    description: string;
    requirements: string[];
    skills: string[];
    matchPercentage: number;
    applicationUrl?: string;
    postedDate: Date;
    source: keyof typeof JOB.SOURCES;
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
    status: 'ready' | 'uploading' | 'completed' | 'error';
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
