'use client';

import { UserProfile } from '@/lib/types';

interface BasicInfoProps {
    profile: UserProfile;
    isEditing: boolean;
    onUpdate: (updates: Partial<UserProfile>) => void;
}

export default function BasicInfo({ profile, isEditing, onUpdate }: BasicInfoProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country of Origin
                </label>
                {isEditing ? (
                    <input
                        type="text"
                        value={profile.countryOfOrigin || ''}
                        onChange={e => onUpdate({ countryOfOrigin: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                ) : (
                    <p className="text-gray-800">{profile.countryOfOrigin}</p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Role
                </label>
                {isEditing ? (
                    <input
                        type="text"
                        value={profile.targetRole || ''}
                        onChange={e => onUpdate({ targetRole: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                ) : (
                    <p className="text-gray-800">{profile.targetRole}</p>
                )}
            </div>
        </div>
    );
} 