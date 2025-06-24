'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
    ArrowUpTrayIcon,
    XMarkIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    CloudArrowUpIcon,
    UserIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { ResumeUpload as ResumeUploadType, UploadProgress, UserProfile } from '@/lib/types';
import { useAuth } from '@/lib/auth/AuthContext';
import { FIREBASE } from '@/lib/constants';

export default function ResumeUpload() {
    const router = useRouter();
    const { user } = useAuth();
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
        progress: 0,
        status: 'uploading'
    });
    const [userBackground, setUserBackground] = useState<Omit<UserProfile, 'userId'>>({
        countryOfOrigin: '',
        targetRole: '',
        yearsOfExperience: '',
        updatedAt: new Date(),
        socialLinks: {},
        skills: [],
        goals: [],
        achievements: []
    });
    const [currentStep, setCurrentStep] = useState<'upload' | 'background' | 'complete'>('upload');
    const [resumes, setResumes] = useState<ResumeUploadType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const steps = [
        { step: 'upload', label: 'Upload Resume', icon: CloudArrowUpIcon },
        { step: 'background', label: 'Background Info', icon: UserIcon },
        { step: 'complete', label: 'Review', icon: CheckIcon }
    ];

    useEffect(() => {
        if (user) {
            fetchUserProfile();
            fetchResumes();
        }
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${await user?.getIdToken()}`
                }
            });
            const data = await response.json();
            if (data.success && data.data) {
                setUserBackground(data.data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

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

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, []);

    const handleFileSelect = (file: File) => {
        // Validate file type
        if (!FIREBASE.STORAGE.ALLOWED_FILE_TYPES.includes(file.type as typeof FIREBASE.STORAGE.ALLOWED_FILE_TYPES[number])) {
            alert('Please upload a PDF or Word document.');
            return;
        }

        // Validate file size
        if (file.size > FIREBASE.STORAGE.MAX_FILE_SIZE) {
            alert('File size too large. Please upload a file smaller than 10MB.');
            return;
        }

        setSelectedFile(file);
        setUploadProgress({
            progress: 0,
            status: 'ready'
        });
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleBackgroundSubmit = async () => {
        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user?.getIdToken()}`
                },
                body: JSON.stringify({
                    ...userBackground,
                    userId: user?.uid
                })
            });

            const data = await response.json();
            if (data.success) {
                setCurrentStep('complete');
            }
        } catch (error) {
            console.error('Error saving background:', error);
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            if (!user) {
                throw new Error('User not authenticated');
            }

            setUploadProgress({
                progress: 0,
                status: 'uploading'
            });

            // Get a fresh token
            const token = await user.getIdToken(true);

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();

            if (data.success) {
                toast.success('File uploaded successfully!');
                await handleUploadSuccess(data.data.downloadUrl);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Upload failed. Please try again.');
            setUploadProgress({
                progress: 0,
                status: 'error'
            });
        }
    };

    const handleDeleteResume = async (resumeId: string) => {
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
                toast.success('Resume deleted successfully');
                await fetchResumes();
            } else {
                throw new Error('Failed to delete resume');
            }
        } catch (error) {
            console.error('Error deleting resume:', error);
            toast.error('Failed to delete resume');
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleUploadSuccess = async (downloadUrl: string) => {
        try {
            // Update upload progress
            setUploadProgress({
                progress: 100,
                status: 'completed'
            });

            // Move to background step
            setCurrentStep('background');

        } catch (error) {
            console.error('Upload error:', error);
            setUploadProgress({
                progress: 0,
                status: 'error'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.h1
                            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 via-red-500 to-blue-600 bg-clip-text text-transparent"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            Upload Your Resume
                        </motion.h1>
                        <motion.p
                            className="text-xl text-gray-600 mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Let our AI analyze your international experience and map it to Canadian opportunities
                        </motion.p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-center mb-8">
                        <nav className="flex items-center space-x-4" aria-label="Progress">
                            {steps.map(({ step, label, icon: Icon }) => (
                                <div key={step} className="flex items-center">
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === step
                                            ? 'bg-red-600 text-white'
                                            : steps.indexOf({ step: currentStep, label: '', icon: CloudArrowUpIcon }) >
                                                steps.indexOf({ step, label: '', icon: CloudArrowUpIcon })
                                                ? 'bg-red-200 text-red-700'
                                                : 'bg-gray-200 text-gray-400'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span
                                        className={`ml-2 text-sm font-medium ${currentStep === step ? 'text-red-600' : 'text-gray-500'
                                            }`}
                                    >
                                        {label}
                                    </span>
                                    {step !== 'complete' && (
                                        <div className="ml-4 w-8 h-0.5 bg-gray-200"></div>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>

                    <AnimatePresence mode="wait">
                        {currentStep === 'upload' && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
                            >
                                <div
                                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${isDragOver
                                        ? 'border-red-500 bg-red-50'
                                        : selectedFile
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 hover:border-red-400'
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {selectedFile ? (
                                        <motion.div
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                            className="space-y-4"
                                        >
                                            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                    {selectedFile.name}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedFile(null)}
                                                className="text-red-500 hover:text-red-700 flex items-center gap-2 mx-auto"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                                Remove file
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <div className="space-y-4">
                                            <ArrowUpTrayIcon className="w-16 h-16 text-gray-400 mx-auto" />
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                    Drop your resume here
                                                </h3>
                                                <p className="text-gray-600 mb-4">
                                                    or click to browse files
                                                </p>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleFileInput}
                                                    className="hidden"
                                                    id="file-input"
                                                />
                                                <label
                                                    htmlFor="file-input"
                                                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
                                                >
                                                    Choose File
                                                </label>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Supports PDF, DOC, DOCX (max 10MB)
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {selectedFile && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-8 text-center"
                                    >
                                        {uploadProgress.status === 'uploading' ? (
                                            <div className="space-y-4">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress.progress}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-sm text-gray-600">Uploading... {uploadProgress.progress}%</p>
                                            </div>
                                        ) : uploadProgress.status === 'completed' ? (
                                            <button
                                                onClick={() => setCurrentStep('background')}
                                                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
                                            >
                                                Continue
                                                <ArrowRightIcon className="w-5 h-5" />
                                            </button>
                                        ) : uploadProgress.status === 'error' ? (
                                            <div className="space-y-4">
                                                <p className="text-red-600">Upload failed. Please try again.</p>
                                                <button
                                                    onClick={() => handleFileUpload(selectedFile)}
                                                    className="text-red-600 hover:text-red-700 underline"
                                                >
                                                    Retry Upload
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleFileUpload(selectedFile)}
                                                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
                                            >
                                                Upload Resume
                                                <ArrowRightIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {currentStep === 'background' && (
                            <motion.div
                                key="background"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
                            >
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                    Tell us about your background
                                </h2>

                                <div className="space-y-6 max-w-md mx-auto">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country of Origin *
                                        </label>
                                        <input
                                            type="text"
                                            value={userBackground.countryOfOrigin}
                                            onChange={(e) => setUserBackground(prev => ({ ...prev, countryOfOrigin: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="e.g., India, Philippines, Syria"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Target Role in Canada *
                                        </label>
                                        <input
                                            type="text"
                                            value={userBackground.targetRole}
                                            onChange={(e) => setUserBackground(prev => ({ ...prev, targetRole: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="e.g., Software Engineer, Data Scientist"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Years of Experience
                                        </label>
                                        <select
                                            value={userBackground.yearsOfExperience}
                                            onChange={(e) => setUserBackground(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        >
                                            <option value="">Select experience level</option>
                                            <option value="0-1">0-1 years</option>
                                            <option value="2-3">2-3 years</option>
                                            <option value="4-6">4-6 years</option>
                                            <option value="7-10">7-10 years</option>
                                            <option value="10+">10+ years</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => setCurrentStep('upload')}
                                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleBackgroundSubmit}
                                            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Start Analysis
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'complete' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
                            >
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Resumes</h2>

                                {isLoading ? (
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                    </div>
                                ) : resumes.length === 0 ? (
                                    <p className="text-gray-600 text-center">No resumes uploaded yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {resumes.map((resume) => (
                                            <div key={resume.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                                                <div>
                                                    <p className="font-medium">{resume.fileName}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Uploaded on {new Date(resume.uploadDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleSetActiveResume(resume.id)}
                                                        className={`px-3 py-1 rounded ${resume.isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {resume.isActive ? 'Active' : 'Set Active'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteResume(resume.id)}
                                                        className="px-3 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => setCurrentStep('upload')}
                                    className="mt-6 w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-colors"
                                >
                                    Upload Another Resume
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}