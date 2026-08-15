import React from 'react';

/**
 * Card component — DESIGN.md: uniform padding, radius 12px, subtle shadow, no heavy depth
 * variants: default | flat | elevated
 */
function Card({ children, className = '', variant = 'default', padding = true, onClick, ...props }) {
  const base = 'rounded-lg transition-shadow duration-normal';

  const variants = {
    default:  'bg-surface border border-secondary-200 shadow-card',
    flat:     'bg-surface border border-secondary-200',
    elevated: 'bg-surface border border-secondary-200 shadow-raised',
    feed:     'bg-surface border border-secondary-200 shadow-card hover:shadow-raised cursor-pointer',
  };

  return (
    <div
      className={[
        base,
        variants[variant] ?? variants.default,
        padding ? 'p-6' : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

function CardTitle({ children, className = '' }) {
  return <h3 className={`text-base font-semibold text-secondary-800 ${className}`}>{children}</h3>;
}

function CardSubtitle({ children, className = '' }) {
  return <p className={`text-sm text-secondary-500 mt-0.5 ${className}`}>{children}</p>;
}

function CardBody({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-secondary-100 flex items-center gap-3 ${className}`}>
      {children}
    </div>
  );
}

Card.Header   = CardHeader;
Card.Title    = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Body     = CardBody;
Card.Footer   = CardFooter;

export default Card;
