"use client";

import { AppState, UserProfile, Feedback, GeneratorInput } from '../types';
import { analyzeInputFast, generateFullProfile } from '../api';
import {
  getPortfolioHistory,
  savePortfolioToHistory,
  deletePortfolioFromHistory,
  generateReplyDraft,
  analyzeIncomingFeedback
} from '../utils';
import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import PortfolioView from '@/components/PortfolioView';
import ChatAgent from '@/components/ChatAgent';
import Dashboard from '@/components/Dashboard';
import FeaturesSection from '@/components/FeaturesSection';
import InputSection from '@/components/InputSection';
import DitherCanvas from '@/components/DitherCanvas';
import Footer from '@/components/Footer';
import SmoothAnchor from '@/components/SmoothAnchor';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';



const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<UserProfile[]>(() => getPortfolioHistory());
  const [showHistory, setShowHistory] = useState(false);

  // Check for shared portfolio on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');

    if (shareId) {
      // Load shared portfolio
      const loadSharedPortfolio = async () => {
        try {
          const response = await fetch(`/api/share?id=${shareId}`);
          const data = await response.json();

          if (data.success && data.profile) {
            setProfile(data.profile);
            setState(AppState.PREVIEW);
          }
        } catch (error) {
          console.error('Error loading shared portfolio:', error);
        }
      };

      loadSharedPortfolio();
    }
  }, []);

  // Simulated backend state for feedback
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(() => {
    const initialFeedback: Feedback = {
      id: 'demo-1',
      name: 'Phoenix',
      email: 'phoenix@example.com',
      message: 'I really love the minimalist aesthetic of your portfolio. Would you be interested in a freelance project for a fashion brand?',
      category: 'Work Opportunity',
      sentiment: 'Positive',
      timestamp: Date.now() - 86400000, // Set timestamp during initialization
      isRead: false
    };
    return [initialFeedback];
  });

  // History is now initialized lazily, no need for useEffect

  const { scrollToTop } = useSmoothScroll();

  const handleStart = () => {
    setState(AppState.BUILDING);
    // Use smooth scrolling
    scrollToTop();
  };

  const handleGenerate = async (data: GeneratorInput) => {
    setIsProcessing(true);
    try {
      // 1. First, do a quick analysis using Flash Lite to show we are extracting data
      const tags = await analyzeInputFast(data.rawText);
      console.log('Fast extracted tags:', tags);

      // 2. Generate the full profile using Flash, now with social URLs
      const generatedProfile = await generateFullProfile(
        data.fullName,
        data.currentRole,
        data.rawText,
        data.linkedinUrl,
        data.githubUrl
      );
      setProfile(generatedProfile);

      // Save to local storage
      savePortfolioToHistory(generatedProfile);

      // Artificial delay for UX "Processing" feel
      setTimeout(() => {
        setState(AppState.PREVIEW);
        setIsProcessing(false);
      }, 800);

    } catch (error) {
      console.error(error);
      alert("Failed to generate portfolio. Please check your API key and try again.");
      setIsProcessing(false);
    }
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    savePortfolioToHistory(updated);
    // Update local history state immediately to reflect changes if we go back
    setHistory(prev => [updated, ...prev.filter(p => p.id !== updated.id)]);
  };

  const handleShare = async () => {
    // Copy current URL to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy URL to clipboard:', error);
    }
  };

  const handleLoadFromHistory = (p: UserProfile) => {
    setProfile(p);
    setState(AppState.PREVIEW);
    setShowHistory(false);
    // Use smooth scrolling
    scrollToTop();
  };

  const handleDeleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deletePortfolioFromHistory(id);
    setHistory(prev => prev.filter(p => p.id !== id));
  };

  const handleFeedbackSubmit = async (name: string, email: string, message: string) => {
    // Immediate optimistic update with 'Pending' status could happen here, 
    // but we'll wait for the fast AI analysis
    const analysis = await analyzeIncomingFeedback(message);

    const newFeedback: Feedback = {
      id: Date.now().toString(),
      name,
      email,
      message,
      category: analysis.category,
      sentiment: analysis.sentiment,
      timestamp: Date.now(),
      isRead: false
    };

    setFeedbackList(prev => [newFeedback, ...prev]);
  };

  const handleGenerateReply = async (feedbackId: string) => {
    const feedback = feedbackList.find(f => f.id === feedbackId);
    if (!feedback || !profile) return;

    const draft = await generateReplyDraft(feedback, profile.name);

    setFeedbackList(prev => prev.map(f =>
      f.id === feedbackId ? { ...f, aiResponseDraft: draft } : f
    ));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-white selection:text-black">
      <div className="dither-overlay fixed inset-0 w-full h-full pointer-events-none z-50 mix-blend-overlay opacity-30"></div>

      {state !== AppState.PREVIEW && state !== AppState.DASHBOARD && <DitherCanvas />}

      <main className="relative z-10">
        {state === AppState.LANDING && (
          <div className="min-h-screen flex flex-col">

            {/* Archive / History Drawer Toggle */}
            {!showHistory && (
              <div className="fixed top-6 sm:top-8 right-4 sm:right-8 z-50">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-2 touch-manipulation py-2 px-3 sm:px-0"
                >
                  <span className={`w-2 h-2 rounded-full ${history.length > 0 ? 'bg-green-500' : 'bg-gray-800'}`}></span>
                  <span className="hidden sm:inline">Saved Portfolios</span>
                  <span className="sm:hidden">Saved</span>
                </button>
              </div>
            )}

            {/* Archive Drawer */}
            {showHistory && (
              <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#0a0a0a] border-l border-gray-800 shadow-2xl z-40 p-6 sm:p-8 animate-fade-in flex flex-col">
                <div className="flex justify-between items-center mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-light display-font">Your Archives</h2>
                  <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white touch-manipulation py-2 px-3">Close</button>
                </div>
                <div className="space-y-4 overflow-y-auto flex-1">
                  {history.length === 0 ? (
                    <p className="text-gray-600 text-sm font-mono">No archives found.</p>
                  ) : (
                    history.map(p => (
                      <div key={p.id} onClick={() => handleLoadFromHistory(p)} className="group p-4 border border-gray-800 hover:bg-white/5 cursor-pointer transition-colors relative touch-manipulation">
                        <h3 className="text-white font-medium mb-1">{p.name}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{p.title}</p>
                        <p className="text-xs text-gray-600 font-mono">{new Date(p.generatedAt).toLocaleDateString()}</p>

                        <button
                          onClick={(e) => handleDeleteHistoryItem(e, p.id)}
                          className="absolute top-4 right-4 text-gray-700 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation p-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-center" id="start">
              <div className="mb-4 sm:mb-6 animate-fade-in">
                <span className="text-xs uppercase tracking-[-.03em] text-gray-400 border border-gray-800 px-2 sm:px-3 py-1 rounded-full">
                  AI Linktree Alternative
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-9xl font-light mb-6 sm:mb-8 tracking-tight display-font bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 animate-slide-up">
                Phoenix
              </h1>
              <p className="max-w-xl text-gray-400 text-base sm:text-lg md:text-xl font-light mb-8 sm:mb-12 leading-relaxed animate-slide-up-delayed px-4">
                Turn your social profiles and resume into a stunning professional hub in seconds. No coding required.
              </p>
              <div className="animate-fade-in-delayed">
                <Button onClick={handleStart}>
                  Create My Hub
                </Button>
              </div>

              {/* Mini Brutalist Navigation Buttons */}
              <div className="animate-fade-in-delayed mt-8">
                <nav className="flex gap-3 justify-center">
                  <SmoothAnchor
                    href="#features"
                    offset={20}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-mono uppercase tracking-widest border-2 border-gray-600 bg-gray-800 text-gray-300 hover:bg-white hover:text-black hover:border-white transition-all duration-200 ease-in-out transform hover:translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:-translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                  >
                    Features
                  </SmoothAnchor>
                  <SmoothAnchor
                    href="#how-it-works"
                    offset={20}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-mono uppercase tracking-widest border-2 border-gray-600 bg-gray-800 text-gray-300 hover:bg-white hover:text-black hover:border-white transition-all duration-200 ease-in-out transform hover:translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:-translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                  >
                    How It Works
                  </SmoothAnchor>
                </nav>
              </div>

              <div className="absolute bottom-10 animate-bounce opacity-50 hidden sm:block">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                </svg>
              </div>
            </div>

            <FeaturesSection onStart={handleStart} />
          </div>
        )}

        {state === AppState.BUILDING && (
          <div className="min-h-screen flex flex-col items-center justify-center">
            <button
              onClick={() => setState(AppState.LANDING)}
              className="absolute top-6 sm:top-8 left-4 sm:left-8 text-gray-500 hover:text-white transition-colors text-sm uppercase tracking-widest touch-manipulation py-2 px-3 sm:px-0"
            >
              ← Back
            </button>
            <InputSection onSubmit={handleGenerate} isProcessing={isProcessing} />
          </div>
        )}

        {state === AppState.PREVIEW && profile && (
          <div className="animate-fade-in">
            <PortfolioView
              profile={profile}
              onOpenDashboard={() => setState(AppState.DASHBOARD)}
              onFeedbackSubmit={handleFeedbackSubmit}
              onUpdateProfile={handleUpdateProfile}
            />
            <ChatAgent profile={profile} />

            <div className="fixed bottom-6 sm:bottom-8 left-4 sm:left-8 z-50">
              <Button variant="secondary" onClick={() => setState(AppState.LANDING)} className="!bg-[#050505]/80 backdrop-blur-md !px-3 sm:!px-4 !py-2 !text-xs">
                Exit Preview
              </Button>
            </div>
          </div>
        )}

        {state === AppState.DASHBOARD && profile && (
          <div className="animate-fade-in">
            <Dashboard
              profile={profile}
              feedbackList={feedbackList}
              onGenerateReply={handleGenerateReply}
              onExit={() => setState(AppState.PREVIEW)}
              history={history}
            />
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-fade-in-delayed { animation: fade-in 1s ease-out 0.6s forwards; opacity: 0; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        .animate-slide-up-delayed { animation: slide-up 0.8s ease-out 0.3s forwards; opacity: 0; }
        .animate-fade-in-up { animation: slide-up 0.6s ease-out forwards; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default App;