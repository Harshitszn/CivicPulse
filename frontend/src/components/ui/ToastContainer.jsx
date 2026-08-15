import React from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';
import { useToast } from '../../context/ToastContext';

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return createPortal(
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onRemove={removeToast} />
      ))}
    </div>,
    document.body
  );
}

export default ToastContainer;
