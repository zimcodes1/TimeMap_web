import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import NavigationBar from "@/components/landing/NavigationBar";
import HeroViewSwitcher from "@/components/landing/HeroViewSwitcher";
import HeroTextContent from "@/components/landing/HeroTextContent";
import MobileAppPreview from "@/components/landing/mobile-preview/MobileAppPreview";
import AdminDashboardPreview from "@/components/landing/admin-preview/AdminDashboardPreview";
import HeroBackground from "@/components/landing/HeroBackground";
import { LucideShieldClose } from "lucide-react";

type HeroTab = "mobile" | "admin";

const previewVariants: Variants = {
	initial: { opacity: 0, x: 40, scale: 0.97 },
	animate: {
		opacity: 1,
		x: 0,
		scale: 1,
		transition: { duration: 0.45, ease: "easeOut" },
	},
	exit: {
		opacity: 0,
		x: -30,
		scale: 0.97,
		transition: { duration: 0.28, ease: "easeIn" },
	},
};

const heroContentVariants: Variants = {
	initial: { opacity: 0, y: 32 },
	animate: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 },
	},
};

export default function HeroSection() {
	const [activeTab, setActiveTab] = useState<HeroTab>("mobile");

	return (
		<section className="relative w-full min-h-fit bg-primary overflow-hidden">
			{/* Navigation */}
			<NavigationBar />

			{/* Spiced Dynamic Hero Background with Architectural Grid, Ambient Glow & Floating Themed Icons */}
			<HeroBackground />

			{/* Hero content */}
			<motion.div
				className="relative z-10 flex flex-col items-center pt-30 px-2 sm:px-6 max-w-7xl mx-auto"
				variants={heroContentVariants}
				initial="initial"
				animate="animate"
			>
				<LucideShieldClose
					size={200}
					className={`text-primary-foreground/10 absolute -right-25 bottom-0 sm:hidden ${activeTab == "admin" ? " " : "hidden"}`}
				></LucideShieldClose>
				{/* Tab switcher */}
				<HeroViewSwitcher activeTab={activeTab} onChange={setActiveTab} />

				{/* Two-column layout */}
				<div
					className={`flex gap-12 flex-col w-full ${activeTab !== "admin" ? "sm:flex-row items-start justify-center lg:gap-16" : ""}`}
				>
					{/* Left — text */}
					<HeroTextContent activeTab={activeTab} />

					{/* Right — preview */}
					<div
						className={`flex justify-center items-center pb-5 ${activeTab == "admin" ? "w-full" : "w-full sm:max-w-fit"}`}
					>
						<AnimatePresence mode="wait">
							{activeTab === "mobile" ? (
								<motion.div
									key="mobile"
									variants={previewVariants}
									initial="initial"
									animate="animate"
									exit="exit"
								>
									<MobileAppPreview />
								</motion.div>
							) : (
								<motion.div
									key="admin"
									variants={previewVariants}
									initial="initial"
									animate="animate"
									exit="exit"
									className="w-full flex justify-center items-center"
								>
									<AdminDashboardPreview />
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</motion.div>
		</section>
	);
}
