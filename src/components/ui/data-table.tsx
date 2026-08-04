import React from 'react';
import { Table } from './table';
import { Text } from './text';
import { Button } from './button';
import { Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableProps<T> {
  columns: {
    header: string;
    accessor?: keyof T | ((row: T) => React.ReactNode);
    className?: string;
    align?: 'left' | 'center' | 'right';
  }[];
  data: T[];
  keyExtractor: (item: T) => string;
  renderRow?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  emptyTitle?: string;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  renderRow,
  emptyMessage = 'No records found matching your filters.',
  emptyTitle = 'No Results',
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  className,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  return (
    <div className={cn('space-y-4', className)}>
      <Table>
        <thead>
          <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={cn(
                  'py-3 px-3',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          {paginatedData.length > 0 ? (
            paginatedData.map((item) =>
              renderRow ? (
                renderRow(item)
              ) : (
                <tr key={keyExtractor(item)} className="hover:bg-surface-raised transition-colors">
                  {columns.map((col, idx) => (
                    <td
                      key={idx}
                      className={cn(
                        'py-3 px-3 align-middle',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                        col.className
                      )}
                    >
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : (item[col.accessor as keyof T] as unknown as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              )
            )
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-12 px-4 text-center">
                <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                  <div className="p-3 rounded-full bg-surface-raised border border-border text-text-subtle">
                    <Inbox size={32} />
                  </div>
                  <Text variant="h6" weight="bold" className="text-text-main">
                    {emptyTitle}
                  </Text>
                  <Text variant="body-sm" color="muted">
                    {emptyMessage}
                  </Text>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination Footer */}
      {data.length > 0 && onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1 text-xs text-text-muted">
          <div>
            Showing <span className="font-bold text-text-main">{startIndex + 1}</span> to{' '}
            <span className="font-bold text-text-main">
              {Math.min(startIndex + pageSize, data.length)}
            </span>{' '}
            of <span className="font-bold text-text-main">{data.length}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="h-8 px-2.5 cursor-pointer disabled:opacity-40"
            >
              <ChevronLeft size={14} className="mr-1" /> Previous
            </Button>
            <span className="font-semibold text-text-main px-1">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="h-8 px-2.5 cursor-pointer disabled:opacity-40"
            >
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
