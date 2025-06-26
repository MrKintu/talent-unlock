export interface StatCanRawRecord {
    REF_DATE: string;
    GEO: string;
    DGUID: string;
    'Labour force characteristics': string;
    UOM: string;
    UOM_ID: string;
    SCALAR_FACTOR: string;
    SCALAR_ID: string;
    VECTOR: string;
    COORDINATE: string;
    VALUE: string;
    STATUS: string;
    SYMBOL: string;
    TERMINATED: string;
    DECIMALS: string;
}

export interface EmploymentData {
    employmentRate: number;
    unemploymentRate: number;
    totalEmployed: number;
    monthlyChange: number;
    participationRate: number;
    date: string;
}

export interface EmploymentTrends {
    currentMonth: EmploymentData;
    historicalTrends: ReadonlyArray<EmploymentData>;
    regional: {
        ontario: EmploymentData;
        canada: EmploymentData;
    };
}

export interface IndustryEmployment {
    naicsCode: string;
    name: string;
    employees: number;
    yearOverYearChange: number;
    monthOverMonthChange: number;
    trend: 'growing' | 'stable' | 'declining';
}

export interface TopIndustries {
    date: string;
    industries: ReadonlyArray<IndustryEmployment>;
}

export interface RegionalBreakdown {
    region: string;
    employmentRate: number;
    unemploymentRate: number;
    participationRate: number;
    yearOverYearChange: number;
    topIndustries: ReadonlyArray<IndustryEmployment>;
}

export interface MarketSignal {
    type: 'employment_surge' | 'industry_growth' | 'skill_demand' | 'regional_opportunity';
    industry?: string;
    region?: string;
    strength: number; // 1-10
    data: string;
    source: 'Statistics Canada';
    date: string;
    confidence: number; // 0-1
}

export interface EmploymentInsights {
    signals: ReadonlyArray<MarketSignal>;
    recommendations: ReadonlyArray<{
        action: string;
        reason: string;
        confidence: number;
        supportingData: string;
    }>;
    marketHealth: {
        overall: number; // 0-1
        trend: 'improving' | 'stable' | 'declining';
        factors: ReadonlyArray<{
            name: string;
            score: number;
            trend: 'up' | 'down' | 'stable';
        }>;
    };
}

// Cache structure for storing processed data
export interface StatCanDataCache {
    lastUpdated: Date;
    employmentTrends: EmploymentTrends;
    topIndustries: TopIndustries;
    regionalBreakdown: ReadonlyArray<RegionalBreakdown>;
    insights: EmploymentInsights;
} 