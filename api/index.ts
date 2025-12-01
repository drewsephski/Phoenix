import { UserProfile } from '../types';

/**
 * Client-side API functions that make HTTP requests to server-side routes
 * These functions are safe to call from the browser since they don't expose the API key
 */

export const analyzeInputFast = async (text: string): Promise<string[]> => {
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        throw new Error(`Failed to analyze input: ${response.status}`);
    }

    const data = await response.json();
    return data.tags;
};

export const generateFullProfile = async (
    name: string,
    role: string,
    rawText: string,
    linkedinUrl?: string,
    githubUrl?: string
): Promise<UserProfile> => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, role, rawText, linkedinUrl, githubUrl }),
    });

    if (!response.ok) {
        throw new Error(`Failed to generate profile: ${response.status}`);
    }

    return response.json();
};