import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import React from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

interface StaggeredListProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

export function StaggeredList({ children, className = '', ...props }: StaggeredListProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({ children, className = '', ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function StaggeredTableBody({ children, className = '', ...props }: HTMLMotionProps<'tbody'>) {
  return (
    <motion.tbody
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
      {...props}
    >
      {children}
    </motion.tbody>
  );
}

export function StaggeredTableRow({ children, className = '', ...props }: HTMLMotionProps<'tr'>) {
  return (
    <motion.tr variants={itemVariants} className={className} {...props}>
      {children}
    </motion.tr>
  );
}
