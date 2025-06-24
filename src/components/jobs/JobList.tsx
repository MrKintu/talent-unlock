'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BriefcaseIcon as Briefcase, MapPinIcon as MapPin, CurrencyDollarIcon as DollarSign, ArrowTopRightOnSquareIcon as ExternalLink, StarIcon as Star, ArrowTrendingUpIcon as TrendingUp, FunnelIcon as Filter } from '@heroicons/react/24/outline';
import { Job, JobMatch } from '@/lib/types';
import JobCard from './JobCard';
import MatchPercentage from './MatchPercentage';

interface JobListProps {
    analysisId: string;
}

const JobList = ({ analysisId }: JobListProps) => {
    const [jobMatch, setJobMatch] = useState<JobMatch | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Mock skills for demo
                const mockSkills = ['React', 'Node.js', 'TypeScript', 'AWS', 'Agile'];

                const response = await fetch(`/api/jobs?analysisId=${analysisId}&skills=${mockSkills.join(',')}`);
                const result = await response.json();

                if (result.success) {
                    setJobMatch(result.data);
                }
            } catch (error) {
                console.error('Failed to fetch jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [analysisId]);

    const getFilteredJobs = () => {
        if (!jobMatch) return [];

        switch (filter) {
            case 'high':
                return jobMatch.jobs.filter(job => job.matchPercentage >= 85);
            case 'medium':
                return jobMatch.jobs.filter(job => job.matchPercentage >= 70 && job.matchPercentage < 85);
            case 'low':
                return jobMatch.jobs.filter(job => job.matchPercentage < 70);
            default:
                return jobMatch.jobs;
        }
    };

    const getFilterLabel = (filterType: string) => {
        switch (filterType) {
            case 'high':
                return 'High Match (85%+)';
            case 'medium':
                return 'Medium Match (70-84%)';
            case 'low':
                return 'Lower Match (<70%)';
            default:
                return 'All Jobs';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full"
                />
            </div>
        );
    }

    if (!jobMatch) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No jobs found</h2>
                    <p className="text-gray-600">Please try updating your skills or preferences.</p>
                </div>
            </div>
        );
    }

    const filteredJobs = getFilteredJobs();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
            <div className="container mx-auto px-6 pt-20 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-6xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.h1
                            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 via-red-500 to-blue-600 bg-clip-text text-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Your Job Matches
                        </motion.h1>

                        <motion.p
                            className="text-xl text-gray-600 mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Discover opportunities that match your Canadian skill profile
                        </motion.p>

                        {/* Overall Match Score */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="inline-block"
                        >
                            <MatchPercentage
                                percentage={jobMatch.averageMatchScore}
                                label="Average Match Score"
                            />
                        </motion.div>
                    </div>

                    {/* Top Matches */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mb-12"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <Star className="w-6 h-6 text-yellow-500" />
                            Top Matches
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobMatch.topMatches.map((job, index) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0 + index * 0.1 }}
                                >
                                    <JobCard job={job} featured={true} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Filter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="mb-8"
                    >
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-gray-600" />
                                    <span className="font-medium text-gray-700">Filter by:</span>
                                </div>

                                {(['all', 'high', 'medium', 'low'] as const).map((filterType) => (
                                    <button
                                        key={filterType}
                                        onClick={() => setFilter(filterType)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === filterType
                                            ? 'bg-red-600 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {getFilterLabel(filterType)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* All Jobs */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                            All Opportunities ({filteredJobs.length})
                        </h2>

                        {filteredJobs.length === 0 ? (
                            <div className="text-center py-12">
                                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No jobs match your filter</h3>
                                <p className="text-gray-500">Try adjusting your filter criteria</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredJobs.map((job, index) => (
                                    <motion.div
                                        key={job.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.6 + index * 0.05 }}
                                    >
                                        <JobCard job={job} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.8 }}
                        className="mt-12 bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                            Job Market Insights
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-red-600 mb-2">
                                    {jobMatch.jobs.filter(job => job.salary).reduce((sum, job) =>
                                        sum + (job.salary?.min || 0), 0) / jobMatch.jobs.filter(job => job.salary).length
                                    }k
                                </div>
                                <p className="text-gray-600">Average Salary (CAD)</p>
                            </div>

                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-2">
                                    {jobMatch.jobs.filter(job => job.location.includes('Toronto')).length}
                                </div>
                                <p className="text-gray-600">Jobs in Toronto</p>
                            </div>

                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                    {Math.round(jobMatch.averageMatchScore)}%
                                </div>
                                <p className="text-gray-600">Average Match</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default JobList;
