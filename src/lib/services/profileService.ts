import { UserProfile } from '@/lib/types';

export interface ProfileResponse {
    success: boolean;
    data: UserProfile;
    message?: string;
}

class ProfileService {
    async getProfile(token: string): Promise<ProfileResponse> {
        const response = await fetch('/api/background', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.json();
    }

    async updateProfile(token: string, profile: Partial<UserProfile>): Promise<ProfileResponse> {
        const response = await fetch('/api/background', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profile)
        });

        return response.json();
    }
}

export const profileService = new ProfileService(); 