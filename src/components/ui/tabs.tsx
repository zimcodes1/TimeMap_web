import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  count?: number;
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

interface TabSwitcherProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TabSwitcher<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className,
  size = 'md',
}: TabSwitcherProps<T>) {
  return (
    <div
      className={cn(
        'bg-surface-raised border border-border p-1.5 rounded-2xl flex flex-wrap items-center gap-1.5 shadow-xs',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-xl text-sm font-semibold transition-all cursor-pointer select-none',
              size === 'sm' && 'px-3 py-1.5 text-xs',
              size === 'md' && 'px-4 py-2 text-sm',
              size === 'lg' && 'px-5 py-2.5 text-base',
              isActive
                ? 'bg-primary text-white shadow-sm border border-primary font-bold'
                : 'bg-surface text-text-muted hover:bg-secondary hover:text-text-main border border-border/70 shadow-xs'
            )}
          >
            {Icon && <Icon size={size === 'sm' ? 14 : 16} className={isActive ? 'text-white' : 'text-text-muted'} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-bold transition-colors',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-raised text-text-main border border-border'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
