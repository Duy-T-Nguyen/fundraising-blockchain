import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  message: string;
  type: NotificationType;
  isVisible: boolean;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: {
      glow: 'shadow-emerald-900/40',
      border: 'border-emerald-500/30',
      accent: 'bg-emerald-500',
      iconBg: 'bg-emerald-500/15 border-emerald-500/25',
      icon: <CheckCircle className="text-emerald-400" size={18} />,
      label: 'text-emerald-400',
      title: 'SUCCESS',
    },
    error: {
      glow: 'shadow-red-900/40',
      border: 'border-red-500/30',
      accent: 'bg-red-500',
      iconBg: 'bg-red-500/15 border-red-500/25',
      icon: <AlertCircle className="text-red-400" size={18} />,
      label: 'text-red-400',
      title: 'ERROR',
    },
    info: {
      glow: 'shadow-blue-900/40',
      border: 'border-blue-500/30',
      accent: 'bg-blue-500',
      iconBg: 'bg-blue-500/15 border-blue-500/25',
      icon: <Info className="text-blue-400" size={18} />,
      label: 'text-blue-400',
      title: 'INFO',
    },
  }[type];

  return (
    <div className="fixed top-24 right-6 z-[200] animate-in slide-in-from-right duration-500">
      <div className={`relative min-w-[340px] max-w-sm bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 backdrop-blur-2xl border ${styles.border} rounded-2xl shadow-2xl ${styles.glow} overflow-hidden`}>
        {/* Left accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.accent} opacity-80`} />

        <div className="flex gap-4 px-5 pt-5 pb-4">
          {/* Icon */}
          <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border ${styles.iconBg}`}>
            {styles.icon}
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 ${styles.label}`}>
              {styles.title}
            </p>
            <p className="text-sm font-semibold text-white/80 leading-snug break-words">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-[2px] bg-white/5">
          <div className={`h-full ${styles.accent} opacity-60 animate-progress-shrink origin-left`} />
        </div>
      </div>
    </div>
  );
};

export default Notification;
