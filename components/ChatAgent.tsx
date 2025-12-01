import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { chatWithAgent } from '@/services/openrouterService';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatAgentProps {
  profile: UserProfile;
}

const ChatAgent: React.FC<ChatAgentProps> = ({ profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Hello! I am ${profile.name.split(' ')[0]}'s AI assistant. Ask me anything about their experience or projects.`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Format history for Gemini API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await chatWithAgent(history, profile, userMsg.text);

      const modelMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVariants = {
    closed: {
      scale: 1,
      x: 0,
      y: 0,
      boxShadow: '0px 0px 0px rgba(255,255,255,0)',
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25
      }
    },
    open: {
      scale: 1.05,
      x: -4,
      y: -4,
      boxShadow: '6px 6px 0px rgba(255,255,255,1)',
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 30
      }
    }
  };

  const chatWindowVariants = {
    closed: {
      y: 20,
      opacity: 0,
      scale: 0.95,
      boxShadow: '0px 0px 0px rgba(255,255,255,0)',
    },
    open: {
      y: 0,
      opacity: 1,
      scale: 1,
      boxShadow: '8px 8px 0px rgba(255,255,255,0.5)',
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      y: 20,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 }
    })
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 h-14 w-14 flex items-center justify-center border border-gray-800 ${isOpen ? 'bg-white text-black' : 'bg-[#0a0a0a] text-white'}`}
        variants={toggleVariants}
        initial="closed"
        whileHover="open"
        animate={isOpen ? "open" : "closed"}
        whileTap={{ scale: 0.95 }}
      >
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path d="M12 5v14M5 12h14" />
        </motion.svg>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-28 right-8 z-50 w-full max-w-sm bg-[#0a0a0a] border border-gray-800 flex flex-col h-[500px]"
            variants={chatWindowVariants}
            initial="closed"
            animate="open"
            exit="exit"
          >
            {/* Header */}
            <motion.div
              className="p-4 border-b border-gray-800 bg-[#0f0f0f] flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <h4 className="text-sm font-medium text-white">Ask Me Anything</h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">AI Assistant</p>
              </div>
            </motion.div>

            {/* Messages */}
            <motion.div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  custom={idx}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                      ? 'bg-white text-black rounded-tr-none'
                      : 'bg-gray-900 text-gray-200 rounded-tl-none border border-gray-800'
                      }`}
                    whileHover={{
                      y: -2,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.3), 0 6px 6px rgba(0,0,0,0.2)',
                      transition: { duration: 0.2 }
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    {msg.text}
                  </motion.div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="bg-gray-900 border border-gray-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-1"
                    whileHover={{
                      y: -2,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.3), 0 6px 6px rgba(0,0,0,0.2)',
                      transition: { duration: 0.2 }
                    }}
                  >
                    <motion.span
                      className="w-1.5 h-1.5 bg-gray-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                    <motion.span
                      className="w-1.5 h-1.5 bg-gray-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.span
                      className="w-1.5 h-1.5 bg-gray-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </motion.div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </motion.div>

            {/* Input */}
            <motion.div
              className="p-4 border-t border-gray-800 bg-[#0f0f0f]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <motion.div className="relative">
                <motion.input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about my projects..."
                  className="w-full bg-[#050505] border border-gray-800 text-white text-sm rounded-full py-3 px-4 focus:outline-none focus:border-gray-600 transition-colors pr-10"
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3), 0 6px 6px rgba(0,0,0,0.2)',
                    transition: { duration: 0.2 }
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 disabled:opacity-50 transition-colors"
                  whileHover={{
                    scale: 1.1,
                    color: "#ffffff",
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 3px 3px rgba(0,0,0,0.2)',
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatAgent;