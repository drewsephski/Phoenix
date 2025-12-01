/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { UserProfile, Project } from '../types';
import FeedbackForm from './FeedbackForm';
import Button from './Button';
import Card from './Card';
import { motion } from 'framer-motion';
import { sharePortfolio, copyToClipboard } from '../utils/portfolioSharing';

interface PortfolioViewProps {
  profile: UserProfile;
  onOpenDashboard: () => void;
  onFeedbackSubmit: (name: string, email: string, message: string) => void;
  onUpdateProfile: (updated: UserProfile) => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ profile, onOpenDashboard, onFeedbackSubmit, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setLocalProfile(profile);
    }
  }, [profile, isEditing]);

  const handleSave = () => {
    onUpdateProfile(localProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalProfile(profile);
    setIsEditing(false);
  };

  // Removed handleShare function since we're only using the export/share functionality

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const shareUrl = await sharePortfolio(localProfile);

      if (shareUrl) {
        // Copy the share URL to clipboard
        await copyToClipboard(shareUrl);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      } else {
        alert('Failed to export portfolio. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting portfolio:', error);
      alert('Failed to export portfolio. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleProjectUpdate = (index: number, field: keyof Project, value: Project[keyof Project]) => {
    const newProjects = [...localProfile.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setLocalProfile({ ...localProfile, projects: newProjects });
  };

  const handleDeleteProject = (index: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const newProjects = localProfile.projects.filter((_, i) => i !== index);
      setLocalProfile({ ...localProfile, projects: newProjects });
    }
  };

  const handleSkillUpdate = (newSkillsStr: string) => {
    const skills = newSkillsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    setLocalProfile({ ...localProfile, skills });
  };

  const editableInputBase = "bg-white/5 border-b border-dashed border-gray-600 focus:border-white focus:bg-white/10 outline-none transition-colors rounded-sm px-2";

  return (
    <div className="w-full min-h-screen bg-[#050505] text-gray-200 relative z-10">

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-6 py-2 rounded-full shadow-2xl animate-fade-in-up">
          <span className="text-xs uppercase tracking-widest font-bold">Link Copied to Clipboard</span>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-6 md:p-12 flex justify-between items-center z-40 pointer-events-none mix-blend-difference">
        <div className="text-xl tracking-widest font-bold uppercase display-font pointer-events-auto">Aura</div>
        <div className="flex items-center gap-3 pointer-events-auto">
          <Button
            onClick={handleExport}
            variant="secondary"
            className="!px-4 !py-2 !text-xs !font-mono"
            disabled={isExporting}
          >
            {isExporting ? 'Sharing...' : 'Share'}
          </Button>

          {isEditing ? (
            <>
              <Button
                onClick={handleCancel}
                variant="ghost"
                className="!px-4 !py-2 !text-xs !font-mono !text-red-400 hover:!bg-red-500 hover:!text-white !border-red-500/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                className="!px-4 !py-2 !text-xs !font-mono bg-white text-black hover:!bg-gray-200"
              >
                Save
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="secondary"
              className="!px-4 !py-2 !text-xs !font-mono"
            >
              Edit
            </Button>
          )}

          <Button
            onClick={onOpenDashboard}
            variant="secondary"
            className="!px-4 !py-2 !text-xs !font-mono"
          >
            Dashboard
          </Button>
        </div>
      </header>

      {/* Hero / Profile Card */}
      <section className="min-h-[80vh] flex items-center justify-center px-6 pt-32 pb-20">
        <div className="max-w-3xl w-full text-center flex flex-col items-center">
          {/* Avatar Placeholder / Abstract Visual */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-gray-800 to-black border border-gray-700 mb-8 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
            <span className="text-3xl font-light text-gray-500 display-font">
              {localProfile.name.charAt(0)}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-6 w-full animate-fade-in flex flex-col items-center">
              <input
                type="text"
                value={localProfile.name}
                onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                className={`w-full max-w-lg text-center text-4xl md:text-6xl font-light text-white display-font py-2 ${editableInputBase}`}
                placeholder="Your Name"
              />
              <input
                type="text"
                value={localProfile.title}
                onChange={(e) => setLocalProfile({ ...localProfile, title: e.target.value })}
                className={`w-full max-w-md text-center text-sm md:text-base text-gray-300 uppercase tracking-[0.2em] py-2 ${editableInputBase}`}
                placeholder="Your Role"
              />
              <textarea
                value={localProfile.bio}
                onChange={(e) => setLocalProfile({ ...localProfile, bio: e.target.value })}
                rows={4}
                className={`w-full text-center text-lg md:text-xl font-light text-gray-300 leading-relaxed p-4 border border-dashed border-gray-600 rounded-lg bg-white/5 focus:bg-white/10 focus:border-white outline-none transition-colors resize-none`}
                placeholder="Short bio..."
              />
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-7xl font-light text-white leading-tight mb-4 display-font">
                {localProfile.name}
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mb-8 uppercase tracking-[0.3em] font-mono border border-gray-800 px-4 py-2 rounded-full">
                {localProfile.title}
              </p>
              <div className="max-w-2xl mb-12">
                <p className="text-lg md:text-xl font-light text-gray-400 leading-relaxed">
                  {localProfile.bio}
                </p>
              </div>

              {/* Social Links (Linktree Style) */}
              <div className="flex gap-6 mb-12">
                {localProfile.linkedinUrl && (
                  <motion.a
                    href={localProfile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-gray-800 bg-[#0a0a0a] text-gray-400 hover:text-white hover:border-white transition-colors"
                    whileHover={{
                      y: -4,
                      x: -4,
                      boxShadow: '4px 4px 0px rgba(255,255,255,1)',
                      transition: { type: "spring", stiffness: 400, damping: 30 }
                    }}
                    initial={{ boxShadow: '0px 0px 0px rgba(255,255,255,0)' }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </motion.a>
                )}
                {localProfile.githubUrl && (
                  <motion.a
                    href={localProfile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-gray-800 bg-[#0a0a0a] text-gray-400 hover:text-white hover:border-white transition-colors"
                    whileHover={{
                      y: -4,
                      x: -4,
                      boxShadow: '4px 4px 0px rgba(255,255,255,1)',
                      transition: { type: "spring", stiffness: 400, damping: 30 }
                    }}
                    initial={{ boxShadow: '0px 0px 0px rgba(255,255,255,0)' }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                  </motion.a>
                )}
                <motion.a
                  href={`mailto:hello@${localProfile.name.split(' ')[0].toLowerCase()}.com`}
                  className="p-3 border border-gray-800 bg-[#0a0a0a] text-gray-400 hover:text-white hover:border-white transition-colors"
                  whileHover={{
                    y: -4,
                    x: -4,
                    boxShadow: '4px 4px 0px rgba(255,255,255,1)',
                    transition: { type: "spring", stiffness: 400, damping: 30 }
                  }}
                  initial={{ boxShadow: '0px 0px 0px rgba(255,255,255,0)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </motion.a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Projects - Styled as High-End "Linktree" Cards */}
      <section className="pb-32 px-4 md:px-6">
        <div className="max-w-xl mx-auto flex flex-col gap-4">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] text-gray-600 mb-6">Works & Projects</h2>

          {localProfile.projects.map((p, i) => (
            <Card
              key={i}
              onClick={() => !isEditing && setSelectedProject(p)}
              className={`group w-full mb-4 cursor-pointer transition-all duration-300 ${isEditing ? 'border-dashed border-gray-600 bg-white/5 cursor-text hover:translate-x-0 hover:translate-y-0 hover:shadow-none' : ''}`}
              hoverEffect={!isEditing}
            >
              {isEditing ? (
                <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={p.title}
                      onChange={(e) => handleProjectUpdate(i, 'title', e.target.value)}
                      className={`flex-1 text-xl font-light text-white display-font ${editableInputBase}`}
                      placeholder="Project Title"
                    />
                    <button
                      onClick={() => handleDeleteProject(i)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-sm transition-colors border border-transparent hover:border-red-500/30"
                      title="Delete Project"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456-1.22l.75-3.926m-1.528 0a24.86 24.86 0 00-6.52.05m-1.528 0l-.75 3.926m4.35 0H5.66" />
                      </svg>
                    </button>
                  </div>
                  <textarea
                    value={p.description}
                    onChange={(e) => handleProjectUpdate(i, 'description', e.target.value)}
                    rows={2}
                    className={`w-full text-sm text-gray-300 border border-dashed border-gray-600 bg-black/20 focus:bg-black/40 focus:border-white outline-none p-2 rounded-sm resize-none`}
                    placeholder="Project description..."
                  />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-light text-white display-font">{p.title}</h3>
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-white transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400 font-light leading-relaxed mb-4 line-clamp-2">{p.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.technologies.slice(0, 3).map((tech, ti) => (
                      <span key={ti} className="text-[10px] uppercase tracking-wider text-gray-600 border border-gray-800 px-2 py-0.5 rounded-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Skills Marquee (Subtle Footer) */}
      <section className="py-12 border-t border-gray-900 bg-[#080808]">
        {isEditing ? (
          <div className="max-w-xl mx-auto px-6">
            <label className="text-xs uppercase text-gray-500 tracking-widest block mb-2">Skills (Comma Separated)</label>
            <textarea
              value={localProfile.skills.join(', ')}
              onChange={(e) => handleSkillUpdate(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-dashed border-gray-600 p-4 text-white font-mono text-sm focus:border-white focus:bg-white/5 outline-none rounded-sm"
            />
          </div>
        ) : (
          <div className="flex overflow-hidden relative">
            <div className="flex gap-8 animate-marquee whitespace-nowrap opacity-50">
              {[...localProfile.skills, ...localProfile.skills, ...localProfile.skills].map((skill, i) => (
                <span key={i} className="text-lg font-light text-gray-600 display-font">
                  {skill} <span className="mx-4 text-gray-800">/</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Contact Form */}
      <section className="py-24 px-6 md:px-20 bg-white/5 border-t border-gray-800">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-light mb-2 display-font text-white">Get in Touch</h3>
            <p className="text-gray-500 text-sm">Send a message directly.</p>
          </div>
          <FeedbackForm onSubmit={onFeedbackSubmit} />
        </div>
      </section>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedProject(null)}
          ></div>
          <div className="relative bg-[#0a0a0a] border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 md:p-12 shadow-2xl animate-fade-in-up z-10">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>

            <span className="text-xs font-mono text-green-500 uppercase tracking-widest mb-4 block">Project Details</span>

            <h3 className="text-3xl md:text-5xl font-light text-white display-font mb-6 leading-tight">
              {selectedProject.title}
            </h3>

            <div className="flex flex-wrap gap-2 mb-8">
              {selectedProject.technologies.map((tech, i) => (
                <span key={i} className="text-xs uppercase tracking-wider text-gray-400 border border-gray-800 px-3 py-1 rounded-full bg-white/5">
                  {tech}
                </span>
              ))}
            </div>

            <div className="prose prose-invert max-w-none mb-10">
              <p className="text-gray-300 text-lg font-light leading-relaxed whitespace-pre-line">
                {selectedProject.description}
              </p>
            </div>

            {selectedProject.link && selectedProject.link !== '#' && (
              <Button
                onClick={() => window.open(selectedProject.link, '_blank')}
                variant="primary"
                className="!px-8 !py-3 !text-sm !font-medium"
              >
                View Project
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioView;