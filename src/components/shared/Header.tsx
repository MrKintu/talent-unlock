'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import LoginButton from '../auth/LoginButton';
import UserProfile from '../auth/UserProfile';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Header() {
    const { user, loading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-sm shadow-sm">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-red-600">
                        TalentUnlock
                    </Link>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-gray-600 hover:text-gray-900"
                    >
                        {isOpen ? (
                            <XMarkIcon className="h-6 w-6" />
                        ) : (
                            <Bars3Icon className="h-6 w-6" />
                        )}
                    </button>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/upload" className="text-gray-600 hover:text-red-600 transition-colors">
                            Upload Resume
                        </Link>
                        <Link href="/browse-jobs" className="text-gray-600 hover:text-red-600 transition-colors">
                            Browse Jobs
                        </Link>
                        {!loading && (
                            <div>
                                {user ? <UserProfile /> : <LoginButton />}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} pt-4`}>
                    <div className="flex flex-col space-y-4">
                        <Link
                            href="/upload"
                            className="text-gray-600 hover:text-red-600 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Upload Resume
                        </Link>
                        <Link
                            href="/browse-jobs"
                            className="text-gray-600 hover:text-red-600 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Browse Jobs
                        </Link>
                        {!loading && (
                            <div>
                                {user ? <UserProfile /> : <LoginButton />}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
