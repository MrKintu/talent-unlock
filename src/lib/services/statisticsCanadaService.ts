import { parse } from 'csv-parse/sync';
import {
    StatCanRawRecord,
    EmploymentTrends,
    TopIndustries,
    RegionalBreakdown,
    EmploymentInsights,
    StatCanDataCache,
    EmploymentData
} from '@/lib/types/statistics';
import { db } from '@/lib/firebase-admin';
import { employmentData } from '@/data/employment-data';
import { Timestamp } from 'firebase-admin/firestore';

class StatisticsCanadaService {
    private static instance: StatisticsCanadaService;
    private baseUrl = 'https://www150.statcan.gc.ca/t1/wds/rest';
    private cache: StatCanDataCache | null = null;
    private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    private maxRetries = 3;
    private retryDelay = 1000; // 1 second
    private useLocalData = true; // Set to false to use live API

    private constructor() { }

    static getInstance(): StatisticsCanadaService {
        if (!StatisticsCanadaService.instance) {
            StatisticsCanadaService.instance = new StatisticsCanadaService();
        }
        return StatisticsCanadaService.instance;
    }

    private async fetchWithRetry(url: string, retries = 0): Promise<Response> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (error) {
            if (retries < this.maxRetries) {
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retries + 1)));
                return this.fetchWithRetry(url, retries + 1);
            }
            throw error;
        }
    }

    private async downloadAndParseCSV(url: string): Promise<StatCanRawRecord[]> {
        const response = await this.fetchWithRetry(url);
        const csvText = await response.text();
        return parse(csvText, {
            columns: true,
            skip_empty_lines: true
        });
    }

    private async getDownloadUrl(tableId: string): Promise<string> {
        const response = await this.fetchWithRetry(
            `${this.baseUrl}/getFullTableDownloadCSV/${tableId}/en`
        );
        const data = await response.json();
        if (data.status !== 'SUCCESS' || !data.object) {
            throw new Error('Failed to get download URL');
        }
        return data.object;
    }

    private async loadCache(): Promise<void> {
        if (this.useLocalData) {
            this.cache = {
                lastUpdated: new Date(),
                employmentTrends: employmentData.trends,
                topIndustries: employmentData.topIndustries,
                regionalBreakdown: employmentData.regionalBreakdown,
                insights: this.generateInsights(
                    employmentData.trends,
                    employmentData.topIndustries,
                    employmentData.regionalBreakdown
                )
            };
            return;
        }

        // Try loading from Firebase Storage first
        try {
            const storageRef = db.collection('statcanCache').doc('latest');
            const doc = await storageRef.get();

            if (doc.exists) {
                const data = doc.data() as StatCanDataCache & { lastUpdated: Timestamp };
                const lastUpdateTime = data.lastUpdated.toDate().getTime();
                const now = new Date().getTime();

                // If data is less than a month old, use it
                if (now - lastUpdateTime < 30 * 24 * 60 * 60 * 1000) {
                    this.cache = {
                        ...data,
                        lastUpdated: data.lastUpdated.toDate()
                    };
                    return;
                }
            }
        } catch (error) {
            console.error('Error loading from Firebase:', error);
        }

        // If no cached data or data is old, refresh from API
        await this.refreshCache();
    }

    private async refreshCache(): Promise<void> {
        if (this.useLocalData) {
            return;
        }

        try {
            const [employmentData, industryData] = await Promise.all([
                this.downloadAndParseCSV(await this.getDownloadUrl('14100287')),
                this.downloadAndParseCSV(await this.getDownloadUrl('14100023'))
            ]);

            const employmentTrends = this.processEmploymentTrends(employmentData);
            const topIndustries = this.processIndustryData(industryData);
            const regionalBreakdown = this.processRegionalData(employmentData, industryData);
            const insights = this.generateInsights(employmentTrends, topIndustries, regionalBreakdown);

            this.cache = {
                lastUpdated: new Date(),
                employmentTrends,
                topIndustries,
                regionalBreakdown,
                insights
            };

            // Store in Firebase Storage
            try {
                await db.collection('statcanCache').doc('latest').set({
                    ...this.cache,
                    lastUpdated: Timestamp.fromDate(this.cache.lastUpdated)
                });
            } catch (error) {
                console.error('Error storing in Firebase:', error);
            }
        } catch (error) {
            console.error('Error refreshing cache:', error);
            // Fallback to local data if API fails
            this.useLocalData = true;
            await this.loadCache();
        }
    }

    private processEmploymentTrends(data: StatCanRawRecord[]): EmploymentTrends {
        // Filter for last 24 months and calculate trends
        const sortedData = data
            .filter(record => record.GEO === 'Canada' && record['Labour force characteristics'] === 'Employment')
            .sort((a, b) => new Date(b.REF_DATE).getTime() - new Date(a.REF_DATE).getTime())
            .slice(0, 24);

        const processMonth = (record: StatCanRawRecord): EmploymentData => ({
            employmentRate: parseFloat(record.VALUE),
            unemploymentRate: this.findUnemploymentRate(data, record.REF_DATE) || 0,
            totalEmployed: parseFloat(record.VALUE) * (record.SCALAR_FACTOR === 'thousands' ? 1000 : 1),
            monthlyChange: this.calculateMonthlyChange(data, record),
            participationRate: this.findParticipationRate(data, record.REF_DATE) || 0,
            date: record.REF_DATE
        });

        const currentMonth = processMonth(sortedData[0]);
        const historicalTrends = sortedData.map(processMonth);

        return {
            currentMonth,
            historicalTrends,
            regional: {
                ontario: this.extractRegionalData(data, 'Ontario', sortedData[0].REF_DATE),
                canada: currentMonth
            }
        };
    }

    private findUnemploymentRate(data: StatCanRawRecord[], date: string): number {
        const record = data.find(r =>
            r.REF_DATE === date &&
            r.GEO === 'Canada' &&
            r['Labour force characteristics'] === 'Unemployment rate'
        );
        return record ? parseFloat(record.VALUE) : 0;
    }

    private findParticipationRate(data: StatCanRawRecord[], date: string): number {
        const record = data.find(r =>
            r.REF_DATE === date &&
            r.GEO === 'Canada' &&
            r['Labour force characteristics'] === 'Participation rate'
        );
        return record ? parseFloat(record.VALUE) : 0;
    }

    private calculateMonthlyChange(data: StatCanRawRecord[], currentRecord: StatCanRawRecord): number {
        const previousMonth = this.getPreviousMonth(currentRecord.REF_DATE);
        const previousRecord = data.find(r =>
            r.REF_DATE === previousMonth &&
            r.GEO === currentRecord.GEO &&
            r['Labour force characteristics'] === currentRecord['Labour force characteristics']
        );

        if (!previousRecord) return 0;

        const current = parseFloat(currentRecord.VALUE);
        const previous = parseFloat(previousRecord.VALUE);
        return ((current - previous) / previous) * 100;
    }

    private getPreviousMonth(date: string): string {
        const d = new Date(date);
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0].substring(0, 7);
    }

    private extractRegionalData(data: StatCanRawRecord[], region: string, date: string): EmploymentData {
        const record = data.find(r =>
            r.REF_DATE === date &&
            r.GEO === region &&
            r['Labour force characteristics'] === 'Employment'
        );

        if (!record) {
            return {
                employmentRate: 0,
                unemploymentRate: 0,
                totalEmployed: 0,
                monthlyChange: 0,
                participationRate: 0,
                date
            };
        }

        return {
            employmentRate: parseFloat(record.VALUE),
            unemploymentRate: this.findUnemploymentRate(data, date) || 0,
            totalEmployed: parseFloat(record.VALUE) * (record.SCALAR_FACTOR === 'thousands' ? 1000 : 1),
            monthlyChange: this.calculateMonthlyChange(data, record),
            participationRate: this.findParticipationRate(data, date) || 0,
            date
        };
    }

    private processIndustryData(data: StatCanRawRecord[]): TopIndustries {
        return {
            date: new Date().toISOString().split('T')[0],
            industries: []
        };
    }

    private processRegionalData(employmentData: StatCanRawRecord[], industryData: StatCanRawRecord[]): ReadonlyArray<RegionalBreakdown> {
        return [];
    }

    private generateInsights(
        trends: EmploymentTrends,
        industries: TopIndustries,
        regional: ReadonlyArray<RegionalBreakdown>
    ): EmploymentInsights {
        return {
            signals: [],
            recommendations: [],
            marketHealth: {
                overall: 0,
                trend: 'stable',
                factors: []
            }
        };
    }

    // Public methods

    async getEmploymentTrends(): Promise<EmploymentTrends> {
        if (!this.cache) {
            await this.loadCache();
        }
        return this.cache!.employmentTrends;
    }

    async getTopIndustries(): Promise<TopIndustries> {
        if (!this.cache) {
            await this.loadCache();
        }
        return this.cache!.topIndustries;
    }

    async getRegionalBreakdown(): Promise<ReadonlyArray<RegionalBreakdown>> {
        if (!this.cache) {
            await this.loadCache();
        }
        return this.cache!.regionalBreakdown;
    }

    async getMarketInsights(): Promise<EmploymentInsights> {
        if (!this.cache) {
            await this.loadCache();
        }
        return this.cache!.insights;
    }

    async forceRefresh(): Promise<void> {
        await this.refreshCache();
    }

    setUseLocalData(useLocal: boolean): void {
        if (this.useLocalData !== useLocal) {
            this.useLocalData = useLocal;
            this.cache = null; // Force reload on next request
        }
    }

    async getDataFreshness(): Promise<{
        source: 'local' | 'firebase' | 'api',
        lastUpdated: Date
    }> {
        if (!this.cache) {
            await this.loadCache();
        }
        return {
            source: this.useLocalData ? 'local' : 'firebase',
            lastUpdated: this.cache!.lastUpdated
        };
    }
}

export const statisticsCanadaService = StatisticsCanadaService.getInstance(); 