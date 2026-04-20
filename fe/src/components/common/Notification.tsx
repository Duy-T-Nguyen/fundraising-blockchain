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
      const timer = setTimeout(onClose, 5000); // Auto-close after 5s
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/50',
      icon: <CheckCircle className="text-emerald-500" size={20} />,
      title: 'Success',
      accent: 'bg-emerald-500'
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/50',
      icon: <AlertCircle className="text-red-500" size={20} />,
      title: 'Error Occurred',
      accent: 'bg-red-500'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/50',
      icon: <Info className="text-blue-500" size={20} />,
      title: 'Blockchain Update',
      accent: 'bg-blue-500'
    }
  }[type];

  return (
    <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right duration-500">
      <div className={`relative min-w-[320px] max-w-md ${styles.bg} backdrop-blur-2xl border ${styles.border} rounded-2xl shadow-2xl p-5 overflow-hidden group`}>
        {/* Left Accent Bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.accent}`} />
        
        <div className="flex gap-4">
          <div className="shrink-0 pt-1">
            {styles.icon}
          </div>
          
          <div className="flex-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">
              {styles.title}
            </h4>
            <p className="text-sm font-extrabold text-slate-800 leading-snug">
              {message}
            </p>
          </div>

          <button 
            onClick={onClose}
            className="shrink-0 h-6 w-6 flex items-center justify-center rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Closing Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/5">
          <div className={`h-full ${styles.accent} animate-progress-shrink origin-left`} />
        </div>
      </div>
    </div>
  );
};

export default Notification;
