import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
	{
		variants: {
			variant: {
				primary:
					"bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover font-semibold",
				secondary:
					"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-hover border border-border",
				outline:
					"border border-border-strong bg-transparent text-text-main hover:bg-surface-raised",
				ghost: "text-text-muted hover:bg-surface-raised hover:text-text-main",
				danger:
					"bg-danger text-danger-foreground shadow-sm hover:bg-danger-hover font-semibold",
				warning:
					"bg-warning text-warning-foreground shadow-sm hover:bg-warning-hover font-semibold",
				muted:
					"bg-primary-muted text-primary hover:bg-primary-muted/80 border border-primary/20 font-medium",
			},
			size: {
				sm: "h-8 rounded-md px-3 text-xs gap-1.5",
				md: "h-10 px-4 py-2 text-sm gap-2",
				lg: "h-12 rounded-xl px-6 text-base gap-2.5",
				icon: "h-10 w-10 p-0",
			},
			fullWidth: {
				true: "w-full",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
			fullWidth: false,
		},
	},
);

export interface ButtonProps
	extends
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	isLoading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			fullWidth,
			isLoading = false,
			leftIcon,
			rightIcon,
			children,
			disabled,
			...props
		},
		ref,
	) => {
		return (
			<button
				className={
					cn(buttonVariants({ variant, size, fullWidth, className })) +
					" cursor-pointer"
				}
				ref={ref}
				disabled={disabled || isLoading}
				{...props}
			>
				{isLoading ? (
					<Loader2 className="h-4 w-4 animate-spin text-current" />
				) : (
					leftIcon
				)}
				{children}
				{!isLoading && rightIcon}
			</button>
		);
	},
);
Button.displayName = "Button";
