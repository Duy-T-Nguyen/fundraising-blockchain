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
    border: string; accent: string; borderColor: string;
    icon: React.ReactNode; label: string;
}> = {
    success: {
        border: 'border-emerald-500/40', accent: 'bg-emerald-500', borderColor: '#10b98166',
        icon: <CheckCircle className="text-emerald-500 shrink-0" size={20} />,
        label: 'Success',
    },
    error: {
        border: 'border-red-500/40', accent: 'bg-red-500', borderColor: '#ef444466',
        icon: <AlertCircle className="text-red-500 shrink-0" size={20} />,
        label: 'Error',
    },
    warning: {
        border: 'border-amber-400/40', accent: 'bg-amber-400', borderColor: '#fbbf2466',
        icon: <AlertTriangle className="text-amber-400 shrink-0" size={20} />,
        label: 'Warning',
    },
    info: {
        border: 'border-blue-500/40', accent: 'bg-blue-500', borderColor: '#3b82f666',
        icon: <Info className="text-blue-500 shrink-0" size={20} />,
        label: 'Info',
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
            className="relative min-w-[300px] max-w-md border rounded-2xl shadow-2xl p-5 overflow-hidden animate-in slide-in-from-right-4 duration-300"
            style={{ backgroundColor: '#ffffff', borderColor: s.borderColor }}
        >
            {/* Left accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${s.accent}`} />

            <div className="flex gap-4 pl-2">
                <div className="pt-0.5">{s.icon}</div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60 text-slate-700">
                        {s.label}
                    </p>
                    <p className="text-sm font-extrabold text-slate-800 leading-snug break-words">
                        {toast.message}
                    </p>
                </div>
                <button
                    onClick={() => onClose(toast.id)}
                    aria-label="Dismiss notification"
                    className="shrink-0 h-6 w-6 flex items-center justify-center rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Shrinking progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/5">
                <div
                    className={`h-full ${s.accent} origin-left`}
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
