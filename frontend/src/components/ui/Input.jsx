import React from 'react';

/**
 * Input component — DESIGN.md: rectangular, 44px touch target, primary focus ring
 */
const Input = React.forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    iconRight: IconRight,
    className = '',
    id,
    fullWidth = true,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-secondary-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none">
            <Icon size={16} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full px-3 py-2 text-sm bg-surface border rounded-md text-secondary-800 placeholder-secondary-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'transition-colors duration-fast min-h-[44px]',
            error ? 'border-error focus:ring-error' : 'border-secondary-300',
            Icon ? 'pl-9' : '',
            IconRight ? 'pr-9' : '',
            className,
          ].join(' ')}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {IconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">
            <IconRight size={16} />
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-error flex items-center gap-1">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-secondary-400">
          {hint}
        </p>
      )}
    </div>
  );
});

/**
 * Textarea component
 */
export const Textarea = React.forwardRef(function Textarea(
  { label, error, hint, className = '', id, rows = 4, ...props },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-secondary-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={[
          'w-full px-3 py-2 text-sm bg-surface border rounded-md text-secondary-800 placeholder-secondary-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'transition-colors duration-fast resize-y',
          error ? 'border-error' : 'border-secondary-300',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-secondary-400">{hint}</p>}
    </div>
  );
});

/**
 * Select component
 */
export const Select = React.forwardRef(function Select(
  { label, error, hint, className = '', id, children, ...props },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-secondary-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={[
          'w-full px-3 py-2 text-sm bg-surface border rounded-md text-secondary-800',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'transition-colors duration-fast min-h-[44px] cursor-pointer',
          error ? 'border-error' : 'border-secondary-300',
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-secondary-400">{hint}</p>}
    </div>
  );
});

export default Input;
