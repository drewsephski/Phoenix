"use client";

import { useLenisScroll } from "@/hooks/useLenisScroll";

interface SmoothScrollExampleProps {
    sections: { id: string; title: string }[];
}

const SmoothScrollExample: React.FC<SmoothScrollExampleProps> = ({ sections }) => {
    const { scrollTo, isLenisAvailable } = useLenisScroll();

    return (
        <div>
            {/* Navigation */}
            <nav className="fixed top-4 left-4 right-4 flex gap-4 bg-black/20 backdrop-blur-md p-4 rounded-lg">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => scrollTo(`#${section.id}`, { duration: 1.5 })}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                    >
                        {section.title}
                    </button>
                ))}
            </nav>

            {/* Sections */}
            {sections.map((section, index) => (
                <section
                    key={section.id}
                    id={section.id}
                    className="min-h-screen flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, rgba(255,255,255,${(index + 1) * 0.1}) 0%, rgba(0,0,0,0) 100%)`
                    }}
                >
                    <div className="text-center">
                        <h2 className="text-6xl font-bold mb-4">{section.title}</h2>
                        <p className="text-xl opacity-80">Smooth scrolling with momentum effect</p>
                        <p className="text-sm opacity-60 mt-2">
                            {isLenisAvailable() ? 'Lenis is active' : 'Using native scroll fallback'}
                        </p>
                    </div>
                </section>
            ))}
        </div>
    );
};

export default SmoothScrollExample;