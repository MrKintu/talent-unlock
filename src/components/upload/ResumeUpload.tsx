'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowUpTrayIcon,
    DocumentTextIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowRightIcon,
    GlobeAltIcon,
    BriefcaseIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { ResumeUpload as ResumeUploadType, UploadProgress } from '@/lib/types';

const ResumeUpload = () => {
    const router = useRouter();
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
        progress: 0,
        status: 'uploading'
    });
    const [userBackground, setUserBackground] = useState({
        countryOfOrigin: '',
        targetRole: '',
        yearsOfExperience: ''
    });
    const [currentStep, setCurrentStep] = useState<'upload' | 'background' | 'processing'>('upload');

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
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a PDF or Word document.');
            return;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size too large. Please upload a file smaller than 10MB.');
            return;
        }

        setSelectedFile(file);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleBackgroundSubmit = async () => {
        if (!selectedFile || !userBackground.countryOfOrigin || !userBackground.targetRole) {
            alert('Please fill in all required fields.');
            return;
        }

        setCurrentStep('processing');
        setUploadProgress({ progress: 0, status: 'uploading' });

        try {
            // Simulate upload progress
            for (let i = 0; i <= 100; i += 10) {
                setUploadProgress({ progress: i, status: 'uploading' });
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Create FormData for upload
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('userId', 'anonymous');

            // Upload file
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error('Upload failed');
            }

            const uploadResult = await uploadResponse.json();

            if (uploadResult.success) {
                setUploadProgress({ progress: 100, status: 'completed' });

                // Simulate analysis processing
                setTimeout(() => {
                    // Navigate to analysis page with mock ID
                    const analysisId = `analysis_${Date.now()}`;
                    router.push(`/analysis/${analysisId}`);
                }, 1000);
            } else {
                throw new Error(uploadResult.error || 'Upload failed');
            }

        } catch (error) {
            console.error('Upload error:', error);
            setUploadProgress({
                progress: 0,
                status: 'error',
                message: 'Upload failed. Please try again.'
            });
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
            <div className="container mx-auto px-6 pt-20 pb-16">
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
                    <div className="flex justify-center mb-12">
                        <div className="flex items-center space-x-4">
                            {[
                                { step: 'upload', label: 'Upload Resume', icon: ArrowUpTrayIcon },
                                { step: 'background', label: 'Background Info', icon: GlobeAltIcon },
                                { step: 'processing', label: 'AI Analysis', icon: BriefcaseIcon }
                            ].map((stepInfo, index) => (
                                <React.Fragment key={stepInfo.step}>
                                    <motion.div
                                        className={`flex flex-col items-center ${currentStep === stepInfo.step ? 'text-red-600' : 'text-gray-400'
                                            }`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.2 }}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${currentStep === stepInfo.step
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            <stepInfo.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-sm font-medium">{stepInfo.label}</span>
                                    </motion.div>
                                    {index < 2 && (
                                        <div className="w-8 h-0.5 bg-gray-300" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
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
                                        <button
                                            onClick={() => setCurrentStep('background')}
                                            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
                                        >
                                            Continue
                                            <ArrowRightIcon className="w-5 h-5" />
                                        </button>
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

                        {currentStep === 'processing' && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 text-center"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full mx-auto mb-6"
                                />

                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    {uploadProgress.status === 'completed' ? 'Analysis Complete!' : 'Analyzing Your Resume...'}
                                </h2>

                                <p className="text-gray-600 mb-6">
                                    {uploadProgress.status === 'completed'
                                        ? 'Your skills have been mapped to Canadian standards. Redirecting to results...'
                                        : 'Our AI is extracting your skills and mapping them to Canadian equivalents'
                                    }
                                </p>

                                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                                    <motion.div
                                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress.progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>

                                <p className="text-sm text-gray-500">
                                    {uploadProgress.progress}% complete
                                </p>

                                {uploadProgress.status === 'error' && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-red-600">
                                            <ExclamationCircleIcon className="w-5 h-5" />
                                            <span>{uploadProgress.message}</span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default ResumeUpload;