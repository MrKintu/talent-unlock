'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ResumeUpload } from '@/lib/types';
import {
    DocumentIcon,
    TrashIcon,
    CheckCircleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function ResumeManager() {
    const { user } = useAuth();
    const [resumes, setResumes] = useState<ResumeUpload[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchResumes = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/resumes', {
                headers: {
                    'Authorization': `Bearer ${await user?.getIdToken()}`
                }
            });
            const data = await response.json();
            if (data.success && data.data) {
                setResumes(data.data);
            }
        } catch (error) {
            console.error('Error fetching resumes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteResume = async (resumeId: string) => {
        if (!confirm('Are you sure you want to delete this resume?')) return;

        try {
            const response = await fetch('/api/resumes', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user?.getIdToken()}`
                },
                body: JSON.stringify({ resumeId })
            });

            if (response.ok) {
                await fetchResumes();
            }
        } catch (error) {
            console.error('Error deleting resume:', error);
        }
    };

    const handleSetActiveResume = async (resumeId: string) => {
        try {
            const response = await fetch('/api/resumes', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user?.getIdToken()}`
                },
                body: JSON.stringify({ resumeId })
            });

            if (response.ok) {
                await fetchResumes();
            }
        } catch (error) {
            console.error('Error setting active resume:', error);
        }
    };

    const formatUploadDate = (uploadDate: any) => {
        if (!uploadDate) return 'Unknown date';

        let date;
        // Handle Firestore Timestamp object
        if (uploadDate._seconds) {
            date = new Date(uploadDate._seconds * 1000);
        } else {
            // Handle regular Date object or string
            date = new Date(uploadDate);
        }

        // Format date and time
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    useEffect(() => {
        if (user) {
            fetchResumes();
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Uploaded Resumes</h2>

            {resumes.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No resumes uploaded yet.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {resumes.map((resume) => (
                        <motion.div
                            key={resume.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center justify-between p-4 rounded-lg ${resume.isActive
                                ? 'bg-red-50 border border-red-200'
                                : 'bg-white border border-gray-200'
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                <DocumentIcon className="w-8 h-8 text-gray-500" />
                                <div>
                                    <h3 className="font-medium text-gray-900">{resume.fileName}</h3>
                                    <p className="text-sm text-gray-500">
                                        Uploaded on {formatUploadDate(resume.uploadDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleSetActiveResume(resume.id)}
                                    className={`p-2 rounded-lg transition-colors ${resume.isActive
                                        ? 'text-green-600 bg-green-50'
                                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                        }`}
                                    title={resume.isActive ? 'Active Resume' : 'Set as Active'}
                                >
                                    <CheckCircleIcon className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => handleDeleteResume(resume.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Resume"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
} 