"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

interface LenisProviderProps {
    children: React.ReactNode;
}

const LenisProvider: React.FC<LenisProviderProps> = ({ children }) => {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Initialize Lenis with momentum-based smooth scrolling
        const lenis = new Lenis({
            // Core momentum settings for smooth scrolling
            lerp: 0.075,           // Lower = smoother, more momentum
            duration: 1.2,         // Scroll duration
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing

            // Touch settings for momentum feel
            syncTouchLerp: 0.075,  // Touch lerp for momentum
            touchMultiplier: 1.2,  // Slightly more responsive

            // Wheel settings
            wheelMultiplier: 0.8,  // Less sensitive wheel

            // Basic settings
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            infinite: false,
            autoResize: true
        });

        lenisRef.current = lenis;

        // Animation loop
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Cleanup on unmount
        return () => {
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    // Expose Lenis globally for programmatic access
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.__lenis = lenisRef.current;
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.__lenis = null;
            }
        };
    }, []);

    return (
        <>
            {children}
            <style jsx global>{`
                html.lenis {
                    scroll-behavior: auto;
                }
                html.lenis body {
                    height: 100vh;
                    overflow: hidden;
                }
                [data-lenis-prevent] {
                    contain: layout style paint;
                }
            `}</style>
        </>
    );
};

export default LenisProvider;