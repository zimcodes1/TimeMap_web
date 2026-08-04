import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { Input } from './input';
import { Select } from './select';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

export interface FilterOption {
  label: string;
  value: string;
}

export interface ToolbarFilter {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface TableToolbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: ToolbarFilter[];
  startDate?: string;
  onStartDateChange?: (date: string) => void;
  endDate?: string;
  onEndDateChange?: (date: string) => void;
  groupBy?: string;
  onGroupByChange?: (value: string) => void;
  groupByOptions?: FilterOption[];
  onResetFilters?: () => void;
  totalCount?: number;
  filteredCount?: number;
  className?: string;
  children?: React.ReactNode;
}

export function TableToolbar({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  groupBy,
  onGroupByChange,
  groupByOptions,
  onResetFilters,
  totalCount,
  filteredCount,
  className,
  children,
}: TableToolbarProps) {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    filters.some((f) => Boolean(f.value)) ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    Boolean(groupBy);

  return (
    <div
      className={cn(
        'p-4 bg-surface rounded-2xl border border-border space-y-3 shadow-xs',
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search
              size={16}
              className="absolute z-1 left-3 top-1/2 -translate-y-1/2 text-text-subtle"
            />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-surface-raised border-border"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-main p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Action Controls / Additional buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Custom children */}
          {children}

          {/* Group By selector if provided */}
          {groupByOptions && onGroupByChange && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-text-muted font-semibold shrink-0">Group By:</span>
              <Select
                value={groupBy || ''}
                onChange={(e) => onGroupByChange(e.target.value)}
                className="h-9 py-1 px-2 text-xs bg-surface-raised border-border"
              >
                {groupByOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Total badge */}
          {totalCount !== undefined && (
            <Badge variant="default" className="h-9 px-3 text-xs bg-surface-raised border-border text-text-main">
              {filteredCount !== undefined && filteredCount !== totalCount
                ? `${filteredCount} of ${totalCount} results`
                : `${totalCount} records`}
            </Badge>
          )}
        </div>
      </div>

      {/* Filter Dropdowns & Date Range Row */}
      {(filters.length > 0 || onStartDateChange || onEndDateChange) && (
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/60">
          <div className="flex items-center gap-1 text-xs font-semibold text-text-muted mr-1">
            <Filter size={14} /> Filters:
          </div>

          {/* Filters array */}
          {filters.map((filter) => (
            <div key={filter.id} className="min-w-[130px]">
              <Select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="h-8 py-1 px-2 text-xs bg-surface-raised border-border"
              >
                <option value="">All {filter.label}s</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          ))}

          {/* Start Date */}
          {onStartDateChange && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-text-muted">From:</span>
              <Input
                type="date"
                value={startDate || ''}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="h-8 text-xs bg-surface-raised border-border py-0.5 px-2"
              />
            </div>
          )}

          {/* End Date */}
          {onEndDateChange && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-text-muted">To:</span>
              <Input
                type="date"
                value={endDate || ''}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="h-8 text-xs bg-surface-raised border-border py-0.5 px-2"
              />
            </div>
          )}

          {/* Reset Filters */}
          {hasActiveFilters && onResetFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-8 text-xs px-2.5 text-danger border-danger-surface hover:bg-danger-surface cursor-pointer ml-auto"
            >
              <RotateCcw size={12} className="mr-1" /> Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
