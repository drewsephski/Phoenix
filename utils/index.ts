import { UserProfile, Feedback } from '@/types';
import { generateReplyDraft as geminiGenerateReplyDraft, analyzeIncomingFeedback as geminiAnalyzeFeedback } from '@/services/geminiService';

// Local storage keys
const STORAGE_KEYS = {
    PORTFOLIO_HISTORY: 'portfolio_history',
    FEEDBACK_LIST: 'feedback_list'
} as const;

/**
 * Saves a portfolio to local storage history
 */
export const savePortfolioToHistory = (profile: UserProfile): void => {
    try {
        if (typeof window === 'undefined') return;

        const history = getPortfolioHistory();
        const existingIndex = history.findIndex(p => p.id === profile.id);

        if (existingIndex > -1) {
            // Update existing
            history[existingIndex] = profile;
        } else {
            // Add new to beginning
            history.unshift(profile);
        }

        // Keep only last 10 entries
        const limitedHistory = history.slice(0, 10);

        localStorage.setItem(STORAGE_KEYS.PORTFOLIO_HISTORY, JSON.stringify(limitedHistory));
    } catch (error) {
        console.error('Failed to save portfolio to history:', error);
    }
};

/**
 * Retrieves portfolio history from local storage
 */
export const getPortfolioHistory = (): UserProfile[] => {
    try {
        if (typeof window === 'undefined') return [];

        const stored = localStorage.getItem(STORAGE_KEYS.PORTFOLIO_HISTORY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Failed to load portfolio history:', error);
        return [];
    }
};

/**
 * Deletes a portfolio from local storage history
 */
export const deletePortfolioFromHistory = (id: string): void => {
    try {
        if (typeof window === 'undefined') return;

        const history = getPortfolioHistory();
        const filtered = history.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.PORTFOLIO_HISTORY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Failed to delete portfolio from history:', error);
    }
};

/**
 * Generates a reply draft using the gemini service
 */
export const generateReplyDraft = async (
    feedback: Feedback,
    ownerName: string
): Promise<string> => {
    return geminiGenerateReplyDraft(feedback, ownerName);
};

/**
 * Analyzes incoming feedback using the gemini service
 */
export const analyzeIncomingFeedback = async (text: string) => {
    return geminiAnalyzeFeedback(text);
};