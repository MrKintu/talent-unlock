import {
    StatCanRawRecord,
    IndustryEmployment,
    MarketSignal,
    RegionalBreakdown
} from '@/lib/types/statistics';

export class EmploymentAnalyzer {
    private static readonly GROWTH_THRESHOLD = 0.02; // 2% for significant growth
    private static readonly DECLINE_THRESHOLD = -0.02; // -2% for significant decline
    private static readonly CONFIDENCE_THRESHOLD = 0.7; // 70% confidence threshold

    static calculateIndustryTrends(
        currentData: StatCanRawRecord[],
        historicalData: StatCanRawRecord[]
    ): IndustryEmployment[] {
        const industries = new Map<string, IndustryEmployment>();

        // Process current data
        currentData.forEach(record => {
            if (record.GEO === 'Canada' && record['Labour force characteristics'] === 'Employment') {
                const naicsCode = record.VECTOR;
                const currentValue = parseFloat(record.VALUE);

                // Find historical data for YoY comparison
                const lastYear = this.findHistoricalRecord(historicalData, record, 12);
                const lastMonth = this.findHistoricalRecord(historicalData, record, 1);

                const yearOverYearChange = lastYear ?
                    ((currentValue - parseFloat(lastYear.VALUE)) / parseFloat(lastYear.VALUE)) * 100 : 0;
                const monthOverMonthChange = lastMonth ?
                    ((currentValue - parseFloat(lastMonth.VALUE)) / parseFloat(lastMonth.VALUE)) * 100 : 0;

                industries.set(naicsCode, {
                    naicsCode,
                    name: record['Labour force characteristics'],
                    employees: currentValue * (record.SCALAR_FACTOR === 'thousands' ? 1000 : 1),
                    yearOverYearChange,
                    monthOverMonthChange,
                    trend: this.determineTrend(yearOverYearChange)
                });
            }
        });

        return Array.from(industries.values())
            .sort((a, b) => b.yearOverYearChange - a.yearOverYearChange);
    }

    static generateMarketSignals(
        industries: IndustryEmployment[],
        regional: RegionalBreakdown[]
    ): MarketSignal[] {
        const signals: MarketSignal[] = [];

        // Analyze industry growth signals
        industries.forEach(industry => {
            if (industry.yearOverYearChange > this.GROWTH_THRESHOLD * 100) {
                signals.push({
                    type: 'industry_growth',
                    industry: industry.name,
                    strength: Math.min(10, Math.round(industry.yearOverYearChange / 2)),
                    data: `${industry.yearOverYearChange.toFixed(1)}% year-over-year growth`,
                    source: 'Statistics Canada',
                    date: new Date().toISOString(),
                    confidence: this.calculateConfidence(industry.yearOverYearChange, industry.monthOverMonthChange)
                });
            }
        });

        // Analyze regional opportunities
        regional.forEach(region => {
            if (region.yearOverYearChange && region.yearOverYearChange > this.GROWTH_THRESHOLD * 100) {
                signals.push({
                    type: 'regional_opportunity',
                    region: region.region,
                    strength: Math.min(10, Math.round(region.yearOverYearChange ?? 0 / 2)),
                    data: `Strong job market growth in ${region.region}`,
                    source: 'Statistics Canada',
                    date: new Date().toISOString(),
                    confidence: this.calculateConfidence(region.yearOverYearChange ?? 0, 0)
                });
            }
        });

        // Sort by strength and confidence
        return signals.sort((a, b) =>
            (b.strength * b.confidence) - (a.strength * a.confidence)
        );
    }

    static analyzeRegionalTrends(
        data: StatCanRawRecord[],
        regions: string[]
    ): RegionalBreakdown[] {
        return regions.map(region => {
            const regionalData = data.filter(record => record.GEO === region);
            const currentMonth = this.getMostRecentDate(regionalData);
            const lastYear = this.getDateMonthsAgo(currentMonth, 12);

            const current = this.getRegionalMetrics(regionalData, currentMonth);
            const previous = this.getRegionalMetrics(regionalData, lastYear);

            const yearOverYearChange = ((current.employmentRate - previous.employmentRate) / previous.employmentRate) * 100;

            return {
                region,
                ...current,
                yearOverYearChange,
                topIndustries: [] // To be populated with industry-specific data
            };
        });
    }

    private static findHistoricalRecord(
        data: StatCanRawRecord[],
        current: StatCanRawRecord,
        monthsAgo: number
    ): StatCanRawRecord | undefined {
        const targetDate = this.getDateMonthsAgo(current.REF_DATE, monthsAgo);
        return data.find(record =>
            record.REF_DATE === targetDate &&
            record.GEO === current.GEO &&
            record['Labour force characteristics'] === current['Labour force characteristics']
        );
    }

    private static determineTrend(yearOverYearChange: number): 'growing' | 'stable' | 'declining' {
        if (yearOverYearChange > this.GROWTH_THRESHOLD * 100) return 'growing';
        if (yearOverYearChange < this.DECLINE_THRESHOLD * 100) return 'declining';
        return 'stable';
    }

    private static calculateConfidence(yearOverYearChange: number, monthOverMonthChange: number): number {
        // Simple confidence calculation based on consistency of trends
        const yearTrend = this.determineTrend(yearOverYearChange);
        const monthTrend = this.determineTrend(monthOverMonthChange);

        if (yearTrend === monthTrend) return 0.9;
        if (yearTrend === 'stable' || monthTrend === 'stable') return 0.7;
        return 0.5;
    }

    private static getMostRecentDate(data: StatCanRawRecord[]): string {
        return data.reduce((latest, record) =>
            record.REF_DATE > latest ? record.REF_DATE : latest
            , '');
    }

    private static getDateMonthsAgo(date: string, months: number): string {
        const d = new Date(date);
        d.setMonth(d.getMonth() - months);
        return d.toISOString().split('T')[0].substring(0, 7);
    }

    private static getRegionalMetrics(data: StatCanRawRecord[], date: string) {
        const getMetric = (characteristic: string) => {
            const record = data.find(r =>
                r.REF_DATE === date &&
                r['Labour force characteristics'] === characteristic
            );
            return record ? parseFloat(record.VALUE) : 0;
        };

        return {
            employmentRate: getMetric('Employment rate'),
            unemploymentRate: getMetric('Unemployment rate'),
            participationRate: getMetric('Participation rate')
        };
    }
} 