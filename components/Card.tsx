import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    onClick?: () => void;
    noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hoverEffect = true,
    onClick,
    noPadding = false
}) => {
    const cardVariants = {
        rest: {
            y: 0,
            x: 0,
            boxShadow: '0px 0px 0px rgba(255,255,255,0)',
            borderColor: 'rgba(38, 38, 38, 1)', // neutral-800
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 25
            }
        },
        hover: {
            y: -6,
            x: -6,
            boxShadow: '8px 8px 0px rgba(255,255,255,1)', // Solid white shadow for brutalist look
            borderColor: 'rgba(255, 255, 255, 1)',
            transition: {
                type: 'spring',
                stiffness: 400,
                damping: 30
            }
        },
        tap: {
            y: -2,
            x: -2,
            boxShadow: '4px 4px 0px rgba(255,255,255,1)',
            transition: { duration: 0.1 }
        }
    };

    return (
        <motion.div
            className={`bg-[#0a0a0a] border border-neutral-800 relative ${noPadding ? '' : 'p-6'} ${className}`}
            variants={hoverEffect ? cardVariants : {}}
            initial="rest"
            whileHover={hoverEffect ? "hover" : undefined}
            whileTap={hoverEffect ? "tap" : undefined}
            onClick={onClick}
        >
            {children}

            {/* Decorative corner accents for extra brutalism */}
            <div className="absolute top-0 left-0 w-1 h-1 bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-1 h-1 bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-1 h-1 bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 right-0 w-1 h-1 bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    );
};

export default Card;
