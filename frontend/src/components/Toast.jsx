import { useState, useEffect } from 'react';

// Toast notification component with auto-dismiss
export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, 300); // Match exit animation duration
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    const typeStyles = {
        success: 'bg-green-500/20 border-green-500/50 text-green-400',
        error: 'bg-red-500/20 border-red-500/50 text-red-400',
        warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
        info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    };

    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info',
    };

    return (
        <div
            className={`
                fixed bottom-6 right-6 z-50 
                flex items-center gap-3 
                px-4 py-3 rounded-lg 
                border backdrop-blur-lg
                ${typeStyles[type]}
                ${isExiting ? 'animate-fade-out-down' : 'animate-fade-in-up'}
                shadow-lg max-w-md
            `}
        >
            <span className="material-symbols-outlined text-xl">{icons[type]}</span>
            <p className="text-sm font-medium flex-1">{message}</p>
            <button
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => {
                        setIsVisible(false);
                        onClose?.();
                    }, 300);
                }}
                className="material-symbols-outlined text-lg hover:opacity-70 transition-opacity"
            >
                close
            </button>
        </div>
    );
}

// Toast container for managing multiple toasts
export function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

// Custom hook for managing toasts
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return {
        toasts,
        addToast,
        removeToast,
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
    };
}
