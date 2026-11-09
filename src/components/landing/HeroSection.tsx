import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NavigationBar from "@/components/landing/NavigationBar";
import HeroViewSwitcher from "@/components/landing/HeroViewSwitcher";
import HeroTextContent from "@/components/landing/HeroTextContent";
import MobileAppPreview from "@/components/landing/mobile-preview/MobileAppPreview";
import AdminDashboardPreview from "@/components/landing/admin-preview/AdminDashboardPreview";
import { LucideShieldClose } from "lucide-react";

type HeroTab = "mobile" | "admin";

const previewVariants = {
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

const heroContentVariants = {
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

			{/* Background decorative blobs */}
			<div
				className="absolute -top-30 -right-25 w-125 h-125 rounded-full opacity-10 pointer-events-none"
				style={{
					background: "radial-gradient(circle, #ffffff 0%, transparent 70%)",
				}}
			/>
			<div
				className="absolute -bottom-20 -left-20 w-100 h-100 rounded-full opacity-10 pointer-events-none"
				style={{
					background: "radial-gradient(circle, #d1fae5 0%, transparent 70%)",
				}}
			/>

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
					className={`flex gap-12 flex-col w-full ${activeTab !== "admin" ? "lg:flex-row items-start justify-center lg:gap-16" : ""}`}
				>
					{/* Left — text */}
					<HeroTextContent activeTab={activeTab} />

					{/* Right — preview */}
					<div
						className={`flex justify-center items-center ${activeTab == "admin" ? "w-full" : "w-full sm:max-w-xl"}`}
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
									className="max-sm:hidden w-full flex justify-center items-center"
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
