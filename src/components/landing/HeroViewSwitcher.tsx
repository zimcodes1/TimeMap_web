import { useRef } from "react";
import { motion } from "framer-motion";

type HeroTab = "mobile" | "admin";

interface HeroViewSwitcherProps {
	activeTab: HeroTab;
	onChange: (tab: HeroTab) => void;
}

const TABS: { id: HeroTab; label: string }[] = [
	{ id: "mobile", label: "Student & Lecturer" },
	{ id: "admin", label: "Admin Dashboard" },
];

export default function HeroViewSwitcher({
	activeTab,
	onChange,
}: HeroViewSwitcherProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	return (
		<div className="flex justify-center mb-10">
			<div
				ref={containerRef}
				className="relative flex items-center gap-1 p-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20"
			>
				{TABS.map((tab) => {
					const isActive = tab.id === activeTab;
					return (
						<button
							key={tab.id}
							onClick={() => onChange(tab.id)}
							className="relative z-10 px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 cursor-pointer"
							style={{ color: isActive ? "#169946" : "rgba(255,255,255,0.75)" }}
						>
							{/* Animated pill background */}
							{isActive && (
								<motion.div
									layoutId="tab-pill"
									className="absolute inset-0 rounded-full bg-white"
									transition={{ type: "spring", stiffness: 380, damping: 32 }}
								/>
							)}
							<span className="relative">{tab.label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
