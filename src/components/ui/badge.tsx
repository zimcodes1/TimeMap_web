import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors border',
  {
    variants: {
      variant: {
        default:
          'bg-primary-muted text-primary border-primary/30',
        primary:
          'bg-primary-muted text-primary border-primary/30',
        secondary:
          'bg-secondary text-text-main border-border',
        success:
          'bg-success-surface text-success border-success/30',
        warning:
          'bg-warning-surface text-warning border-warning/30',
        danger:
          'bg-danger-surface text-danger border-danger/30',
        info:
          'bg-info-surface text-info border-info/30',
        outline:
          'bg-transparent text-text-muted border-border-strong',
      },
      size: {
        sm: 'px-2.5 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

export function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
