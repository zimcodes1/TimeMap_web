import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LostPage() {
	const navigate = useNavigate();

	const handleGoBack = () => {
		if (window.history.length > 1) {
			window.history.back();
		} else {
			navigate({ to: "/dashboard" });
		}
	};

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 px-4 py-12 text-slate-900">
			<div className="max-w-md w-full text-center space-y-8">
				{/* Huge 404 Text */}
				<div className="space-y-2">
					<h1 className="text-8xl sm:text-9xl text-primary/30 font-bold select-none">
						404
					</h1>
					<h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
						Page Not Found
					</h2>
				</div>

				{/* Byline */}
				<p className="text-sm text-slate-600 max-w-sm mx-auto">
					Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
				</p>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
					<Button
						variant="outline"
						size="lg"
						onClick={handleGoBack}
						leftIcon={<ArrowLeft className="w-4 h-4" />}
						className="w-full sm:w-auto min-w-[140px]"
					>
						Go Back
					</Button>

					<Link to="/dashboard" className="w-full sm:w-auto">
						<Button
							variant="primary"
							size="lg"
							leftIcon={<Home className="w-4 h-4" />}
							className="w-full sm:w-auto min-w-[140px]"
						>
							Back to Home
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

export default LostPage;
