import React, { useState } from 'react';
import Button from './Button';
import Card from './Card';

interface FeedbackFormProps {
  onSubmit: (name: string, email: string, message: string) => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, email, message);
    setSubmitted(true);
    // Reset after delay or keep message
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setSubmitted(false);
    }, 5000);
  };

  if (submitted) {
    return (
      <div className="p-8 border border-green-900 bg-green-900/10 text-center animate-fade-in">
        <h4 className="text-xl text-green-400 mb-2 display-font">Message Received</h4>
        <p className="text-gray-400 font-light">Thank you for your feedback. I will review it shortly.</p>
      </div>
    );
  }

  return (
    <Card className="p-8" hoverEffect={false}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500">Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-transparent border-b border-gray-800 py-3 text-white focus:border-white focus:outline-none transition-colors placeholder-gray-700"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-gray-800 py-3 text-white focus:border-white focus:outline-none transition-colors placeholder-gray-700"
              placeholder="email@example.com"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-gray-500">Message</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-gray-800 p-4 text-gray-300 focus:border-white focus:outline-none transition-colors resize-none"
            placeholder="Your thoughts..."
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="secondary" className="!px-6 !py-2 !text-xs">
            Submit Feedback
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default FeedbackForm;