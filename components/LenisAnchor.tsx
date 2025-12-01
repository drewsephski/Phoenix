"use client";

import { useEffect } from "react";
import { useLenisScroll } from "@/hooks/useLenisScroll";

interface LenisAnchorProps {
    href: string;
    children: React.ReactNode;
    offset?: number;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const LenisAnchor: React.FC<LenisAnchorProps> = ({
    href,
    children,
    offset = 0,
    className,
    onClick,
    ...props
}) => {
    const { scrollToElement } = useLenisScroll();

    useEffect(() => {
        // Auto-handle anchor links within this component
        const handleClick = (e: Event) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement;

            if (anchor && anchor.href && anchor.href === href) {
                e.preventDefault();
                const href = anchor.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const id = href.substring(1);
                    scrollToElement(`#${id}`, offset, { duration: 1.2 });
                }
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [href, offset, scrollToElement]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (onClick) {
            onClick(e);
        }

        // If it's an anchor link, handle it with Lenis
        if (href.startsWith('#')) {
            e.preventDefault();
            const id = href.substring(1);
            scrollToElement(`#${id}`, offset, { duration: 1.2 });
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

export { LenisAnchor };