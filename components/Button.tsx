import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading,
  className = '',
  ...props
}) => {
  const baseStyles = "relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium border focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-[#050505] disabled:opacity-50 disabled:cursor-not-allowed group";

  const variants = {
    primary: "border-gray-100 text-gray-900 bg-gray-100",
    secondary: "border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 bg-transparent",
    ghost: "border-transparent text-gray-400 hover:text-white bg-transparent"
  };

  const buttonVariants = {
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
      boxShadow: '6px 6px 0px rgba(255,255,255,1)',
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 30
      }
    },
    tap: {
      y: -1,
      x: -1,
      boxShadow: '2px 2px 0px rgba(255,255,255,1)',
      scale: 0.98,
      transition: { duration: 0.05 }
    }
  };

  return (
    <motion.div
      className="relative inline-block"
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >

      <button
        className={`${baseStyles} ${variants[variant]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        <span className="relative font-medium tracking-wide font-sans text-sm uppercase">
          {children}
        </span>
        {/* Brutalist hover indicator */}
        {variant !== 'primary' && (
          <motion.span
            className="absolute bottom-0 left-0 w-full h-[2px] bg-white scale-x-0 origin-left"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}
      </button>
    </motion.div>
  );
};

export default Button;