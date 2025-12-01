import { UserProfile } from '../types';

/**
 * Share a portfolio and get a shareable URL
 * @param profile The portfolio profile to share
 * @returns Promise with share URL or null if failed
 */
export async function sharePortfolio(profile: UserProfile): Promise<string | null> {
    try {
        const response = await fetch('/api/share', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profile),
        });

        const data = await response.json();

        if (data.success && data.shareUrl) {
            return data.shareUrl;
        }

        return null;
    } catch (error) {
        console.error('Error sharing portfolio:', error);
        return null;
    }
}

/**
 * Copy text to clipboard with fallback
 * @param text The text to copy
 * @returns Promise indicating success
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
    }
}

/**
 * Generate a shareable URL for a portfolio
 * @param shareId The share ID from the API
 * @returns Full shareable URL
 */
export function generateShareUrl(shareId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    return `${baseUrl}/share/${shareId}`;
}

/**
 * Extract share ID from URL
 * @param url The URL to extract from
 * @returns Share ID or null
 */
export function extractShareId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const shareIndex = pathParts.indexOf('share');

        if (shareIndex !== -1 && pathParts[shareIndex + 1]) {
            return pathParts[shareIndex + 1];
        }

        // Check query parameter as fallback
        return urlObj.searchParams.get('share');
    } catch (error) {
        return null;
    }
}