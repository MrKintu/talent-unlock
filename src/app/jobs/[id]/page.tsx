import JobList from '@/components/jobs/JobList';

export default function JobsPage({ params }: { params: { id: string } }) {
    return <JobList analysisId={params.id} />;
}
