import React, { useMemo } from "react";
import Button from "./Button";
import Card from "./Card";
import Image from "next/image";
import { motion } from "framer-motion";

// Type-safe class name utility (mimics clsx/classnames)
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Configuration constants for maintainability
const ANIMATION_DELAYS = {
  FEATURE_1: "0s",
  FEATURE_2: "0.1s",
  FEATURE_3: "0.2s",
  FEATURE_4: "0.3s",
} as const;

const TICKER_REPEAT_COUNT = 4;

interface FeaturesSectionProps {
  onStart: () => void;
}

interface FeatureBoxProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
  delay?: string;
}

interface StepProps {
  number: string;
  title: string;
  desc: string;
}

const FeatureBox: React.FC<FeatureBoxProps> = React.memo(({
  title,
  subtitle,
  children,
  className = "",
  delay = "0s",
}) => {
  return (
    <Card
      className={cn(
        "flex flex-col justify-between h-full",
        "animate-fade-in-up",
        className
      )}
      hoverEffect={true}
    >
      <div className="mb-8" style={{ animationDelay: delay }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 border border-gray-800 px-2 py-1 rounded-sm font-mono">
            {subtitle}
          </span>
          <div className="flex space-x-1" aria-hidden="true">
            <span className="w-0.5 h-0.5 bg-gray-500" />
            <span className="w-0.5 h-0.5 bg-gray-500" />
            <span className="w-0.5 h-0.5 bg-gray-500" />
          </div>
        </div>
        <h3
          id={`feature-${subtitle}`}
          className="text-2xl font-light text-white display-font leading-tight"
        >
          {title}
        </h3>
      </div>
      <div className="text-sm text-gray-400 font-light leading-relaxed">
        {children}
      </div>
    </Card>
  );
});

FeatureBox.displayName = "FeatureBox";

const Step: React.FC<StepProps> = React.memo(({ number, title, desc }) => (
  <motion.div
    className="flex gap-6 items-start group relative z-10"
    whileHover={{
      x: 8,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    }}
  >
    <motion.div
      className="flex-shrink-0 w-12 h-12 flex items-center justify-center border border-gray-800 text-gray-500 font-mono text-xs bg-[#050505]"
      whileHover={{
        scale: 1.05,
        borderColor: "#ffffff",
        color: "#ffffff",
        transition: { duration: 0.3 }
      }}
      transition={{ duration: 0.3 }}
      aria-hidden="true"
    >
      {number}
    </motion.div>
    <div className="pt-2">
      <motion.h4
        className="text-lg font-light text-white mb-2 display-font"
        whileHover={{
          color: "#d1d5db",
          transition: { duration: 0.3 }
        }}
      >
        {title}
      </motion.h4>
      <p className="text-gray-500 text-sm leading-relaxed max-w-sm">{desc}</p>
    </div>
  </motion.div>
));

Step.displayName = "Step";

const StatDisplay: React.FC<{ value: string; label: string }> = React.memo(({ value, label }) => (
  <Card
    className="flex items-center justify-center h-full"
    hoverEffect={true}
  >
    <div className="text-center">
      <motion.div
        className="text-4xl font-light text-white display-font mb-2"
        aria-label={`${value} ${label}`}
        initial={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {value}
      </motion.div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">
        {label}
      </div>
    </div>
  </Card>
));

StatDisplay.displayName = "StatDisplay";

// Extracted data for better maintainability
const BASE_TICKER_ITEMS = [
  "FAST GENERATION",
  "PROFESSIONAL DESIGN",
  "AI COPYWRITING",
  "INSTANT DEPLOYMENT",
] as const;

const FEATURES_DATA = [
  {
    title: "Instant Analysis",
    subtitle: "Core.01",
    className: "md:col-span-1",
    delay: ANIMATION_DELAYS.FEATURE_1,
    body: "We instantly identify your top skills and experience from your rough notes or resume summary.",
  },
  {
    title: "Professional Writing",
    subtitle: "Core.02",
    className: "md:col-span-1",
    delay: ANIMATION_DELAYS.FEATURE_2,
    body: "Don't know what to write? Our AI acts as your personal editor to craft a polished, professional bio and project descriptions.",
  },
  {
    title: "Interactive Chatbot",
    subtitle: "Core.03",
    className: "md:col-span-1",
    delay: ANIMATION_DELAYS.FEATURE_3,
    body: "An AI assistant that knows your work history and can answer questions from visitors about your background.",
  },
  {
    title: "Modern Design",
    subtitle: "Sys.01",
    className: "md:col-span-2",
    delay: ANIMATION_DELAYS.FEATURE_4,
    body: "Get a fully responsive, high-performance website that looks incredible on any device. No design skills or coding required.",
  },
] as const;

const STEPS_DATA = [
  {
    number: "01",
    title: "Paste Info",
    desc: "Simply copy your bio or resume summary into the input field.",
  },
  {
    number: "02",
    title: "AI Building",
    desc: "We analyze, write, and design your site automatically in seconds.",
  },
  {
    number: "03",
    title: "Launch",
    desc: "Your site goes live and is ready to share with your network.",
  },
] as const;

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onStart }) => {
  // Memoize ticker items to prevent unnecessary recalculations
  const tickerItems = useMemo(
    () => Array.from({ length: TICKER_REPEAT_COUNT }, () => BASE_TICKER_ITEMS).flat(),
    []
  );

  return (
    <section
      className="relative w-full bg-[#050505] z-20 pb-32 overflow-hidden"
      aria-labelledby="features-heading"
      id="features"
    >
      {/* Tech Running Ticker */}
      <div
        className="w-full border-t border-gray-900 flex overflow-hidden py-4 bg-[#080808]"
        role="marquee"
        aria-label="Technology highlights"
      >
        <motion.div
          className="flex gap-12 animate-marquee whitespace-nowrap opacity-40"
          initial={{ x: 0 }}
          whileHover={{
            x: -20,
            transition: { duration: 0.3 }
          }}
        >
          {tickerItems.map((tech, i) => (
            <span
              key={`${tech}-${i}`}
              className="text-[10px] font-mono tracking-widest text-gray-400 uppercase flex items-center gap-2"
            >
              <span className="w-1 h-1 bg-green-900 rounded-full" aria-hidden="true" />
              {tech}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-24">
        {/* Header Section */}
        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono text-green-500 uppercase tracking-widest mb-4 block">
              System Capabilities
            </span>
            <motion.h2
              id="features-heading"
              className="text-4xl md:text-6xl font-light text-white display-font mb-6 leading-[0.9]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              Powered by <br />
              <span className="text-gray-600">Next-Gen AI.</span>
            </motion.h2>
            <motion.p
              className="text-gray-400 font-light text-lg max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            >
              Our intelligent system reads your experience and automatically
              designs a portfolio that stands out from the crowd.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          >
            <Button
              onClick={onStart}
              variant="secondary"
              className="!px-8 !py-4 group"
              aria-label="Start building your portfolio"
            >
              Start Building
              <span
                className="ml-2 group-hover:translate-x-1 transition-transform inline-block"
                aria-hidden="true"
              >
                →
              </span>
            </Button>
          </motion.div>
        </header>

        {/* Bento Grid - Features */}
        <motion.div
          className="border-t border-l border-gray-800/50 mb-32"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3">
            {FEATURES_DATA.map((feature) => (
              <FeatureBox
                key={feature.subtitle}
                title={feature.title}
                subtitle={feature.subtitle}
                className={feature.className}
                delay={feature.delay}
              >
                {feature.body}
              </FeatureBox>
            ))}

            <StatDisplay value="99.9%" label="Uptime Reliability" />
          </div>
        </motion.div>

        {/* How It Works Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center border-t border-gray-900 pt-24" id="how-it-works">
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Decorative background gradient */}
            <div
              className="pointer-events-none absolute -inset-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50 blur-2xl"
              aria-hidden="true"
            />

            <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-16 relative z-10">
              How It Works
            </h3>

            <div className="space-y-16 relative" role="list">
              {/* Connecting Line */}
              <div
                className="absolute left-[23px] top-4 bottom-0 w-px bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800 -z-10"
                aria-hidden="true"
              />

              {STEPS_DATA.map((step) => (
                <div key={step.number} role="listitem">
                  <Step
                    number={step.number}
                    title={step.title}
                    desc={step.desc}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Abstract Visual Decoration */}
          <motion.div
            className="relative h-[500px] w-full bg-[#080808] rounded-lg group"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            aria-hidden="true"
          >
            {/* Social Import Guide Image under hero section */}
            <div className="w-full animate-fade-in relative">
              <Image
                src="/socials.png"
                alt="Social media import guide showing LinkedIn and GitHub integration"
                width={1200}
                height={675}
                className="w-full h-full object-contain"
                priority
              />

              {/* Texture Overlay - hidden on mobile */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none rounded-lg transition-opacity duration-300 ease-in-out group-hover:opacity-0 hidden sm:block"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

FeaturesSection.displayName = "FeaturesSection";

export default FeaturesSection;