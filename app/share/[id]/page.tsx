"use client";

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/types';
import PortfolioView from '@/components/PortfolioView';
import Button from '@/components/Button';
import Footer from '@/components/Footer';

import { use } from 'react';

interface SharePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function SharePage({ params }: SharePageProps) {
    const { id } = use(params);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/share?id=${id}`);
                const data = await response.json();

                if (data.success && data.profile) {
                    setProfile(data.profile);
                } else {
                    setError(data.error || 'Portfolio not found');
                }
            } catch (err) {
                console.error('Error fetching shared portfolio:', err);
                setError('Failed to load portfolio');
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="text-center">
                    <div className="text-gray-400 mb-4">Loading portfolio...</div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="text-center">
                    <div className="text-red-400 mb-4">Portfolio not found</div>
                    <Button onClick={() => window.location.href = '/'}>
                        Return Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505]">
            <PortfolioView
                profile={profile}
                onOpenDashboard={() => { }} // Disable dashboard in shared view
                onFeedbackSubmit={(name, email, message) => {
                    // In shared view, you might want to handle feedback differently
                    console.log('Feedback from shared view:', { name, email, message });
                }}
                onUpdateProfile={() => { }} // Disable editing in shared view
            />
            <Footer />
        </div>
    );
}