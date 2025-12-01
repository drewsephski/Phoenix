import React, { useState } from 'react';
import Image from 'next/image';
import Button from './Button';
import Card from './Card';
import { GeneratorInput } from '../types';
import { GithubProfile, LinkedInProfile } from '@/app/lib/types';

interface InputSectionProps {
  onSubmit: (data: GeneratorInput) => void;
  isProcessing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onSubmit, isProcessing }) => {
  const [formData, setFormData] = useState<GeneratorInput>({
    fullName: '',
    currentRole: '',
    rawText: '',
    linkedinUrl: '',
    githubUrl: ''
  });

  // Import states
  const [githubImportUrl, setGithubImportUrl] = useState('');
  const [linkedinImportUrl, setLinkedinImportUrl] = useState('');
  const [isImportingLinkedIn, setIsImportingLinkedIn] = useState(false);
  const [isImportingGitHub, setIsImportingGitHub] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFillDemo = () => {
    setFormData({
      fullName: 'Phoenix',
      currentRole: 'Senior Creative Technologist',
      linkedinUrl: 'https://linkedin.com/in/phoenixthecat',
      githubUrl: 'https://github.com/phoenixthecat',
      rawText: 'Over 8 years of experience merging design and engineering. Specialized in WebGL, React, and generative AI. Led the frontend architecture for a Series B fintech startup. Won Site of the Day on Awwwards twice. Passionate about minimalism and performance. Currently exploring LLM integration in creative workflows.'
    });
  };

  const handleClearForm = () => {
    setFormData({
      fullName: '',
      currentRole: '',
      rawText: '',
      linkedinUrl: '',
      githubUrl: ''
    });
    setGithubImportUrl('');
    setLinkedinImportUrl('');
    setImportError(null);
    setImportSuccess(null);
  };

  const handleImportGitHub = async () => {
    if (!githubImportUrl) {
      setImportError('Please provide a GitHub URL');
      return;
    }

    setIsImportingGitHub(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      const response = await fetch('/api/ingest/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: githubImportUrl })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import GitHub profile');
      }

      const profile: GithubProfile = await response.json();

      // Auto-fill form with imported data
      setFormData(prev => ({
        ...prev,
        fullName: profile.name || prev.fullName,
        githubUrl: profile.url,
        rawText: prev.rawText + (prev.rawText ? '\n\n' : '') +
          `GitHub Profile (@${profile.username}):\n` +
          `${profile.bio || ''}\n` +
          `${profile.location ? `Location: ${profile.location}\n` : ''}` +
          `${profile.followers} followers • ${profile.publicReposCount} public repos • ${profile.totalStars} total stars\n` +
          `Languages: ${Object.keys(profile.languages).slice(0, 5).join(', ')}\n` +
          `Top Projects: ${profile.topReposByStars.slice(0, 3).map(r => r.name).join(', ')}`
      }));

      setImportSuccess('GitHub profile imported successfully!');
      setGithubImportUrl('');
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import GitHub profile');
    } finally {
      setIsImportingGitHub(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 animate-fade-in-up sm:max-w-xl md:max-w-2xl mt-24">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-3 sm:mb-4 text-white display-font px-4">Create Your Aura</h2>
        <p className="text-gray-400 text-base sm:text-lg font-light max-w-lg mx-auto px-4">
          The professional link-in-bio for the AI era. Share your profile, projects, and socials in one stunning view.
        </p>
      </div>


      {/* Import Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Import from LinkedIn */}
        <Card className="p-4 sm:p-6 max-w-sm" hoverEffect={false}>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <h3 className="text-base sm:text-lg font-medium text-white">Import from LinkedIn</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <input
              type="url"
              value={linkedinImportUrl}
              onChange={e => setLinkedinImportUrl(e.target.value)}
              className="w-full bg-black/20 border border-gray-700 px-3 py-2.5 sm:py-2 text-sm text-gray-300 focus:border-blue-400 focus:outline-none transition-colors rounded"
              placeholder="LinkedIn profile URL"
              disabled={isImportingLinkedIn}
            />
            <div className="text-xs text-gray-500 space-y-1">
              <p>✓ Automatically fetches your information</p>
              <p>✓ Auto import your LinkedIn profile</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!linkedinImportUrl) {
                  setImportError('Please provide a LinkedIn URL');
                  return;
                }

                setIsImportingLinkedIn(true);
                setImportError(null);
                setImportSuccess(null);

                try {
                  const response = await fetch('/api/ingest/linkedin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: linkedinImportUrl, text: '' })
                  });

                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to import LinkedIn profile');
                  }

                  const profile: LinkedInProfile = await response.json();

                  // Auto-fill form with imported data
                  setFormData(prev => ({
                    ...prev,
                    fullName: profile.name || prev.fullName,
                    currentRole: profile.currentRole || prev.currentRole,
                    linkedinUrl: profile.url,
                    rawText: prev.rawText + (prev.rawText ? '\n\n' : '') +
                      `LinkedIn Profile:\n` +
                      `${profile.headline || ''}\n` +
                      `${profile.currentRole ? `Current: ${profile.currentRole}` : ''}${profile.currentCompany ? ` at ${profile.currentCompany}` : ''}\n` +
                      `${profile.location ? `Location: ${profile.location}\n` : ''}` +
                      `${profile.skills.length > 0 ? `Skills: ${profile.skills.join(', ')}\n` : ''}` +
                      `${profile.education.length > 0 ? `Education: ${profile.education.map(e => e.institution).join(', ')}` : ''}`
                  }));

                  setImportSuccess('LinkedIn profile imported successfully!');
                  setLinkedinImportUrl('');
                } catch (error) {
                  setImportError(error instanceof Error ? error.message : 'Failed to import LinkedIn profile');
                } finally {
                  setIsImportingLinkedIn(false);
                }
              }}
              disabled={isImportingLinkedIn || !linkedinImportUrl}
              className="w-full bg-blue-500/10 hover:bg-blue-500/20 active:bg-blue-500/30 border border-blue-500/30 text-blue-400 py-3 sm:py-2 px-4 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded touch-manipulation"
            >
              {isImportingLinkedIn ? 'Importing...' : 'Import LinkedIn Data'}
            </button>
          </div>
        </Card>

        {/* Import from GitHub */}
        <Card className="p-4 sm:p-6 max-w-sm" hoverEffect={false}>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <h3 className="text-base sm:text-lg font-medium text-white">Import from GitHub</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <input
              type="text"
              value={githubImportUrl}
              onChange={e => setGithubImportUrl(e.target.value)}
              className="w-full bg-black/20 border border-gray-700 px-3 py-2.5 sm:py-2 text-sm text-gray-300 focus:border-purple-400 focus:outline-none transition-colors rounded"
              placeholder="GitHub username (e.g., phoenixthecat)"
              disabled={isImportingGitHub}
            />
            <div className="text-xs text-gray-500 space-y-1">
              <p>✓ Automatically fetches your repos and stars</p>
              <p>✓ No manual copy-paste required</p>
            </div>
            <button
              type="button"
              onClick={handleImportGitHub}
              disabled={isImportingGitHub || !githubImportUrl}
              className="w-full bg-purple-500/10 hover:bg-purple-500/20 active:bg-purple-500/30 border border-purple-500/30 text-purple-400 py-3 sm:py-2 px-4 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded touch-manipulation"
            >
              {isImportingGitHub ? 'Importing...' : 'Import GitHub Data'}
            </button>
          </div>
        </Card>
      </div>

      {/* Status Messages */}
      {importError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {importError}
        </div>
      )}
      {importSuccess && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          {importSuccess}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 backdrop-blur-sm bg-white/5 p-4 sm:p-6 md:p-8 border border-white/10 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500">Full Name</label>
            <input
              required
              type="text"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-transparent border-b border-gray-700 py-2 text-lg sm:text-xl text-white focus:border-white focus:outline-none transition-colors placeholder-gray-800"
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500">Current Role</label>
            <input
              required
              type="text"
              value={formData.currentRole}
              onChange={e => setFormData({ ...formData, currentRole: e.target.value })}
              className="w-full bg-transparent border-b border-gray-700 py-2 text-lg sm:text-xl text-white focus:border-white focus:outline-none transition-colors placeholder-gray-800"
              placeholder="e.g. Product Designer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500">LinkedIn URL <span className="text-gray-600 normal-case">(Optional)</span></label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="w-full bg-transparent border-b border-gray-700 py-2 text-sm sm:text-base text-gray-300 focus:border-white focus:outline-none transition-colors placeholder-gray-800"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500">GitHub URL <span className="text-gray-600 normal-case">(Optional)</span></label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
              className="w-full bg-transparent border-b border-gray-700 py-2 text-sm sm:text-base text-gray-300 focus:border-white focus:outline-none transition-colors placeholder-gray-800"
              placeholder="https://github.com/..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-gray-500">
            About You
            <span className="ml-2 text-gray-600 normal-case tracking-normal">(Paste your Bio or Resume Summary)</span>
          </label>
          <textarea
            required
            rows={6}
            value={formData.rawText}
            onChange={e => setFormData({ ...formData, rawText: e.target.value })}
            className="w-full bg-black/20 border border-gray-700 p-3 sm:p-4 text-sm sm:text-base text-gray-300 focus:border-white focus:outline-none transition-colors resize-none rounded"
            placeholder="I have 5 years of experience in..."
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs text-gray-500 hover:text-gray-300 active:text-white transition-colors uppercase tracking-widest touch-manipulation py-2"
            >
              Use Demo Data
            </button>
            <button
              type="button"
              onClick={handleClearForm}
              className="text-xs text-gray-500 hover:text-gray-300 active:text-white transition-colors uppercase tracking-widest touch-manipulation py-2"
            >
              Clear
            </button>
          </div>

          <Button type="submit" isLoading={isProcessing} className="w-full sm:w-auto">
            Generate Site
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InputSection;