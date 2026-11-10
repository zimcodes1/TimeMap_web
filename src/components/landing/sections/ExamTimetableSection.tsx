import { motion } from "framer-motion";
import { FileText, Monitor, FlaskConical, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ExamTypeCard {
	Icon: LucideIcon;
	iconBg: string;
	iconColor: string;
	accentBorder: string;
	title: string;
	description: string;
}

const EXAM_TYPE_CARDS: ExamTypeCard[] = [
	{
		Icon: FileText,
		iconBg: "bg-blue-100",
		iconColor: "text-blue-600",
		accentBorder: "border-t-blue-500",
		title: "Written Exam",
		description:
			"Traditional paper exams. Multi-venue allocation when a single hall is insufficient. All venues checked for capacity and eligibility.",
	},
	{
		Icon: Monitor,
		iconBg: "bg-violet-100",
		iconColor: "text-violet-600",
		accentBorder: "border-t-violet-500",
		title: "CBT Exam",
		description:
			"Fixed-seat computer labs. Turn-based allocation splits large cohorts across multiple sittings. Small cohorts from different courses can be safely joined (max 2 per session).",
	},
	{
		Icon: FlaskConical,
		iconBg: "bg-amber-100",
		iconColor: "text-amber-500",
		accentBorder: "border-t-amber-500",
		title: "Lab Practical",
		description:
			"Laboratory practicals require specialist facilities. Eligibility rules ensure only correctly-equipped labs are assigned.",
	},
];

const KEY_RULES = [
	"One course — one exam day, even when that course is shared across multiple departments (e.g., GST courses)",
	"Student-conflict graph derived from course registrations — if two students share a course, those courses never clash on the exam calendar",
	"CBT turns and throughput calculated from actual lab seat counts, not estimates",
	"Small exams safely joined into one CBT session — capped at two distinct courses per sitting",
	"Multi-venue allocation for large cohorts, respecting venue capacity and exam type eligibility",
	"Structured diagnostics when no valid assignment exists — never a silent failure",
];

export default function ExamTimetableSection() {
	return (
		<section
			id="exam-timetabling"
			className="bg-background py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24"
		>
			<div className="max-w-6xl mx-auto">
				{/* Flagship container */}
				<div className="bg-surface border border-border rounded-3xl p-8 sm:p-12">
					{/* Section header */}
					<motion.div
						className="text-center mb-12"
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.5, ease: "easeOut" }}
					>
						<span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-primary-muted text-primary border border-primary/20">
							Exam Timetabling
						</span>
						<h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
							The Optimizer That Handles{" "}
							<span className="text-primary">the Hard Cases</span>
						</h2>
						<p className="max-w-xl mx-auto text-base text-text-muted leading-relaxed">
							Written papers, CBT sessions, and lab practicals each follow
							different rules. TimeMapper handles all three — including the edge
							cases institutions struggle with most.
						</p>
					</motion.div>

					{/* Exam type cards */}
					<motion.div
						className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-60px" }}
						transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
					>
						{EXAM_TYPE_CARDS.map((card, index) => (
							<motion.div
								key={card.title}
								initial={{ opacity: 0, y: 24 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-40px" }}
								transition={{
									duration: 0.4,
									ease: "easeOut" as const,
									delay: index * 0.1,
								}}
								className={`bg-background rounded-2xl border border-t-4 border-border ${card.accentBorder} p-5 flex flex-col gap-3`}
							>
								<div
									className={`relative inline-flex items-center justify-center w-11 h-11 rounded-2xl ${card.iconBg} ring-1 ring-inset ring-white/50 shadow-sm overflow-hidden`}
								>
									<div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
									<card.Icon
										size={20}
										className={`relative z-10 ${card.iconColor}`}
									/>
								</div>
								<h3 className="text-sm font-bold text-text-main">
									{card.title}
								</h3>
								<p className="text-xs text-text-muted leading-relaxed">
									{card.description}
								</p>
							</motion.div>
						))}
					</motion.div>

					{/* Key rules */}
					<motion.div
						className="mb-12"
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-60px" }}
						transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
					>
						<h3 className="text-base font-bold text-text-main mb-4">
							Key Scheduling Rules
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{KEY_RULES.map((rule) => (
								<div key={rule} className="flex items-start gap-3">
									<div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
										<Check size={12} className="text-emerald-600" />
									</div>
									<p className="text-sm text-text-muted leading-relaxed">
										{rule}
									</p>
								</div>
							))}
						</div>
					</motion.div>

					{/* Before / After visual */}
					<motion.div
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-60px" }}
						transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
					>
						<h3 className="text-base font-bold text-text-main mb-4 text-center">
							CBT Allocation — Before & After
						</h3>
						<p className="text-xs text-text-subtle text-center mb-6">
							CSC 301 · 250 students · ICT Lab (80 seats) + Library CBT (100
							seats)
						</p>

						<div className="flex flex-col sm:flex-row items-stretch gap-4">
							{/* Before */}
							<div className="flex-1 bg-red-50 border border-red-200 rounded-2xl p-6">
								<div className="flex items-center gap-2 mb-4">
									<span className="text-xs font-bold text-red-500 uppercase tracking-widest">
										Before (Manual)
									</span>
								</div>
								<div className="bg-red-100 rounded-xl p-4 border border-red-200">
									<p className="text-sm font-bold text-red-700 mb-1">
										CSC 301 — 250 students
									</p>
									<p className="text-sm text-red-600">ICT Lab (80 seats)</p>
								</div>
								<div className="mt-3 flex items-center gap-2">
									<span className="inline-block w-2 h-2 rounded-full bg-red-500" />
									<span className="text-xs font-bold text-red-600">
										OVERLOADED ✗
									</span>
								</div>
								<p className="mt-2 text-xs text-red-500">
									170 students have no seat assignment
								</p>
							</div>

							{/* Arrow */}
							<div className="flex items-center justify-center sm:flex-shrink-0">
								<span className="text-3xl text-text-subtle">→</span>
							</div>

							{/* After */}
							<div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
								<div className="flex items-center gap-2 mb-4">
									<span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
										After (TimeMapper)
									</span>
								</div>
								<div className="flex flex-col gap-2">
									{[
										{ time: "09:00–11:00", venue: "ICT Lab", count: "80" },
										{ time: "11:00–13:00", venue: "ICT Lab", count: "80" },
										{ time: "09:00–11:00", venue: "Library CBT", count: "90" },
									].map((turn, i) => (
										<div
											key={i}
											className="bg-emerald-100 rounded-xl px-4 py-2.5 border border-emerald-200 flex justify-between items-center"
										>
											<div>
												<span className="text-xs font-bold text-emerald-800">
													Turn {i + 1}
												</span>
												<span className="text-xs text-emerald-700 ml-2">
													{turn.time}
												</span>
											</div>
											<div className="text-right">
												<span className="text-xs text-emerald-700">
													{turn.count} students → {turn.venue}
												</span>
											</div>
										</div>
									))}
								</div>
								<div className="mt-3 flex flex-wrap items-center gap-3">
									<span className="text-xs font-bold text-emerald-700">
										Total: 250 ✓
									</span>
									<span className="text-xs text-emerald-600">
										Zero overload ✓
									</span>
									<span className="text-xs text-emerald-600">2 venues ✓</span>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
