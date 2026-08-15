import React from 'react';

/**
 * Badge — DESIGN.md: pill shape, semantic colors for complaint status
 */
const STATUS_STYLES = {
  open:         'bg-blue-100 text-blue-700',
  acknowledged: 'bg-purple-100 text-purple-700',
  in_progress:  'bg-yellow-100 text-yellow-700',
  resolved:     'bg-green-100 text-green-700',
  closed:       'bg-secondary-100 text-secondary-600',
  rejected:     'bg-red-100 text-red-600',
};

const PRIORITY_STYLES = {
  low:    'bg-secondary-100 text-secondary-600',
  medium: 'bg-blue-100 text-blue-700',
  high:   'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const CATEGORY_STYLES = {
  roads:        'bg-stone-100 text-stone-700',
  water:        'bg-cyan-100 text-cyan-700',
  electricity:  'bg-yellow-100 text-yellow-700',
  sanitation:   'bg-green-100 text-green-700',
  parks:        'bg-emerald-100 text-emerald-700',
  streetlights: 'bg-amber-100 text-amber-700',
  drainage:     'bg-teal-100 text-teal-700',
  noise:        'bg-rose-100 text-rose-700',
  encroachment: 'bg-red-100 text-red-700',
  other:        'bg-secondary-100 text-secondary-600',
};

const VARIANT_STYLES = {
  default: 'bg-secondary-100 text-secondary-700',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error:   'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
};

function Badge({
  children,
  variant = 'default',
  status,
  priority,
  category,
  dot = false,
  className = '',
  ...props
}) {
  let colorClass = VARIANT_STYLES[variant] ?? VARIANT_STYLES.default;
  if (status)   colorClass = STATUS_STYLES[status]   ?? colorClass;
  if (priority) colorClass = PRIORITY_STYLES[priority] ?? colorClass;
  if (category) colorClass = CATEGORY_STYLES[category] ?? colorClass;

  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        colorClass,
        className,
      ].join(' ')}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

export const StatusBadge = ({ status, ...props }) => (
  <Badge status={status} {...props}>
    {status?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
  </Badge>
);

export const PriorityBadge = ({ priority, ...props }) => (
  <Badge priority={priority} dot {...props}>
    {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
  </Badge>
);

export const CategoryBadge = ({ category, ...props }) => (
  <Badge category={category} {...props}>
    {category?.charAt(0).toUpperCase() + category?.slice(1)}
  </Badge>
);

export default Badge;
