"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface NavLink {
    href: string;
    label: string;
}

const navLinks: NavLink[] = [
    { href: "#start", label: "Home" },
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
];

const Footer: React.FC = () => {
    const linkVariants = {
        rest: {
            y: 0,
            x: 0,
            boxShadow: '0px 0px 0px rgba(255,255,255,0)',
            transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 25
            }
        },
        hover: {
            y: -4,
            x: -4,
            boxShadow: '4px 4px 0px rgba(255,255,255,1)',
            transition: {
                type: "spring" as const,
                stiffness: 400,
                damping: 30
            }
        }
    };

    return (
        <footer className="relative w-full bg-[#050505] border-t border-gray-800/50 z-30">
            {/* Decorative top border */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Navigation Links */}
                    <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-8" aria-label="Footer navigation">
                        {navLinks.map((link, index) => (
                            <motion.div
                                key={link.href}
                                variants={linkVariants}
                                initial="rest"
                                whileHover="hover"
                                transition={{
                                    delay: index * 0.1,
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 25
                                }}
                            >
                                <Link
                                    href={link.href}
                                    className="text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-white border border-gray-800 px-3 py-2 rounded-sm hover:border-white inline-block"
                                >
                                    <span className="relative">
                                        {link.label}
                                        <motion.span
                                            className="absolute -bottom-1 left-0 w-full h-[1px] bg-white scale-x-0 origin-left"
                                            initial={{ scaleX: 0 }}
                                            whileHover={{ scaleX: 1 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                        />
                                    </span>
                                </Link>
                            </motion.div>
                        ))}
                    </nav>

                    {/* Made by Drew with Instagram */}
                    <motion.div
                        className="flex items-center gap-4 text-xs font-mono text-gray-500"
                        whileHover={{
                            x: 4,
                            transition: { type: 'spring', stiffness: 300, damping: 25 }
                        }}
                    >
                        <span className="uppercase tracking-widest">Made by Drew</span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full" aria-hidden="true" />
                        <motion.a
                            href="https://instagram.com/drew.sepeczi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-400"
                            whileHover={{
                                color: "#ffffff",
                                x: 2,
                                transition: { duration: 0.3 }
                            }}
                            aria-label="Visit Drew's Instagram @drew.sepeczi"
                        >
                            <span className="text-gray-400">@</span>
                            <span>drew.sepeczi</span>
                            <motion.svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="text-gray-400"
                                whileHover={{
                                    color: "#ffffff",
                                    x: 2,
                                    transition: { duration: 0.3 }
                                }}
                                aria-hidden="true"
                            >
                                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                            </motion.svg>
                        </motion.a>
                    </motion.div>
                </div>

                {/* Bottom border accent */}
                <motion.div
                    className="mt-8 w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent opacity-50"
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 0.5, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                />
            </div>

            {/* Subtle dither overlay */}
            <div className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay opacity-10">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }} />
            </div>
        </footer>
    );
};

export default Footer;