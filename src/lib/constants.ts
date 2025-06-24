// Vertex AI Configuration
export const VERTEX_AI = {
    MODEL: 'gemini-1.5-flash',
    TEMPERATURE: 0.2,
    LOCATION: 'northamerica-northeast1',
} as const;

// Firebase Configuration
export const FIREBASE = {
    REGION: 'northamerica-northeast1',
    STORAGE: {
        RESUME_PATH: 'resumes',
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_FILE_TYPES: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
    }
} as const;

// API Routes
export const API_ENDPOINTS = {
    ANALYZE: '/api/analyze',
    JOBS: '/api/jobs',
    RESUMES: '/api/resumes',
    UPLOAD: '/api/upload',
    BACKGROUND: '/api/background'
} as const;

// Analysis Configuration
export const ANALYSIS = {
    MIN_CONFIDENCE_SCORE: 0.7,
    MAX_PROCESSING_TIME: 30000, // 30 seconds
    SKILL_CATEGORIES: {
        TECHNICAL: 'technical',
        SOFT: 'soft',
        LANGUAGE: 'language',
        CERTIFICATION: 'certification'
    } as const,
    PROFICIENCY_LEVELS: {
        BEGINNER: 'beginner',
        INTERMEDIATE: 'intermediate',
        ADVANCED: 'advanced',
        EXPERT: 'expert'
    } as const
} as const;

// User Profile
export const USER_PROFILE = {
    GOAL_CATEGORIES: {
        CAREER: 'career',
        SKILLS: 'skills',
        EDUCATION: 'education',
        CERTIFICATION: 'certification'
    } as const,
    GOAL_STATUS: {
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        NOT_STARTED: 'not_started'
    } as const,
    ACHIEVEMENT_CATEGORIES: {
        SKILLS: 'skills',
        CAREER: 'career',
        EDUCATION: 'education',
        COMMUNITY: 'community'
    } as const,
    ACHIEVEMENT_LEVELS: {
        BRONZE: 'bronze',
        SILVER: 'silver',
        GOLD: 'gold',
        PLATINUM: 'platinum'
    } as const
} as const;

// Job Related
export const JOB = {
    SOURCES: {
        INDEED: 'indeed',
        LINKEDIN: 'linkedin',
        GLASSDOOR: 'glassdoor',
        CUSTOM: 'custom'
    } as const,
    CURRENCY: 'CAD'
} as const;

// Design System
export const DESIGN = {
    COLORS: {
        PRIMARY_RED: '#DC2626',
        PRIMARY_BLUE: '#2563EB',
        WHITE: '#FFFFFF'
    } as const,
    ANIMATION: {
        DURATION: {
            FAST: 0.3,
            NORMAL: 0.8,
            SLOW: 1.2
        }
    } as const
} as const;

// Function Configuration
export const FUNCTIONS = {
    MAX_INSTANCES: 10
} as const;

// Firebase Error Codes
export const FIREBASE_ERRORS = {
    STORAGE: {
        OBJECT_NOT_FOUND: 'storage/object-not-found',
        UNAUTHORIZED: 'storage/unauthorized',
        CANCELED: 'storage/canceled',
        UNKNOWN: 'storage/unknown',
        INVALID_CHECKSUM: 'storage/invalid-checksum',
        QUOTA_EXCEEDED: 'storage/quota-exceeded',
        UNAUTHENTICATED: 'storage/unauthenticated'
    },
    AUTH: {
        USER_NOT_FOUND: 'auth/user-not-found',
        WRONG_PASSWORD: 'auth/wrong-password',
        INVALID_EMAIL: 'auth/invalid-email',
        EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
        WEAK_PASSWORD: 'auth/weak-password',
        OPERATION_NOT_ALLOWED: 'auth/operation-not-allowed',
        USER_DISABLED: 'auth/user-disabled'
    },
    FIRESTORE: {
        DOCUMENT_NOT_FOUND: 'firestore/not-found',
        PERMISSION_DENIED: 'firestore/permission-denied',
        ALREADY_EXISTS: 'firestore/already-exists',
        CANCELLED: 'firestore/cancelled',
        DEADLINE_EXCEEDED: 'firestore/deadline-exceeded'
    }
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    STORAGE: {
        [FIREBASE_ERRORS.STORAGE.OBJECT_NOT_FOUND]: 'The requested file was not found.',
        [FIREBASE_ERRORS.STORAGE.UNAUTHORIZED]: 'You do not have permission to access this file.',
        [FIREBASE_ERRORS.STORAGE.QUOTA_EXCEEDED]: 'Storage quota has been exceeded.',
        [FIREBASE_ERRORS.STORAGE.UNAUTHENTICATED]: 'Please sign in to access this file.',
        DEFAULT: 'An error occurred while accessing the file.'
    },
    AUTH: {
        [FIREBASE_ERRORS.AUTH.USER_NOT_FOUND]: 'No user found with this email.',
        [FIREBASE_ERRORS.AUTH.WRONG_PASSWORD]: 'Incorrect password.',
        [FIREBASE_ERRORS.AUTH.INVALID_EMAIL]: 'Please enter a valid email address.',
        [FIREBASE_ERRORS.AUTH.EMAIL_ALREADY_IN_USE]: 'This email is already registered.',
        DEFAULT: 'An authentication error occurred.'
    },
    FIRESTORE: {
        [FIREBASE_ERRORS.FIRESTORE.DOCUMENT_NOT_FOUND]: 'The requested document was not found.',
        [FIREBASE_ERRORS.FIRESTORE.PERMISSION_DENIED]: 'You do not have permission to access this document.',
        DEFAULT: 'A database error occurred.'
    }
} as const;

// Add type safety for the constants
export type VertexAIModel = typeof VERTEX_AI.MODEL;
export type APIEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type SkillCategory = typeof ANALYSIS.SKILL_CATEGORIES[keyof typeof ANALYSIS.SKILL_CATEGORIES];
export type ProficiencyLevel = typeof ANALYSIS.PROFICIENCY_LEVELS[keyof typeof ANALYSIS.PROFICIENCY_LEVELS];
export type GoalCategory = typeof USER_PROFILE.GOAL_CATEGORIES[keyof typeof USER_PROFILE.GOAL_CATEGORIES];
export type GoalStatus = typeof USER_PROFILE.GOAL_STATUS[keyof typeof USER_PROFILE.GOAL_STATUS];
export type AchievementCategory = typeof USER_PROFILE.ACHIEVEMENT_CATEGORIES[keyof typeof USER_PROFILE.ACHIEVEMENT_CATEGORIES];
export type AchievementLevel = typeof USER_PROFILE.ACHIEVEMENT_LEVELS[keyof typeof USER_PROFILE.ACHIEVEMENT_LEVELS];
export type JobSource = typeof JOB.SOURCES[keyof typeof JOB.SOURCES];
export type FirebaseStorageError = typeof FIREBASE_ERRORS.STORAGE[keyof typeof FIREBASE_ERRORS.STORAGE];
export type FirebaseAuthError = typeof FIREBASE_ERRORS.AUTH[keyof typeof FIREBASE_ERRORS.AUTH];
export type FirebaseFirestoreError = typeof FIREBASE_ERRORS.FIRESTORE[keyof typeof FIREBASE_ERRORS.FIRESTORE]; 