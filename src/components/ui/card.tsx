import * as React from 'react';
import { cn } from '@/lib/utils';
import { Text } from './text';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface-raised text-text-main shadow-sm transition-all',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardTitleProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'> { }

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <Text
      variant="h5"
      weight="semibold"
      color="default"
      className={cn('leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </Text>
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardDescriptionProps extends Omit<React.HTMLAttributes<HTMLParagraphElement>, 'color'> { }

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <Text
      variant="body-sm"
      color="muted"
      className={cn(className)}
      {...props}
    >
      {children}
    </Text>
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}
