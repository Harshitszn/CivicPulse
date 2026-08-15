import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    border: 'border-l-4 border-l-emerald-500',
    bar: 'bg-emerald-500',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  error: {
    icon: AlertCircle,
    border: 'border-l-4 border-l-red-500',
    bar: 'bg-red-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-l-4 border-l-amber-500',
    bar: 'bg-amber-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  info: {
    icon: Info,
    border: 'border-l-4 border-l-primary-500',
    bar: 'bg-primary-500',
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary-600',
  },
};

function Toast({ id, message, type = 'info', duration = 4000, onRemove }) {
  const [progress, setProgress] = useState(100);
  const [exiting, setExiting] = useState(false);
  const config = TOAST_CONFIG[type] ?? TOAST_CONFIG.info;
  const Icon = config.icon;

  useEffect(() => {
    if (duration <= 0) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [duration]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onRemove(id), 280);
  };

  return (
    <div
      className={[
        'relative flex items-stretch rounded-xl border border-secondary-200 shadow-raised bg-white overflow-hidden',
        'min-w-[300px] max-w-[380px] w-full',
        config.border,
        exiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0',
        'transition-all duration-300 ease-in-out',
        !exiting ? 'animate-slide-in-right' : '',
      ].join(' ')}
      role="alert"
      aria-live="polite"
    >
      {/* Icon strip */}
      <div className={`flex-shrink-0 flex items-start justify-center w-11 pt-3.5 ${config.iconBg}`}>
        <Icon size={17} className={config.iconColor} />
      </div>

      {/* Text */}
      <div className="flex-1 px-3 py-3 min-w-0">
        <p className="text-sm font-semibold text-secondary-900 leading-snug">{message}</p>
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-2 mt-1 mr-1 self-start rounded-lg text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={13} />
      </button>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-secondary-100">
          <div
            className={`h-full transition-none ${config.bar} opacity-60`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default Toast;
