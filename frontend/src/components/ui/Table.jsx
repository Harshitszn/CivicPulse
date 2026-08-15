import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Table — clean neutral style per DESIGN.md
 * Supports sortable columns, hover rows, and empty state
 */
function Table({ columns, data = [], onSort, sortKey, sortDir = 'asc', emptyMessage = 'No data found', loading = false, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-secondary-200 ${className}`}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-secondary-50 border-b border-secondary-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  'px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap',
                  col.sortable && onSort ? 'cursor-pointer select-none hover:text-secondary-700' : '',
                  col.className ?? '',
                ].join(' ')}
                onClick={() => col.sortable && onSort?.(col.key)}
                style={{ width: col.width }}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && onSort && (
                    <span className="flex flex-col">
                      <ChevronUp
                        size={10}
                        className={sortKey === col.key && sortDir === 'asc' ? 'text-primary-600' : 'text-secondary-300'}
                      />
                      <ChevronDown
                        size={10}
                        className={sortKey === col.key && sortDir === 'desc' ? 'text-primary-600' : 'text-secondary-300'}
                      />
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-secondary-400 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin-slow" />
                  Loading...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-secondary-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id ?? row._id ?? i}
                className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors duration-fast"
                onClick={row._onClick}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-secondary-700 ${col.cellClassName ?? ''}`}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
