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
    socialLinks: {
        github?: string;
        linkedin?: string;
        portfolio?: string;
    };
    // Skills with proficiency level
    skills: Array<{
        name: string;
        proficiency: string;
        endorsements?: number;
    }>;
    // Goals and achievements
    goals: Array<{
        id: string;
        title: string;
        description: string;
        progress: number;
        dueDate?: Date;
    }>;
    // Digital trophies/badges
    achievements: Array<{
        id: string;
        title: string;
        description: string;
        category: 'SKILLS' | 'CAREER' | 'EDUCATION' | 'COMMUNITY';
        earnedAt: Date;
        icon: string;
        level: 'bronze' | 'silver' | 'gold' | 'platinum';
    }>;
}

export interface ResumeUpload {
    id: string;
    userId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    downloadUrl: string;
    uploadDate: Date;
    status: 'processing' | 'completed' | 'error';
    processingStatus?: 'processing' | 'completed' | 'error';
    progress: number;
    isActive?: boolean;
    error?: string;
    extractedText?: string;
    textExtractionConfidence?: number;
    updatedAt?: Date;
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
    description: string;
    requirements: string[];
    salary?: {
        min: number;
        max: number;
        currency: string;
    };
    matchPercentage: number;
    postedDate: Date;
    applicationUrl: string;
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

export interface Analysis {
    id: string;
    userId: string;
    resumeId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    profileResults?: {
        skills: Array<{
            name: string;
            level: string;
            confidence: number;
        }>;
        experience: Array<{
            role: string;
            company: string;
            duration: number;
            highlights: string[];
        }>;
        education: Array<{
            degree: string;
            institution: string;
            year: number;
        }>;
        recommendations: Array<{
            type: 'skill' | 'certification' | 'experience';
            description: string;
            priority: 'high' | 'medium' | 'low';
        }>;
    };
    technicalResults?: {
        technicalSkills: Array<{
            name: string;
            category: string;
            level: string;
            yearsOfExperience: number;
            lastUsed: number;
            context: string[];
        }>;
        technicalProjects: Array<{
            name: string;
            description: string;
            technologies: string[];
            role: string;
            impact: string[];
        }>;
        certifications: Array<{
            name: string;
            issuer: string;
            year: number;
            relevance: string;
        }>;
        recommendations: string[];
    };
    createdAt: Date;
    completedAt?: Date;
    error?: string;
}
