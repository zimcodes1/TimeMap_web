import { motion } from "framer-motion";
import { CalendarDays, KeyRound, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BulletItem {
	Icon: LucideIcon;
	iconBg: string;
	iconColor: string;
	title: string;
	description: string;
}

const BULLET_ITEMS: BulletItem[] = [
	{
		Icon: CalendarDays,
		iconBg: "bg-emerald-100",
		iconColor: "text-emerald-600",
		title: "Fixed Weekly Slots",
		description:
			"Courses are scheduled into repeating weekly sessions for the full semester duration.",
	},
	{
		Icon: KeyRound,
		iconBg: "bg-blue-100",
		iconColor: "text-blue-600",
		title: "Venue Ownership & Access Rules",
		description:
			"Halls are assigned to faculties or departments. Cross-faculty access is explicitly granted.",
	},
	{
		Icon: AlertTriangle,
		iconBg: "bg-amber-100",
		iconColor: "text-amber-500",
		title: "Real-Time Conflict Detection",
		description:
			"Venue clashes, lecturer double-booking, and cohort overlaps are caught before the schedule is saved.",
	},
];

// Static timetable cell data
const TIMETABLE_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const TIMETABLE_SLOTS: Array<{
	label: string;
	cells: Record<string, { code: string; color: string } | null>;
}> = [
	{
		label: "08:00–10:00",
		cells: {
			Mon: {
				code: "CSC 301",
				color: "bg-emerald-100 text-emerald-700 border-emerald-200",
			},
			Tue: null,
			Wed: {
				code: "MTH 201",
				color: "bg-blue-100 text-blue-700 border-blue-200",
			},
			Thu: null,
			Fri: {
				code: "EEE 402",
				color: "bg-amber-100 text-amber-700 border-amber-200",
			},
		},
	},
	{
		label: "10:00–12:00",
		cells: {
			Mon: null,
			Tue: {
				code: "PHY 101",
				color: "bg-violet-100 text-violet-700 border-violet-200",
			},
			Wed: null,
			Thu: {
				code: "CSC 301",
				color: "bg-emerald-100 text-emerald-700 border-emerald-200",
			},
			Fri: null,
		},
	},
	{
		label: "13:00–15:00",
		cells: {
			Mon: {
				code: "MTH 201",
				color: "bg-blue-100 text-blue-700 border-blue-200",
			},
			Tue: null,
			Wed: {
				code: "EEE 402",
				color: "bg-amber-100 text-amber-700 border-amber-200",
			},
			Thu: null,
			Fri: {
				code: "PHY 101",
				color: "bg-violet-100 text-violet-700 border-violet-200",
			},
		},
	},
];

export default function LectureTimetableSection() {
	return (
		<section
			id="timetabling"
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
						Lecture Timetabling
					</span>
					<h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
						Fixed-Slot Scheduling,{" "}
						<span className="text-primary">Done Right</span>
					</h2>
					<p className="max-w-xl mx-auto text-base text-text-muted leading-relaxed">
						Lecture timetables run on fixed weekly patterns. TimeMapper enforces
						venue ownership, access rules, and conflict detection automatically.
					</p>
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					{/* Left — bullet features */}
					<motion.div
						className="flex flex-col gap-6"
						initial={{ opacity: 0, x: -24 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.5, ease: "easeOut" }}
					>
						{BULLET_ITEMS.map((item) => (
							<div key={item.title} className="flex gap-4 items-start">
								<div
									className={`relative flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-2xl ${item.iconBg} ring-1 ring-inset ring-white/50 shadow-sm overflow-hidden`}
								>
									<div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
									<item.Icon
										size={20}
										className={`relative z-10 ${item.iconColor}`}
									/>
								</div>
								<div>
									<h3 className="text-sm font-bold text-text-main mb-1">
										{item.title}
									</h3>
									<p className="text-sm text-text-muted leading-relaxed">
										{item.description}
									</p>
								</div>
							</div>
						))}
					</motion.div>

					{/* Right — timetable grid mockup */}
					<motion.div
						initial={{ opacity: 0, x: 24 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
						className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden"
					>
						{/* Grid header */}
						<div className="grid grid-cols-6 border-b border-border bg-surface-raised">
							<div className="p-3 text-xs font-bold text-text-subtle" />
							{TIMETABLE_DAYS.map((day) => (
								<div
									key={day}
									className="p-3 text-center text-xs font-bold text-text-main border-l border-border"
								>
									{day}
								</div>
							))}
						</div>

						{/* Grid rows */}
						{TIMETABLE_SLOTS.map((slot) => (
							<div
								key={slot.label}
								className="grid grid-cols-6 border-b border-border last:border-b-0"
							>
								<div className="p-3 text-xs text-text-subtle font-medium leading-tight">
									{slot.label}
								</div>
								{TIMETABLE_DAYS.map((day) => {
									const cell = slot.cells[day];
									return (
										<div
											key={day}
											className="p-2 border-l border-border flex items-center justify-center min-h-[52px]"
										>
											{cell ? (
												<span
													className={`text-xs font-bold px-2 py-1 rounded-lg border ${cell.color}`}
												>
													{cell.code}
												</span>
											) : null}
										</div>
									);
								})}
							</div>
						))}
					</motion.div>
				</div>
			</div>
		</section>
	);
}
