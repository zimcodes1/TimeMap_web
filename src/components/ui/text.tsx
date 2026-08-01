import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const textVariants = cva('transition-colors', {
  variants: {
    variant: {
      h1: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
      h2: 'text-2xl sm:text-3xl font-bold tracking-tight',
      h3: 'text-xl sm:text-2xl font-bold',
      h4: 'text-lg sm:text-xl font-semibold',
      h5: 'text-base sm:text-lg font-semibold',
      h6: 'text-sm sm:text-base font-semibold',
      lead: 'text-base sm:text-lg font-normal text-text-muted',
      'body-lg': 'text-base font-normal',
      body: 'text-sm font-normal',
      'body-sm': 'text-xs font-normal',
      caption: 'text-xs font-medium text-text-muted',
      overline: 'text-[10px] uppercase tracking-wider font-semibold text-text-subtle',
      code: 'font-mono text-xs px-1.5 py-0.5 rounded bg-surface-raised border border-border text-text-main',
    },
    color: {
      default: 'text-text-main',
      muted: 'text-text-muted',
      subtle: 'text-text-subtle',
      primary: 'text-primary',
      danger: 'text-danger',
      success: 'text-success',
      warning: 'text-warning',
      info: 'text-info',
      inverse: 'text-text-inverse',
      inherit: 'text-inherit',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    truncate: {
      true: 'truncate',
    },
    maxLines: {
      1: 'line-clamp-1',
      2: 'line-clamp-2',
      3: 'line-clamp-3',
      4: 'line-clamp-4',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'default',
    align: 'left',
  },
});

type ElementType = React.ElementType;

const defaultElementMap: Record<NonNullable<VariantProps<typeof textVariants>['variant']>, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  lead: 'p',
  'body-lg': 'p',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
  overline: 'span',
  code: 'code',
};

export interface TextProps<T extends ElementType = 'p'>
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof textVariants> {
  as?: T;
  children?: React.ReactNode;
}

export const Text = React.forwardRef(
  <T extends ElementType = 'p'>(
    {
      className,
      variant = 'body',
      color,
      weight,
      align,
      truncate,
      maxLines,
      as,
      children,
      ...props
    }: TextProps<T>,
    ref: React.Ref<HTMLElement>
  ) => {
    const Component = (as || (variant ? defaultElementMap[variant] : 'p')) as ElementType;

    return (
      <Component
        ref={ref}
        className={cn(textVariants({ variant, color, weight, align, truncate, maxLines }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';
