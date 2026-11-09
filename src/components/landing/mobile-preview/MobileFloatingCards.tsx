import { motion } from "framer-motion";
import { Bell, ShieldCheck, Users, CheckCircle2 } from "lucide-react";
import { mobileFloatingStats } from "@/constants/landingDummy";

export default function MobileFloatingCards() {
	const { conflictGuard, notificationAlert, attendancePulse } =
		mobileFloatingStats;

	return (
		<>
			{/* Card 1: Instant Notification Alert (Top-Right) */}
			<motion.div
				className="absolute -top-3 -right-6 sm:-right-16 lg:-right-20 z-20 max-w-[210px] sm:max-w-[240px] bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/80 pointer-events-none"
				initial={{ opacity: 0, y: 15, scale: 0.95 }}
				animate={{
					opacity: 1,
					y: [0, -7, 0],
					scale: 1,
				}}
				transition={{
					opacity: { duration: 0.5, delay: 0.2 },
					y: {
						duration: 4.2,
						repeat: Infinity,
						ease: "easeInOut",
					},
				}}
			>
				<div className="flex items-start gap-2.5">
					<div className="relative shrink-0 mt-0.5">
						<div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
							<Bell size={16} />
						</div>
						<span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
						<span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500" />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between gap-1">
							<span className="text-[11px] font-bold text-gray-900 truncate">
								{notificationAlert.title}
							</span>
							<span className="text-[9px] text-gray-400 font-medium shrink-0">
								{notificationAlert.time}
							</span>
						</div>
						<p className="text-[10px] text-gray-600 mt-0.5 leading-tight line-clamp-2">
							{notificationAlert.message}
						</p>
					</div>
				</div>
			</motion.div>

			{/* Card 2: Zero Conflict Guard (Mid/Bottom-Left) */}
			<motion.div
				className="absolute top-1/2 -left-6 sm:-left-16 lg:-left-22 -translate-y-1/2 z-20 max-w-[190px] sm:max-w-[220px] bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/80 pointer-events-none"
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
						duration: 4.8,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 0.5,
					},
				}}
			>
				<div className="flex items-start gap-2.5">
					<div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
						<ShieldCheck size={18} />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-1.5">
							<span className="text-[11px] font-bold text-gray-900">
								{conflictGuard.title}
							</span>
							<span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700">
								{conflictGuard.tag}
							</span>
						</div>
						<p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
							{conflictGuard.subtitle}
						</p>
					</div>
				</div>
			</motion.div>

			{/* Card 3: Active Campus Sync (Bottom-Right) */}
			<motion.div
				className="absolute bottom-0 -right-4 sm:-right-12 lg:-right-16 z-20 max-w-[190px] sm:max-w-[210px] bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-white/80 pointer-events-none"
				initial={{ opacity: 0, y: 15, scale: 0.95 }}
				animate={{
					opacity: 1,
					y: [0, -6, 0],
					scale: 1,
				}}
				transition={{
					opacity: { duration: 0.5, delay: 0.5 },
					y: {
						duration: 5.2,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 1,
					},
				}}
			>
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 shrink-0">
						<Users size={16} />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-1">
							<span className="text-xs font-extrabold text-gray-900">
								{attendancePulse.value}
							</span>
							<CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
						</div>
						<p className="text-[10px] text-gray-500 leading-tight truncate">
							{attendancePulse.subtitle}
						</p>
					</div>
				</div>
			</motion.div>
		</>
	);
}
