"use client";

import { useEffect, useState, useCallback } from "react";

export const useLenisScroll = () => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const checkLenis = () => {
            if (typeof window !== 'undefined' && window.__lenis) {
                setIsReady(true);
            } else {
                setTimeout(checkLenis, 100);
            }
        };

        checkLenis();
    }, []);

    const scrollTo = useCallback((target: string | number, options: { duration?: number; offset?: number } = {}) => {
        if (!isReady || !window.__lenis) {
            // Fallback to native scroll
            if (typeof target === 'number') {
                window.scrollTo({ top: target, behavior: 'smooth' });
            } else if (typeof target === 'string') {
                const element = document.querySelector(target);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (options.offset && options.offset !== 0) {
                        window.scrollBy(0, options.offset);
                    }
                }
            }
            return;
        }

        try {
            if (typeof target === 'number') {
                window.__lenis.scrollTo(target + (options.offset || 0), { duration: options.duration || 1.2 });
            } else if (typeof target === 'string') {
                window.__lenis.scrollTo(target, { duration: options.duration || 1.2, offset: options.offset || 0 });
            }
        } catch (error) {
            console.warn('Lenis scroll failed, falling back to native scroll:', error);
            // Fallback to native scroll
            if (typeof target === 'number') {
                window.scrollTo({ top: target + (options.offset || 0), behavior: 'smooth' });
            } else if (typeof target === 'string') {
                const element = document.querySelector(target);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    }, [isReady]);

    const scrollToTop = useCallback((options: { duration?: number } = {}) => {
        scrollTo(0, options);
    }, [scrollTo]);

    const isLenisAvailable = useCallback(() => {
        return isReady && !!window.__lenis;
    }, [isReady]);

    return {
        isReady,
        scrollTo,
        scrollToTop,
        isLenisAvailable
    };
};