export interface Project {
    title: string;
    description: string;
    technologies: string[];
    link?: string; // Added link for Linktree functionality
}

export interface UserProfile {
    id: string;
    name: string;
    title: string;
    bio: string;
    skills: string[];
    projects: Project[];
    githubUrl?: string;
    linkedinUrl?: string;
    generatedAt: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}

export interface Feedback {
    id: string;
    name: string;
    email: string;
    message: string;
    category: string;
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    timestamp: number;
    aiResponseDraft?: string;
    isRead: boolean;
}

export enum AppState {
    LANDING,
    BUILDING,
    PREVIEW,
    DASHBOARD
}

export interface GeneratorInput {
    fullName: string;
    currentRole: string;
    rawText: string;
    linkedinUrl?: string;
    githubUrl?: string;
}