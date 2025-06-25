import { UserProfile } from '../types';

export interface ProfileResponse {
    success: boolean;
    data?: UserProfile;
    message?: string;
    error?: string;
}

class ProfileService {
    async getProfile(token: string): Promise<ProfileResponse> {
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.json();
    }

    async updateProfile(token: string, profile: Partial<UserProfile>): Promise<ProfileResponse> {
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profile)
        });

        return response.json();
    }

    async updateSocialLinks(token: string, socialLinks: UserProfile['socialLinks']): Promise<ProfileResponse> {
        const response = await fetch('/api/profile/social', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ socialLinks })
        });

        return response.json();
    }

    async updateSkills(token: string, skills: UserProfile['skills']): Promise<ProfileResponse> {
        const response = await fetch('/api/profile/skills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ skills })
        });

        return response.json();
    }

    async updateGoals(token: string, goals: UserProfile['goals']): Promise<ProfileResponse> {
        const response = await fetch('/api/profile/goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ goals })
        });

        return response.json();
    }
}

export const profileService = new ProfileService(); 