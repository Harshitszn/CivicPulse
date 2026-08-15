import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * Modal component — centered overlay, dialog shadow, backdrop blur
 * sizes: sm | md | lg | xl | full
 */
function Modal({ isOpen, onClose, title, children, size = 'md', footer, className = '' }) {
  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape') onClose?.(); },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizes = {
    sm:   'max-w-sm',
    md:   'max-w-md',
    lg:   'max-w-lg',
    xl:   'max-w-2xl',
    '2xl':'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={[
          'relative w-full bg-surface rounded-xl shadow-dialog border border-secondary-200 animate-slide-up',
          'flex flex-col max-h-[90vh]',
          sizes[size] ?? sizes.md,
          className,
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-100 flex-shrink-0">
          {title && (
            <h2 id="modal-title" className="text-base font-semibold text-secondary-800">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-md text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors duration-fast"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-secondary-100 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
