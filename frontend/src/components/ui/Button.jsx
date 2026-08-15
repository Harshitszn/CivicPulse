import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button component — DESIGN.md visual identity
 * variants: primary | secondary | ghost | danger | outline
 * sizes: sm | md | lg
 */
const Button = React.forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon: Icon,
    iconRight: IconRight,
    fullWidth = false,
    className = '',
    disabled,
    ...props
  },
  ref
) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-fast cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 rounded-md';

  const variants = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-subtle hover:shadow-card',
    secondary:
      'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 active:bg-secondary-300',
    ghost:
      'bg-transparent text-secondary-600 hover:bg-secondary-100 hover:text-secondary-700 border border-secondary-200',
    danger:
      'bg-error text-white hover:bg-red-700 active:bg-red-800 shadow-subtle',
    outline:
      'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50',
    success:
      'bg-success text-white hover:bg-green-700 shadow-subtle',
  };

  const sizes = {
    sm:  'px-3 py-1.5 text-xs min-h-[36px]',
    md:  'px-4 py-2 text-sm min-h-[44px]',
    lg:  'px-6 py-3 text-base min-h-[48px]',
  };

  return (
    <button
      ref={ref}
      className={[
        base,
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
      {!loading && IconRight ? <IconRight size={16} /> : null}
    </button>
  );
});

export default Button;
