export interface ResumeUploadResponse {
    success: boolean;
    data: {
        fileUrl: string;
        fileName: string;
        uploadDate: any;
        id: string;
    };
    message?: string;
    error?: string;
}

export interface ResumeListResponse {
    success: boolean;
    data: Array<{
        id: string;
        fileName: string;
        fileUrl: string;
        uploadDate: any;
    }>;
    message?: string;
    error?: string;
}

class ResumeService {
    async uploadResume(token: string, file: File): Promise<ResumeUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        return response.json();
    }

    async listResumes(token: string): Promise<ResumeListResponse> {
        const response = await fetch('/api/resumes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.json();
    }

    async deleteResume(token: string, resumeId: string): Promise<{ success: boolean; message?: string; error?: string }> {
        const response = await fetch('/api/resumes', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ resumeId })
        });

        return response.json();
    }

    async analyzeResume(token: string, resumeId: string): Promise<{ success: boolean; message?: string; error?: string }> {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ resumeId })
        });

        return response.json();
    }
}

export const resumeService = new ResumeService(); 