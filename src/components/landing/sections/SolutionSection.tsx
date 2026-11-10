import { motion } from "framer-motion";
import { CalendarCheck2, Building2, ClipboardCheck } from "lucide-react";
import FeatureCard from "@/components/landing/features/FeatureCard";
import type { FeatureCardData } from "@/components/landing/features/FeatureCard";

const SOLUTION_CARDS: FeatureCardData[] = [
	{
		icon: CalendarCheck2,
		iconBg: "bg-emerald-100",
		iconColor: "text-emerald-600",
		accent: "bg-emerald-500",
		title: "Timetabling",
		description:
			"AI-powered constraint solver generates conflict-free lecture and exam schedules automatically, respecting venue rules and cohort structure.",
		href: "#timetabling",
	},
	{
		icon: Building2,
		iconBg: "bg-blue-100",
		iconColor: "text-blue-600",
		accent: "bg-blue-500",
		title: "Venue Management",
		description:
			"Every hall, lab, and CBT suite is tracked with its capacity, ownership, access scope, and exam eligibility — so allocation is always accurate.",
		href: "#venues",
	},
	{
		icon: ClipboardCheck,
		iconBg: "bg-violet-100",
		iconColor: "text-violet-600",
		accent: "bg-violet-500",
		title: "Discrepancy Management",
		description:
			"Detect, report, and resolve mismatches between the planned timetable and what actually happens on the ground, with a full audit trail.",
		href: "#discrepancy",
	},
];

export default function SolutionSection() {
	return (
		<section
			id="features"
			className="bg-surface py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24"
		>
			<div className="max-w-6xl mx-auto">
				{/* Section header */}
				<motion.div
					className="text-center mb-14"
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-primary-muted text-primary border border-primary/20">
						Solution at a Glance
					</span>
					<h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
						Three Pillars, <span className="text-primary">One Platform</span>
					</h2>
					<p className="max-w-xl mx-auto text-base text-text-muted leading-relaxed">
						TimeMapper is built around three tightly integrated capabilities
						that eliminate the gaps manual scheduling leaves open.
					</p>
				</motion.div>

				{/* Feature cards */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
					{SOLUTION_CARDS.map((card, index) => (
						<FeatureCard key={card.title} card={card} index={index} />
					))}
				</div>
			</div>
		</section>
	);
}
