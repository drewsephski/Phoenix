import React, { useState } from 'react';
import { Feedback, UserProfile } from '../types';
import Button from './Button';
import Card from './Card';
import { motion, AnimatePresence } from 'framer-motion';
import { getPortfolioHistory } from '../utils';

interface DashboardProps {
  profile: UserProfile;
  feedbackList: Feedback[];
  onGenerateReply: (feedbackId: string) => void;
  onExit: () => void;
  history?: UserProfile[];
}

const Dashboard: React.FC<DashboardProps> = ({ profile, feedbackList, onGenerateReply, onExit, history }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const portfolioHistory = history || getPortfolioHistory();

  const stats = {
    total: feedbackList.length,
    positive: feedbackList.filter(f => f.sentiment === 'Positive').length,
    opportunities: feedbackList.filter(f => f.category === 'Work Opportunity').length
  };

  const selectedFeedback = feedbackList.find(f => f.id === selectedId);

  return (
    <motion.div
      className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-3xl font-light display-font mb-2">Aura Command Center</h1>
          <p className="text-gray-500 text-sm font-mono">Welcome back, {profile.name}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button onClick={onExit} variant="ghost" className="!px-4">
            Exit to Portfolio
          </Button>
        </motion.div>
      </header>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="p-6">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Total Feedback</p>
          <motion.p
            className="text-4xl font-light"
            initial={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {stats.total}
          </motion.p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Positive Sentiment</p>
          <motion.p
            className="text-4xl font-light text-green-400"
            initial={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {stats.positive}
          </motion.p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Opportunities</p>
          <motion.p
            className="text-4xl font-light text-blue-400"
            initial={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {stats.opportunities}
          </motion.p>
        </Card>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* Portfolio History */}
        <Card
          className="lg:col-span-1 flex flex-col h-[600px]"
          noPadding={true}
          hoverEffect={false}
        >
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-medium uppercase tracking-widest text-gray-400">Portfolio History</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            <AnimatePresence>
              {portfolioHistory.length === 0 && (
                <motion.div
                  className="p-8 text-center text-gray-600 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  No saved portfolios yet.
                </motion.div>
              )}
              {portfolioHistory.map((p) => (
                <motion.button
                  key={p.id}
                  onClick={() => window.open(`/share/${p.id}`, '_blank')}
                  className="w-full text-left p-4 border-b border-gray-800 transition-colors group hover:bg-white/5"
                  initial={{ x: 0, backgroundColor: 'rgba(255,255,255,0)' }}
                  whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.02)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-200 group-hover:text-white">{p.name}</span>
                    <span className="text-[10px] text-gray-600 font-mono">
                      {new Date(p.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{p.title}</p>
                  <div className="flex flex-wrap gap-1">
                    {p.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="text-[9px] text-gray-600 border border-gray-800 px-1 py-0.5 rounded-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </Card>

        {/* Feedback List */}
        <Card
          className="lg:col-span-1 flex flex-col h-[600px]"
          noPadding={true}
          hoverEffect={false}
        >
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-medium uppercase tracking-widest text-gray-400">Inbox</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            <AnimatePresence>
              {feedbackList.length === 0 && (
                <motion.div
                  className="p-8 text-center text-gray-600 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  No feedback yet.
                </motion.div>
              )}
              {feedbackList.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left p-4 border-b border-gray-800 transition-colors group ${selectedId === item.id ? 'bg-white/5 border-l-2 border-l-white' : 'border-l-2 border-l-transparent'}`}
                  initial={{ x: 0, backgroundColor: 'rgba(255,255,255,0)' }}
                  whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.02)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-200 group-hover:text-white">{item.name}</span>
                    <span className="text-[10px] text-gray-600 font-mono">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <span className={`text-[10px] px-1.5 py-0.5 border ${item.category === 'Work Opportunity' ? 'border-blue-900 text-blue-400' :
                      item.category === 'Praise' ? 'border-green-900 text-green-400' :
                        'border-gray-800 text-gray-500'
                      }`}>
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{item.message}</p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </Card>

        {/* Feedback Detail */}
        <Card
          className="lg:col-span-1 min-h-[600px] flex flex-col p-8"
          hoverEffect={false}
        >
          <AnimatePresence mode="wait">
            {selectedFeedback ? (
              <motion.div
                key={selectedFeedback.id}
                className="h-full flex flex-col"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-start mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-light mb-1">{selectedFeedback.name}</h2>
                    <p className="text-gray-500 text-sm">{selectedFeedback.email}</p>
                  </motion.div>
                  <motion.div
                    className="flex flex-col items-end gap-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <span className="text-xs text-gray-500 uppercase tracking-widest">AI Analysis</span>
                    <div className="flex gap-2">
                      <motion.span
                        className="text-xs px-2 py-1 bg-white/5 text-gray-300 border border-gray-700"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {selectedFeedback.category}
                      </motion.span>
                      <motion.span
                        className={`text-xs px-2 py-1 border border-gray-700 ${selectedFeedback.sentiment === 'Positive' ? 'text-green-400' :
                          selectedFeedback.sentiment === 'Negative' ? 'text-red-400' : 'text-gray-400'
                          }`}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        {selectedFeedback.sentiment}
                      </motion.span>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  className="bg-[#050505] p-6 border border-gray-800 mb-8 rounded-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <p className="text-gray-300 leading-relaxed">{selectedFeedback.message}</p>
                </motion.div>

                <div className="mt-auto">
                  <motion.div
                    className="flex items-center justify-between mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <h3 className="text-sm uppercase tracking-widest text-gray-500">Draft Response</h3>
                    {!selectedFeedback.aiResponseDraft && (
                      <Button
                        variant="secondary"
                        onClick={() => onGenerateReply(selectedFeedback.id)}
                        className="!py-2 !px-4 !text-xs"
                      >
                        Generate with Gemini
                      </Button>
                    )}
                  </motion.div>

                  {selectedFeedback.aiResponseDraft ? (
                    <motion.div
                      className="bg-[#0f0f0f] p-6 border border-gray-800"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <p className="text-gray-400 text-sm mb-4 leading-relaxed font-mono">
                        {selectedFeedback.aiResponseDraft}
                      </p>
                      <motion.div
                        className="flex gap-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                      >
                        <Button className="!py-2 !px-6 !text-xs">Send</Button>
                        <Button variant="ghost" className="!py-2 !px-4 !text-xs" onClick={() => onGenerateReply(selectedFeedback.id)}>Regenerate</Button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="h-32 border border-dashed border-gray-800 flex items-center justify-center text-gray-600 text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      No draft generated yet.
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                className="h-full flex flex-col items-center justify-center text-gray-600"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <p>Select a message to view details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;