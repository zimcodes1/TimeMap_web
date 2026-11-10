import { motion } from "framer-motion";
import {
	CalendarDays,
	Clock,
	Sparkles,
	MapPin,
	Layers,
	ShieldCheck,
	BookOpen,
	GraduationCap,
} from "lucide-react";

export default function HeroBackground() {
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
			{/* Architectural Grid Pattern */}
			<div
				className="absolute inset-0 opacity-[0.09]"
				style={{
					backgroundImage: `
						linear-gradient(to right, #ffffff 1px, transparent 1px),
						linear-gradient(to bottom, #ffffff 1px, transparent 1px)
					`,
					backgroundSize: "44px 44px",
					maskImage:
						"radial-gradient(ellipse 75% 65% at 50% 45%, #000000 30%, transparent 85%)",
					WebkitMaskImage:
						"radial-gradient(ellipse 75% 65% at 50% 45%, #000000 30%, transparent 85%)",
				}}
			/>

			{/* Soft Crosshair coordinate accents at intersection points */}
			<div
				className="absolute inset-0 opacity-[0.14]"
				style={{
					backgroundImage: `
						radial-gradient(circle at 1px 1px, #ffffff 1.5px, transparent 0)
					`,
					backgroundSize: "88px 88px",
					maskImage:
						"radial-gradient(ellipse 70% 60% at 50% 45%, #000000 20%, transparent 80%)",
					WebkitMaskImage:
						"radial-gradient(ellipse 70% 60% at 50% 45%, #000000 20%, transparent 80%)",
				}}
			/>

			{/* Ambient Radial Glow Orbs */}
			<div
				className="absolute -top-36 -right-24 w-150 h-150 rounded-full opacity-20 blur-3xl pointer-events-none"
				style={{
					background:
						"radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(16,185,129,0.3) 50%, transparent 75%)",
				}}
			/>
			<div
				className="absolute top-1/3 -left-32 w-125 h-125 rounded-full opacity-15 blur-3xl pointer-events-none"
				style={{
					background:
						"radial-gradient(circle, #a7f3d0 0%, #10b981 40%, transparent 70%)",
				}}
			/>
			<div
				className="absolute -bottom-28 right-1/4 w-130 h-130 rounded-full opacity-15 blur-3xl pointer-events-none"
				style={{
					background:
						"radial-gradient(circle, #ffffff 0%, #34d399 40%, transparent 75%)",
				}}
			/>

			{/* Floating Themed Decorative Icons */}
			{/* 1. Calendar (top left) */}
			<motion.div
				className="absolute top-28 left-[8%] hidden md:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-white/20 shadow-lg"
				animate={{
					y: [0, -10, 0],
					rotate: [-3, 3, -3],
				}}
				transition={{
					duration: 6,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			>
				<CalendarDays size={26} className="text-white/40" />
			</motion.div>

			{/* 2. Clock (top right-center) */}
			<motion.div
				className="absolute top-36 right-[12%] hidden lg:flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-white/20 shadow-lg"
				animate={{
					y: [0, 12, 0],
					rotate: [4, -4, 4],
				}}
				transition={{
					duration: 5.2,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 0.5,
				}}
			>
				<Clock size={22} className="text-white/40" />
			</motion.div>

			{/* 3. Sparkles / AI Constraint Solver (mid left) */}
			<motion.div
				className="absolute top-1/2 left-[4%] hidden xl:flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-white/20 shadow-md"
				animate={{
					y: [0, -8, 0],
					scale: [1, 1.05, 1],
				}}
				transition={{
					duration: 4.8,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 1.2,
				}}
			>
				<Sparkles size={20} className="text-white/40" />
			</motion.div>

			{/* 4. MapPin (bottom left) */}
			<motion.div
				className="absolute bottom-24 left-[10%] hidden md:flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-white/20 shadow-md"
				animate={{
					y: [0, 9, 0],
					rotate: [-5, 5, -5],
				}}
				transition={{
					duration: 5.8,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 0.8,
				}}
			>
				<MapPin size={22} className="text-white/35" />
			</motion.div>

			{/* 5. GraduationCap (mid right) */}
			<motion.div
				className="absolute top-[60%] right-[6%] hidden xl:flex items-center justify-center w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-white/20 shadow-lg"
				animate={{
					y: [0, -11, 0],
					rotate: [6, -2, 6],
				}}
				transition={{
					duration: 6.5,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 1.5,
				}}
			>
				<GraduationCap size={24} className="text-white/40" />
			</motion.div>

			{/* 6. ShieldCheck (bottom right-center) */}
			<motion.div
				className="absolute bottom-16 right-[18%] hidden lg:flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-white/20 shadow-md"
				animate={{
					y: [0, 8, 0],
					rotate: [-4, 3, -4],
				}}
				transition={{
					duration: 5.5,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 0.3,
				}}
			>
				<ShieldCheck size={20} className="text-white/40" />
			</motion.div>

			{/* 7. BookOpen (top center-left subtle) */}
			<motion.div
				className="absolute top-20 left-[35%] hidden 2xl:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/20 shadow-xs"
				animate={{
					y: [0, -6, 0],
				}}
				transition={{
					duration: 7,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			>
				<BookOpen size={18} className="text-white/30" />
			</motion.div>

			{/* 8. Layers (bottom center subtle) */}
			<motion.div
				className="absolute bottom-10 left-[45%] hidden 2xl:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/20 shadow-xs"
				animate={{
					y: [0, 7, 0],
				}}
				transition={{
					duration: 6.2,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 2,
				}}
			>
				<Layers size={18} className="text-white/30" />
			</motion.div>
		</div>
	);
}
