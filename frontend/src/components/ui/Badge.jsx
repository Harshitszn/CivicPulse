import React from 'react';

/**
 * Badge — DESIGN.md: pill shape, semantic colors for complaint status
 */
const STATUS_STYLES = {
  open:         'bg-blue-100 text-blue-800 border border-blue-200',
  reported:     'bg-blue-100 text-blue-800 border border-blue-200',
  verified:     'bg-purple-100 text-purple-800 border border-purple-200',
  assigned:     'bg-indigo-100 text-indigo-800 border border-indigo-200',
  acknowledged: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  in_progress:  'bg-amber-100 text-amber-800 border border-amber-200',
  resolved:     'bg-emerald-100 text-emerald-800 border border-emerald-200',
  closed:       'bg-secondary-100 text-secondary-600 border border-secondary-200',
  rejected:     'bg-red-100 text-red-800 border border-red-200',
};

const STATUS_LABELS = {
  open:         'Reported',
  reported:     'Reported',
  verified:     'Verified',
  assigned:     'Assigned',
  acknowledged: 'Assigned',
  in_progress:  'In Progress',
  resolved:     'Resolved',
  rejected:     'Rejected',
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
  garbage:      'bg-green-100 text-green-700',
  sanitation:   'bg-green-100 text-green-700',
  parks:        'bg-emerald-100 text-emerald-700',
  infra:        'bg-emerald-100 text-emerald-700',
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
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs',
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

export const StatusBadge = ({ status, ...props }) => {
  const label = STATUS_LABELS[status] || status?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Badge status={status} dot {...props}>
      {label}
    </Badge>
  );
};

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
