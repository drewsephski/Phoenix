"use client";

import { useEffect, useRef } from "react";

interface SmoothAnchorProps {
    href: string;
    children: React.ReactNode;
    offset?: number;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const SmoothAnchor: React.FC<SmoothAnchorProps> = ({
    href,
    children,
    offset = 0,
    className,
    onClick,
    ...props
}) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (onClick) {
            onClick(e);
        }

        // If it's an anchor link, handle it with smooth scrolling
        if (href.startsWith('#')) {
            e.preventDefault();
            const id = href.substring(1);
            const element = document.getElementById(id);

            if (element) {
                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition + offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    };

    return (
        <a
            href={href}
            className={className}
            onClick={handleClick}
            {...props}
        >
            {children}
        </a>
    );
};

export default SmoothAnchor;