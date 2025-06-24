'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { DocumentIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { resumeService } from '@/lib/services/resumeService';
import type { ResumeListResponse } from '@/lib/services/resumeService';

export default function ResumeManager() {
    const { user } = useAuth();
    const [resumes, setResumes] = useState<ResumeListResponse['data']>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);

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

    const fetchResumes = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await resumeService.listResumes(token);
            if (response.success) {
                setResumes(response.data);
            }
        } catch (error) {
            console.error('Error fetching resumes:', error);
            setError('Failed to fetch resumes');
        }
    };

    useEffect(() => {
        if (user) {
            fetchResumes();
        }
    }, [user]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            const token = await user.getIdToken();
            const response = await resumeService.uploadResume(token, file);
            if (response.success) {
                await fetchResumes();
            } else {
                setError(response.message || 'Failed to upload resume');
            }
        } catch (error) {
            console.error('Error uploading resume:', error);
            setError('Failed to upload resume');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (resumeId: string) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await resumeService.deleteResume(token, resumeId);
            if (response.success) {
                await fetchResumes();
            } else {
                setError(response.message || 'Failed to delete resume');
            }
        } catch (error) {
            console.error('Error deleting resume:', error);
            setError('Failed to delete resume');
        }
    };

    const handleAnalyze = async (resumeId: string) => {
        if (!user) return;
        setIsAnalyzing(resumeId);
        setError(null);

        try {
            const token = await user.getIdToken();
            const response = await resumeService.analyzeResume(token, resumeId);
            if (!response.success) {
                setError(response.message || 'Failed to analyze resume');
            }
        } catch (error) {
            console.error('Error analyzing resume:', error);
            setError('Failed to analyze resume');
        } finally {
            setIsAnalyzing(null);
        }
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resume Manager</h2>

            {/* Upload Section */}
            <div className="mb-6">
                <label className="block mb-2">
                    <span className="sr-only">Choose file</span>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-red-50 file:text-red-700
                            hover:file:bg-red-100"
                    />
                </label>
                {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-red-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Resumes List */}
            <div className="grid grid-cols-1 gap-4">
                {resumes.map((resume) => (
                    <div
                        key={resume.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                    >
                        <div className="flex items-center gap-4">
                            <DocumentIcon className="w-8 h-8 text-gray-400" />
                            <div>
                                <h3 className="font-medium text-gray-900">{resume.fileName}</h3>
                                <p className="text-sm text-gray-500">
                                    Uploaded on {formatUploadDate(resume.uploadDate)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleAnalyze(resume.id)}
                                disabled={isAnalyzing === resume.id}
                                className="p-2 text-gray-600 hover:text-red-600 disabled:opacity-50"
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${isAnalyzing === resume.id ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => handleDelete(resume.id)}
                                className="p-2 text-gray-600 hover:text-red-600"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 