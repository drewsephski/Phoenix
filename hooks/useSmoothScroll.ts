"use client";

import { useCallback } from "react";

export const useSmoothScroll = () => {
    const scrollTo = useCallback((target: string | number, options: { duration?: number; offset?: number } = {}) => {
        const { duration = 1000, offset = 0 } = options;

        if (typeof target === 'number') {
            // Scroll to absolute position
            const targetPosition = target + offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else if (typeof target === 'string') {
            // Scroll to element by selector
            const element = document.querySelector(target) as HTMLElement;
            if (element) {
                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition + offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    }, []);

    const scrollToTop = useCallback((options: { duration?: number } = {}) => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, []);

    const scrollToElement = useCallback((selector: string, offset = 0, options: { duration?: number } = {}) => {
        scrollTo(selector, { ...options, offset });
    }, [scrollTo]);

    const isSmoothScrollSupported = useCallback(() => {
        return 'scrollBehavior' in document.documentElement.style;
    }, []);

    return {
        scrollTo,
        scrollToTop,
        scrollToElement,
        isSmoothScrollSupported
    };
};