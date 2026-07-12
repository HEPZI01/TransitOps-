import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import React from 'react';

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  glass?: boolean;
}

export function AnimatedCard({ children, className = '', delay = 0, glass = true, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className={`rounded-xl border shadow-sm hover-glow ${glass ? 'glass-panel' : 'bg-card text-card-foreground'} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
