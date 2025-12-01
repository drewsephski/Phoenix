import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/types';

// In-memory storage for shared portfolios (in production, use a database)
const sharedPortfolios = new Map<string, UserProfile>();

export async function POST(request: NextRequest) {
    try {
        const profile: UserProfile = await request.json();

        // Generate a unique share ID
        const shareId = generateShareId();

        // Store the portfolio with the share ID
        sharedPortfolios.set(shareId, profile);

        // Return the shareable URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const shareUrl = `${baseUrl}/share/${shareId}`;

        return NextResponse.json({
            success: true,
            shareId,
            shareUrl,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        });
    } catch (error) {
        console.error('Error sharing portfolio:', error);
        return NextResponse.json({ success: false, error: 'Failed to share portfolio' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const shareId = searchParams.get('id');

        if (!shareId) {
            return NextResponse.json({ success: false, error: 'Share ID is required' }, { status: 400 });
        }

        const profile = sharedPortfolios.get(shareId);

        if (!profile) {
            return NextResponse.json({ success: false, error: 'Portfolio not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error('Error fetching shared portfolio:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch portfolio' }, { status: 500 });
    }
}

// Helper function to generate a unique share ID
function generateShareId(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}