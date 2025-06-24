'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
    AcademicCapIcon,
    BriefcaseIcon,
    TrophyIcon,
    LinkIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<UserProfile>({
        userId: '',
        countryOfOrigin: '',
        targetRole: '',
        yearsOfExperience: '',
        updatedAt: new Date(),
        socialLinks: {},
        skills: [],
        goals: [],
        achievements: []
    });

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/background', {
                headers: {
                    'Authorization': `Bearer ${await user?.getIdToken()}`
                }
            });
            const data = await response.json();
            console.log(`debug: data`, data);
            if (data.success) {
                setProfile({
                    ...data.data,
                    skills: data.data.skills || [],
                    goals: data.data.goals || [],
                    achievements: data.data.achievements || [],
                    socialLinks: data.data.socialLinks || {}
                });
                setEditedProfile({
                    ...data.data,
                    skills: data.data.skills || [],
                    goals: data.data.goals || [],
                    achievements: data.data.achievements || [],
                    socialLinks: data.data.socialLinks || {}
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Redirect if not authenticated
    if (!authLoading && !user) {
        router.push('/');
        return null;
    }

    // Fetch profile data when user is authenticated
    if (!authLoading && user && !profile && !isLoading) {
        fetchProfile();
    }

    const handleSave = async () => {
        try {
            const response = await fetch('/api/background', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user?.getIdToken()}`
                },
                body: JSON.stringify({
                    ...editedProfile,
                    userId: user?.uid
                })
            });
            const data = await response.json();
            if (data.success) {
                setProfile(data.data);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    };

    const handleAddSkill = () => {
        setEditedProfile(prev => ({
            ...prev,
            skills: [
                ...(prev.skills || []),
                { name: '', proficiency: 'beginner', endorsements: 0 }
            ]
        }));
    };

    const handleRemoveSkill = (index: number) => {
        setEditedProfile(prev => ({
            ...prev,
            skills: prev.skills?.filter((_, i) => i !== index) || []
        }));
    };

    // Show loading state
    if (authLoading || isLoading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            </div>
        );
    }

    // Now we know profile is not null
    const displayData = {
        ...(isEditing ? editedProfile : profile),
        skills: (isEditing ? editedProfile : profile).skills || [],
        goals: (isEditing ? editedProfile : profile).goals || [],
        achievements: (isEditing ? editedProfile : profile).achievements || []
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            {isEditing ? (
                                <>Save Changes</>
                            ) : (
                                <>
                                    <PencilIcon className="w-5 h-5" />
                                    Edit Profile
                                </>
                            )}
                        </button>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country of Origin
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedProfile.countryOfOrigin || ''}
                                    onChange={e => setEditedProfile(prev => ({
                                        ...prev,
                                        countryOfOrigin: e.target.value
                                    }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-800">{profile?.countryOfOrigin}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Role
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedProfile.targetRole || ''}
                                    onChange={e => setEditedProfile(prev => ({
                                        ...prev,
                                        targetRole: e.target.value
                                    }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-800">{profile?.targetRole}</p>
                            )}
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Social Links</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['github', 'linkedin', 'portfolio'].map((platform) => (
                                <div key={platform}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                        {platform}
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            value={editedProfile.socialLinks?.[platform as keyof typeof editedProfile.socialLinks] || ''}
                                            onChange={e => setEditedProfile(prev => ({
                                                ...prev,
                                                socialLinks: {
                                                    ...(prev.socialLinks || {}),
                                                    [platform]: e.target.value
                                                }
                                            }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder={`Enter your ${platform} URL`}
                                        />
                                    ) : (
                                        <a
                                            href={profile?.socialLinks?.[platform as keyof typeof profile.socialLinks]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-red-600 hover:text-red-700 flex items-center gap-2"
                                        >
                                            <LinkIcon className="w-4 h-4" />
                                            {profile?.socialLinks?.[platform as keyof typeof profile.socialLinks] || 'Not set'}
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
                            {isEditing && (
                                <button
                                    onClick={handleAddSkill}
                                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Add Skill
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {displayData.skills.map((skill, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg shadow">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={skill.name}
                                                onChange={e => {
                                                    const newSkills = [...(editedProfile.skills || [])];
                                                    newSkills[index] = { ...skill, name: e.target.value };
                                                    setEditedProfile(prev => ({ ...prev, skills: newSkills }));
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="Skill name"
                                            />
                                            <select
                                                value={skill.proficiency}
                                                onChange={e => {
                                                    const newSkills = [...(editedProfile.skills || [])];
                                                    newSkills[index] = {
                                                        ...skill,
                                                        proficiency: e.target.value as any
                                                    };
                                                    setEditedProfile(prev => ({ ...prev, skills: newSkills }));
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            >
                                                <option value="beginner">Beginner</option>
                                                <option value="intermediate">Intermediate</option>
                                                <option value="advanced">Advanced</option>
                                                <option value="expert">Expert</option>
                                            </select>
                                            <button
                                                onClick={() => handleRemoveSkill(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="font-medium text-gray-800">{skill.name}</h3>
                                            <p className="text-sm text-gray-600 capitalize">{skill.proficiency}</p>
                                            {(skill.endorsements ?? 0) > 0 && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {skill.endorsements} endorsements
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Goals and Achievements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Goals */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <BriefcaseIcon className="w-6 h-6 text-red-600" />
                                Goals
                            </h2>
                            <div className="space-y-4">
                                {displayData.goals.map(goal => (
                                    <motion.div
                                        key={goal.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white p-4 rounded-lg shadow"
                                    >
                                        <h3 className="font-medium text-gray-800">{goal.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-red-600 h-2 rounded-full"
                                                    style={{ width: `${goal.progress || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Achievements */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <TrophyIcon className="w-6 h-6 text-red-600" />
                                Achievements
                            </h2>
                            <div className="space-y-4">
                                {displayData.achievements.map(achievement => (
                                    <motion.div
                                        key={achievement.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white p-4 rounded-lg shadow"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`
                                                w-12 h-12 rounded-full flex items-center justify-center
                                                ${achievement.level === 'gold' ? 'bg-yellow-100 text-yellow-600' :
                                                    achievement.level === 'silver' ? 'bg-gray-100 text-gray-600' :
                                                        achievement.level === 'bronze' ? 'bg-orange-100 text-orange-600' :
                                                            'bg-purple-100 text-purple-600'}
                                            `}>
                                                <TrophyIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-800">{achievement.title}</h3>
                                                <p className="text-sm text-gray-600">{achievement.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 