import { motion } from "framer-motion";
import { Zap, Building2, TrendingUp, Sparkles } from "lucide-react";
import { adminFloatingStats } from "@/constants/landingDummy";

export default function AdminFloatingCards() {
	const { solverMetric, venueEfficiency, liveCompliance } = adminFloatingStats;

	return (
		<>
			{/* Card 1: AI Constraint Solver Run (Top-Right / Overlapping frame) */}
			<motion.div
				className="absolute -top-6 -right-4 sm:-right-8 lg:-right-12 z-20 max-w-52.5 sm:max-w-57.5 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/80 pointer-events-none"
				initial={{ opacity: 0, y: 15, scale: 0.95 }}
				animate={{
					opacity: 1,
					y: [0, -7, 0],
					scale: 1,
				}}
				transition={{
					opacity: { duration: 0.5, delay: 0.2 },
					y: {
						duration: 4.4,
						repeat: Infinity,
						ease: "easeInOut",
					},
				}}
			>
				<div className="flex items-start gap-2.5">
					<div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
						<Zap size={16} />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between gap-1">
							<span className="text-[11px] font-bold text-gray-900 truncate">
								{solverMetric.title}
							</span>
							<span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
								{solverMetric.badge}
							</span>
						</div>
						<div className="flex items-baseline gap-1 mt-0.5">
							<span className="text-sm font-extrabold text-emerald-600">
								{solverMetric.value}
							</span>
							<span className="text-[10px] text-gray-500 truncate">
								to schedule
							</span>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Card 2: Space Efficiency / Venue Optimization (Bottom-Left) */}
			<motion.div
				className="absolute bottom-0 -left-4 sm:-left-8 lg:-left-12 z-20 max-w-50 sm:max-w-55 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/80 pointer-events-none"
				initial={{ opacity: 0, x: -15, scale: 0.95 }}
				animate={{
					opacity: 1,
					x: 0,
					y: [0, 8, 0],
					scale: 1,
				}}
				transition={{
					opacity: { duration: 0.5, delay: 0.35 },
					y: {
						duration: 5,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 0.6,
					},
				}}
			>
				<div className="flex items-start gap-2.5">
					<div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
						<Building2 size={16} />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between gap-1">
							<span className="text-[11px] font-bold text-gray-900 truncate">
								{venueEfficiency.title}
							</span>
							<span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 shrink-0">
								{venueEfficiency.badge}
							</span>
						</div>
						<div className="flex items-baseline gap-1 mt-0.5">
							<span className="text-sm font-extrabold text-gray-900">
								{venueEfficiency.value}
							</span>
							<span className="text-[10px] text-gray-400">utilization</span>
						</div>
						<p className="text-[9px] text-gray-500 leading-tight truncate">
							{venueEfficiency.subtitle}
						</p>
					</div>
				</div>
			</motion.div>

			{/* Card 3: Lecture Hold Rate / Compliance Pulse (Bottom-Right) */}
			<motion.div
				className="absolute bottom-0 -right-2 sm:-right-6 lg:-right-10 z-20 max-w-47.5 sm:max-w-52.5 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-white/80 pointer-events-none"
				initial={{ opacity: 0, y: 15, scale: 0.95 }}
				animate={{
					opacity: 1,
					y: [0, -6, 0],
					scale: 1,
				}}
				transition={{
					opacity: { duration: 0.5, delay: 0.5 },
					y: {
						duration: 4.6,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 1.2,
					},
				}}
			>
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0">
						<TrendingUp size={16} />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-1">
							<span className="text-xs font-black text-gray-900">
								{liveCompliance.value}
							</span>
							<Sparkles size={11} className="text-amber-500 shrink-0" />
						</div>
						<p className="text-[10px] font-semibold text-emerald-700 leading-tight truncate">
							{liveCompliance.subtitle}
						</p>
					</div>
				</div>
			</motion.div>
		</>
	);
}
