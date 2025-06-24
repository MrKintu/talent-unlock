import AnalysisResults from '@/components/analysis/AnalysisResults';

export default function AnalysisPage({ params }: { params: { id: string } }) {
    return <AnalysisResults analysisId={params.id} />;
}
