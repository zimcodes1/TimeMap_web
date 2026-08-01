import { Toaster as SonnerToaster, toast } from "sonner";

export function Toaster() {
	return (
		<SonnerToaster
			theme="light"
			position="top-right"
			toastOptions={{
				style: {
					borderRadius: "0.75rem",
					fontSize: "0.875rem",
				},
				className:
					"font-sans border border-border bg-surface text-text-main shadow-lg",
			}}
		/>
	);
}

export { toast };
