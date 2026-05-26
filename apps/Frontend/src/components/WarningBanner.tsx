import React from 'react';
import { AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WarningBannerProps {
  message: string;
  isVisible: boolean;
  role?: 'STUDENT' | 'COMPANY' | 'ADMIN';
}

const WarningBanner: React.FC<WarningBannerProps> = ({ message, isVisible, role = 'STUDENT' }) => {
  if (!isVisible) return null;

  const config = {
    STUDENT: {
      bg: 'bg-[#fffbeb] dark:bg-amber-900/20',
      border: 'border-[#fef3c7] dark:border-amber-900/30',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      titleColor: 'text-amber-900 dark:text-amber-200',
      textColor: 'text-amber-700/80 dark:text-amber-400/80',
      icon: AlertCircle,
      title: 'Student Account Pending'
    },
    COMPANY: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      border: 'border-indigo-100 dark:border-indigo-900/30',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      titleColor: 'text-indigo-900 dark:text-indigo-200',
      textColor: 'text-indigo-700/80 dark:text-indigo-400/80',
      icon: Clock,
      title: 'Company Verification Pending'
    },
    ADMIN: {
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      border: 'border-rose-100 dark:border-rose-900/30',
      iconBg: 'bg-rose-100 dark:bg-rose-900/40',
      iconColor: 'text-rose-600 dark:text-rose-400',
      titleColor: 'text-rose-900 dark:text-rose-200',
      textColor: 'text-rose-700/80 dark:text-rose-400/80',
      icon: ShieldAlert,
      title: 'Admin Access Restricted'
    }
  }[role];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`mb-6 p-4 ${config.bg} border ${config.border} rounded-2xl flex items-start gap-3 shadow-sm`}
      >
        <div className={`p-2 rounded-xl ${config.iconBg} ${config.iconColor} shrink-0`}>
          <config.icon className="h-5 w-5" />
        </div>
        <div className="pt-1">
          <p className={`text-sm font-bold ${config.titleColor} leading-tight`}>
            {config.title}
          </p>
          <p className={`text-xs font-medium ${config.textColor} mt-1`}>
            {message}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WarningBanner;
