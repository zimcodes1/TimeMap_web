import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "@/components/elements/logo";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
	{ label: "Features", href: "#features" },
	{ label: "How It Works", href: "#how-it-works" },
	{ label: "About", href: "#about" },
];

export default function NavigationBar() {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<motion.div
			className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-9/10 max-w-5xl"
			initial={{ y: -20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
		>
			{/* Main bar */}
			<div className="flex items-center justify-between px-5 py-2.5 rounded-full bg-primary-foreground backdrop-blur-md shadow-sm">
				{/* Logo + brand */}
				<div className="flex items-center gap-2.5">
					<Logo color="#169946" size={28} />
					<span className="text-base font-bold text-primary select-none">
						TimeMapper
					</span>
				</div>

				{/* Center nav links — desktop only */}
				<nav className="hidden md:flex items-center gap-6">
					{NAV_LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="text-sm font-semibold text-text-muted hover:text-text-main transition-colors"
						>
							{link.label}
						</a>
					))}
				</nav>

				{/* Right actions — desktop */}
				<div className="hidden md:flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => (window.location.href = "/login")}
					>
						Sign In
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={() => (window.location.href = "/login")}
					>
						Get Started
					</Button>
				</div>

				{/* Hamburger — mobile */}
				<button
					className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
					onClick={() => setMobileOpen((v) => !v)}
					aria-label="Toggle menu"
				>
					{mobileOpen ? (
						<X size={20} className="text-text-main" />
					) : (
						<Menu size={20} className="text-text-main" />
					)}
				</button>
			</div>

			{/* Mobile dropdown */}
			{mobileOpen && (
				<motion.div
					className="mt-2 rounded-2xl bg-primary-foreground backdrop-blur-md shadow-xl px-4 py-4 flex flex-col gap-3 md:hidden"
					initial={{ opacity: 0, y: -8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2 }}
				>
					{NAV_LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="text-sm font-semibold text-text-muted hover:text-text-main transition-colors py-1"
							onClick={() => setMobileOpen(false)}
						>
							{link.label}
						</a>
					))}
					<div className="border-t border-border pt-3 flex flex-col gap-2">
						<Button
							variant="outline"
							size="sm"
							fullWidth
							onClick={() => (window.location.href = "/login")}
						>
							Sign In
						</Button>
						<Button
							variant="primary"
							size="sm"
							fullWidth
							onClick={() => (window.location.href = "/login")}
						>
							Get Started
						</Button>
					</div>
				</motion.div>
			)}
		</motion.div>
	);
}
