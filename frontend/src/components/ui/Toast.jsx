import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const TOAST_ICONS = {
  success: CheckCircle2,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
};

const TOAST_STYLES = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
};

const ICON_STYLES = {
  success: 'text-success',
  error:   'text-error',
  warning: 'text-warning',
  info:    'text-info',
};

function Toast({ id, message, type = 'info', onRemove }) {
  const Icon = TOAST_ICONS[type] ?? Info;

  return (
    <div
      className={[
        'flex items-start gap-3 px-4 py-3 rounded-lg border shadow-raised',
        'animate-slide-in-right min-w-[280px] max-w-sm',
        TOAST_STYLES[type] ?? TOAST_STYLES.info,
      ].join(' ')}
      role="alert"
      aria-live="polite"
    >
      <Icon size={18} className={`flex-shrink-0 mt-0.5 ${ICON_STYLES[type]}`} />
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default Toast;
