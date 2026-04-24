import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface NotificationContextValue {
    success: (message: string) => void;
    error: (message: string) => void;
    warn: (message: string) => void;
    info: (message: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const NotificationContext = createContext<NotificationContextValue | null>(null);

// ── Toast Item ────────────────────────────────────────────────────────────────
const STYLE_MAP: Record<ToastType, {
    border: string; accent: string;
    iconBg: string; iconColor: string;
    icon: React.ReactNode; label: string; labelColor: string;
}> = {
    success: {
        border: 'border-emerald-500/30', accent: 'bg-emerald-500',
        iconBg: 'bg-emerald-500/15 border border-emerald-500/25', iconColor: 'text-emerald-400',
        icon: <CheckCircle className="text-emerald-400 shrink-0" size={18} />,
        label: 'SUCCESS', labelColor: 'text-emerald-400',
    },
    error: {
        border: 'border-red-500/30', accent: 'bg-red-500',
        iconBg: 'bg-red-500/15 border border-red-500/25', iconColor: 'text-red-400',
        icon: <AlertCircle className="text-red-400 shrink-0" size={18} />,
        label: 'ERROR', labelColor: 'text-red-400',
    },
    warning: {
        border: 'border-amber-400/30', accent: 'bg-amber-400',
        iconBg: 'bg-amber-400/15 border border-amber-400/25', iconColor: 'text-amber-400',
        icon: <AlertTriangle className="text-amber-400 shrink-0" size={18} />,
        label: 'WARNING', labelColor: 'text-amber-400',
    },
    info: {
        border: 'border-blue-500/30', accent: 'bg-blue-500',
        iconBg: 'bg-blue-500/15 border border-blue-500/25', iconColor: 'text-blue-400',
        icon: <Info className="text-blue-400 shrink-0" size={18} />,
        label: 'INFO', labelColor: 'text-blue-400',
    },
};

interface ToastItemProps {
    toast: Toast;
    onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
    const s = STYLE_MAP[toast.type];
    return (
        <div
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className={`relative min-w-[320px] max-w-sm bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 backdrop-blur-2xl border ${s.border} rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right-4 duration-300`}
        >
            {/* Left accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${s.accent} opacity-80`} />

            <div className="flex gap-4 px-5 pt-5 pb-4 pl-6">
                <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                    {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 ${s.labelColor}`}>
                        {s.label}
                    </p>
                    <p className="text-sm font-semibold text-white/80 leading-snug break-words">
                        {toast.message}
                    </p>
                </div>
                <button
                    onClick={() => onClose(toast.id)}
                    aria-label="Dismiss notification"
                    className="shrink-0 h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Shrinking progress bar */}
            <div className="h-[2px] bg-white/5">
                <div
                    className={`h-full ${s.accent} opacity-60 origin-left`}
                    style={{ animation: 'toast-shrink 4s linear forwards' }}
                />
            </div>
        </div>
    );
};

// ── Provider ──────────────────────────────────────────────────────────────────
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const counterRef = useRef(0);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const push = useCallback((type: ToastType, message: string) => {
        setToasts(prev => {
            // Deduplicate: skip if same type+message is already visible
            if (prev.some(t => t.type === type && t.message === message)) return prev;
            // Cap at 4 toasts
            const next = prev.length >= 4 ? prev.slice(1) : prev;
            const id = `toast-${++counterRef.current}`;
            // Auto-dismiss after 4s
            setTimeout(() => dismiss(id), 4000);
            return [...next, { id, type, message }];
        });
    }, [dismiss]);

    const ctx: NotificationContextValue = {
        success: (msg) => push('success', msg),
        error: (msg) => push('error', msg),
        warn: (msg) => push('warning', msg),
        info: (msg) => push('info', msg),
    };

    return (
        <NotificationContext.Provider value={ctx}>
            {children}
            {/* Toast container */}
            <div
                className="fixed top-24 right-6 z-[200] flex flex-col gap-3 pointer-events-none"
                aria-label="Notifications"
            >
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onClose={dismiss} />
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useNotification = (): NotificationContextValue => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotification must be used inside <NotificationProvider>');
    return ctx;
};
