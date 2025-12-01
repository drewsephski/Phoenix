"use client";

import { useState, useEffect } from "react";
import { LenisAnchor } from "./LenisAnchor";
import { useLenisScroll } from "@/hooks/useLenisScroll";

interface NavItem {
    id: string;
    label: string;
}

interface SmoothNavigationProps {
    items: NavItem[];
    className?: string;
    offset?: number;
    activeClass?: string;
}

const SmoothNavigation: React.FC<SmoothNavigationProps> = ({
    items,
    className = "",
    offset = 0,
    activeClass = "active"
}) => {
    const { isLenisAvailable } = useLenisScroll();
    const [activeSection, setActiveSection] = useState<string>("");

    useEffect(() => {
        if (!isLenisAvailable()) return;

        const sections = items.map(item => document.getElementById(item.id)).filter(Boolean);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                root: null,
                rootMargin: "-20% 0px -80% 0px",
                threshold: 0.1
            }
        );

        sections.forEach(section => {
            if (section) observer.observe(section);
        });

        return () => {
            sections.forEach(section => {
                if (section) observer.unobserve(section);
            });
        };
    }, [items, isLenisAvailable]);

    return (
        <nav className={`smooth-navigation ${className}`} role="navigation" aria-label="Main navigation">
            <ul className="flex space-x-6 md:space-x-8">
                {items.map((item) => (
                    <li key={item.id}>
                        <LenisAnchor
                            href={`#${item.id}`}
                            offset={offset}
                            className={`text-sm font-mono tracking-wider transition-colors duration-300 hover:text-white ${activeSection === item.id ? activeClass : "text-gray-500"
                                }`}
                        >
                            {item.label}
                        </LenisAnchor>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default SmoothNavigation;