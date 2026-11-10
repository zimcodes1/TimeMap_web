import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface FeatureCardData {
	icon: LucideIcon;
	iconBg: string;       // tailwind bg class for the glassmorphic icon wrapper
	iconColor: string;    // tailwind text class for the icon
	accent: string;       // tailwind border/ring accent class
	title: string;
	description: string;
}

interface FeatureCardProps {
	card: FeatureCardData;
	index: number;
}

export default function FeatureCard({ card, index }: FeatureCardProps) {
	const { icon: Icon, iconBg, iconColor, accent, title, description } = card;

	return (
		<motion.div
			initial={{ opacity: 0, y: 32 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-60px" }}
			transition={{
				duration: 0.5,
				ease: "easeOut",
				delay: index * 0.1,
			}}
			whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
			className={`group relative bg-white rounded-2xl border border-border shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-default`}
		>
			{/* Hover accent line at top */}
			<div
				className={`absolute top-0 left-0 right-0 h-0.5 ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
			/>

			<div className="p-7">
				{/* Glassmorphic icon bubble */}
				<div
					className={`relative inline-flex items-center justify-center w-13 h-13 rounded-2xl mb-5 ${iconBg} ring-1 ring-inset ring-white/50 shadow-sm backdrop-blur-sm overflow-hidden`}
				>
					{/* Inner shimmer layer */}
					<div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl pointer-events-none" />
					<Icon size={24} className={`relative z-10 ${iconColor}`} />
				</div>

				<h3 className="text-base font-bold text-text-main mb-2 leading-snug">
					{title}
				</h3>
				<p className="text-sm text-text-muted leading-relaxed">{description}</p>
			</div>
		</motion.div>
	);
}
