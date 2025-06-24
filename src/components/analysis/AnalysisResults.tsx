'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircleIcon,
    ArrowRightIcon,
    ArrowTrendingUpIcon,
    BookOpenIcon,
    CursorArrowRaysIcon,
    StarIcon,
    MapPinIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { AnalysisResult, Skill } from '@/lib/types';
import SkillsComparison from './SkillsComparison';

interface AnalysisResultsProps {
    analysisId: string;
}

const AnalysisResults = ({ analysisId }: AnalysisResultsProps) => {
    const router = useRouter();
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock analysis data for demo
        const mockAnalysis: AnalysisResult = {
            id: analysisId,
            resumeId: 'resume_123',
            originalSkills: [
                { name: 'Java Development', confidence: 0.95, category: 'technical', relevanceScore: 0.9 },
                { name: 'Spring Framework', confidence: 0.92, category: 'technical', relevanceScore: 0.85 },
                { name: 'MySQL Database', confidence: 0.88, category: 'technical', relevanceScore: 0.8 },
                { name: 'Team Leadership', confidence: 0.85, category: 'soft', relevanceScore: 0.9 },
                { name: 'Hindi (Native)', confidence: 0.95, category: 'language', relevanceScore: 0.7 },
                { name: 'English (Fluent)', confidence: 0.9, category: 'language', relevanceScore: 0.95 }
            ],
            mappedSkills: [
                {
                    name: 'Full-Stack Development',
                    confidence: 0.95,
                    category: 'technical',
                    internationalName: 'Java Development',
                    canadianEquivalent: 'Full-Stack Development',
                    relevanceScore: 0.95
                },
                {
                    name: 'Modern Web Frameworks',
                    confidence: 0.92,
                    category: 'technical',
                    internationalName: 'Spring Framework',
                    canadianEquivalent: 'React/Node.js/Angular',
                    relevanceScore: 0.9
                },
                {
                    name: 'Cloud Database Management',
                    confidence: 0.88,
                    category: 'technical',
                    internationalName: 'MySQL Database',
                    canadianEquivalent: 'AWS RDS/Azure SQL',
                    relevanceScore: 0.85
                },
                {
                    name: 'Project Management',
                    confidence: 0.85,
                    category: 'soft',
                    internationalName: 'Team Leadership',
                    canadianEquivalent: 'Agile Project Management',
                    relevanceScore: 0.9
                },
                {
                    name: 'Multilingual Communication',
                    confidence: 0.9,
                    category: 'language',
                    internationalName: 'Hindi (Native)',
                    canadianEquivalent: 'English + Hindi',
                    relevanceScore: 0.8
                }
            ],
            canadianEquivalents: [],
            missingSkills: [
                { name: 'React.js', confidence: 0.8, category: 'technical', relevanceScore: 0.9 },
                { name: 'TypeScript', confidence: 0.75, category: 'technical', relevanceScore: 0.85 },
                { name: 'AWS/Azure', confidence: 0.7, category: 'technical', relevanceScore: 0.8 },
                { name: 'Agile/Scrum', confidence: 0.8, category: 'soft', relevanceScore: 0.85 }
            ],
            recommendations: [
                'Complete React.js certification from Udemy or Coursera',
                'Learn TypeScript fundamentals for better code quality',
                'Get AWS Solutions Architect certification',
                'Take Agile project management course',
                'Practice English communication skills in professional settings'
            ],
            overallScore: 87,
            processingTime: 2500,
            createdAt: new Date(),
            status: 'completed'
        };

        // Simulate loading
        setTimeout(() => {
            setAnalysis(mockAnalysis);
            setLoading(false);
        }, 2000);
    }, [analysisId]);

    const handleViewJobs = () => {
        router.push(`/jobs/${analysisId}`);
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

    if (!analysis) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis not found</h2>
                    <p className="text-gray-600">Please try uploading your resume again.</p>
                </div>
            </div>
        );
    }

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
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircleIcon className="w-10 h-10 text-green-600" />
                        </motion.div>

                        <motion.h1
                            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 via-red-500 to-blue-600 bg-clip-text text-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Analysis Complete!
                        </motion.h1>

                        <motion.p
                            className="text-xl text-gray-600 mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Your skills have been successfully mapped to Canadian standards
                        </motion.p>

                        {/* Overall Score */}
                        <motion.div
                            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 inline-block"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-800">{analysis.overallScore}%</div>
                                    <div className="text-sm text-gray-600">Match Score</div>
                                </div>
                                <div className="w-px h-12 bg-gray-300" />
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-800">{analysis.mappedSkills.length}</div>
                                    <div className="text-sm text-gray-600">Skills Mapped</div>
                                </div>
                                <div className="w-px h-12 bg-gray-300" />
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-800">{analysis.processingTime}ms</div>
                                    <div className="text-sm text-gray-600">Processing Time</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Skills Comparison */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mb-12"
                    >
                        <SkillsComparison
                            originalSkills={analysis.originalSkills}
                            mappedSkills={analysis.mappedSkills}
                            analysisId={analysisId}
                        />
                    </motion.div>

                    {/* Missing Skills */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-12"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <CursorArrowRaysIcon className="w-6 h-6 text-red-600" />
                            Skills to Develop
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {analysis.missingSkills.map((skill, index) => (
                                <motion.div
                                    key={skill.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.2 + index * 0.1 }}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">{skill.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            Relevance: {Math.round(skill.relevanceScore * 100)}%
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {skill.category}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recommendations */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-12"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <BookOpenIcon className="w-6 h-6 text-blue-600" />
                            Career Development Recommendations
                        </h2>

                        <div className="space-y-4">
                            {analysis.recommendations.map((recommendation, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.4 + index * 0.1 }}
                                    className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg"
                                >
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                    <p className="text-gray-700">{recommendation}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.6 }}
                        className="text-center"
                    >
                        <button
                            onClick={handleViewJobs}
                            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
                        >
                            <BriefcaseIcon className="w-5 h-5" />
                            View Job Matches
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                        <p className="text-gray-600 mt-4">
                            Discover opportunities that match your Canadian skill profile
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default AnalysisResults;
