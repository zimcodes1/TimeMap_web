import { motion } from "framer-motion";
import {
	CalendarCheck2,
	ShieldCheck,
	BarChart3,
	Smartphone,
} from "lucide-react";
import FeatureCard, { type FeatureCardData } from "./FeatureCard";

const FEATURES: FeatureCardData[] = [
	{
		icon: CalendarCheck2,
		iconBg: "bg-emerald-100",
		iconColor: "text-emerald-600",
		accent: "bg-emerald-500",
		title: "AI-Powered Schedule Generation",
		description:
			"Constraint-aware timetabling engine that eliminates venue clashes, lecturer conflicts, and cohort overlaps automatically in seconds.",
	},
	{
		icon: ShieldCheck,
		iconBg: "bg-blue-100",
		iconColor: "text-blue-600",
		accent: "bg-blue-500",
		title: "Real-Time Conflict Guard",
		description:
			"Every session shift, cancellation, or venue change is validated live. Administrators and lecturers get instant alerts before issues escalate.",
	},
	{
		icon: Smartphone,
		iconBg: "bg-violet-100",
		iconColor: "text-violet-600",
		accent: "bg-violet-500",
		title: "Student & Lecturer Mobile App",
		description:
			"Purpose-built mobile companion for students, class reps, and lecturers, real-time schedule updates, attendance reporting, and push notifications.",
	},
	{
		icon: BarChart3,
		iconBg: "bg-amber-100",
		iconColor: "text-amber-600",
		accent: "bg-amber-500",
		title: "Compliance Analytics Dashboard",
		description:
			"Track lecture hold rates, venue utilization, and unresolved discrepancies with role-scoped analytics across faculties, departments, and programs.",
	},
];

export default function FeaturesSection() {
	return (
		<section
			id="features"
			className="relative w-full bg-background py-24 px-6 overflow-hidden"
		>
			{/* Subtle background grid */}
			<div
				className="absolute inset-0 opacity-[0.035] pointer-events-none"
				style={{
					backgroundImage:
						"linear-gradient(to right, #111827 1px, transparent 1px), linear-gradient(to bottom, #111827 1px, transparent 1px)",
					backgroundSize: "48px 48px",
				}}
			/>

			<div className="relative z-10 max-w-6xl mx-auto">
				{/* Section header */}
				<motion.div
					className="text-center mb-14"
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ duration: 0.55, ease: "easeOut" }}
				>
					<span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-primary-muted text-primary border border-primary/20">
						Platform Overview
					</span>
					<h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
						Everything Academic Scheduling{" "}
						<span className="text-primary">Needs</span>
					</h2>
					<p className="max-w-xl mx-auto text-base text-text-muted leading-relaxed">
						TimeMapper brings together intelligent automation, real-time
						compliance tracking, and mobile accessibility into one unified
						platform.
					</p>
				</motion.div>

				{/* Cards grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
					{FEATURES.map((card, i) => (
						<FeatureCard key={card.title} card={card} index={i} />
					))}
				</div>
			</div>
		</section>
	);
}
