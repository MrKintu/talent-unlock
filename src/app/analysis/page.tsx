import { Suspense } from 'react';
import AnalysisList from '@/components/analysis/AnalysisList';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AnalysisPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Resume Analysis Dashboard</h1>
            <Suspense fallback={<LoadingSpinner />}>
                <AnalysisList />
            </Suspense>
        </div>
    );
} 