import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Smartphone, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeroTab = "mobile" | "admin";

interface HeroTextContentProps {
	activeTab: HeroTab;
}

const CONTENT = {
	mobile: {
		badge: "For Students & Lecturers",
		headline: "Your Timetable,\nAlways in Your Pocket",
		subtext:
			"Real-time lecture schedules, session reports, and instant notifications, all tailored to your role at NSUK.",
		primaryLabel: "Download the App",
		primaryIcon: <Smartphone size={18} />,
		primaryHref:
			"https://download1980.mediafire.com/six2qrselfig7DFSE2nXV3AoQKQQDm9AWcoOFH2lM74KgQUDsLl-059RBDvs4a43g5kBsEmgHlA0cQ-jckOyQxpmDk_VFmjOEW8mvuK4wSNi8QL__t7j2_SrngwQ-RpKKLPCivH33dRH-qvz4tfNX17k6ZDteNOU8Vd8xqCpp9eUACk/qzoqd4ut4px67zl/TimeMap_v1.0.1.apk",
		secondaryLabel: "Learn More",
		secondaryHref: "#features",
	},
	admin: {
		badge: "For Administrators",
		headline: "Intelligent Timetable Management at Scale",
		subtext:
			"Generate conflict-free schedules, track venue utilization, resolve discrepancies, and monitor lecture compliance, all from one dashboard.",
		primaryLabel: "Access Dashboard",
		primaryIcon: <LayoutDashboard size={18} />,
		primaryHref: "/login",
		secondaryLabel: "Learn More",
		secondaryHref: "#features",
	},
};

const variants: Variants = {
	initial: { opacity: 0, y: 24 },
	animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
	exit: { opacity: 0, y: -16, transition: { duration: 0.25, ease: "easeIn" } },
};

export default function HeroTextContent({ activeTab }: HeroTextContentProps) {
	const c = CONTENT[activeTab];

	return (
		<div className={`flex-1 ${activeTab == "admin" ? "w-full" : " max-w-xl "}`}>
			<AnimatePresence mode="wait">
				<motion.div
					key={activeTab}
					variants={variants}
					initial="initial"
					animate="animate"
					exit="exit"
					className={`flex flex-col items-center ${activeTab == "admin" ? "justify-center" : "lg:items-start sm:pt-10  lg:text-left"} text-center`}
				>
					{/* Badge */}
					<span className="inline-block mb-5 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 text-white border border-white/10 backdrop-blur-sm">
						{c.badge}
					</span>

					{/* Headline */}
					<h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-white leading-tight mb-5 whitespace-pre-line">
						{c.headline}
					</h1>

					{/* Subtext */}
					<p className="text-base text-white/75 mb-8 max-w-md lg:max-w-fit leading-relaxed">
						{c.subtext}
					</p>

					{/* CTAs */}
					<div className="flex flex-wrap gap-3 justify-center lg:justify-start">
						<a href={c.primaryHref} target="_blank">
							<Button variant="secondary" size="lg" leftIcon={c.primaryIcon}>
								{c.primaryLabel}
							</Button>
						</a>
						<br />
						<Button
							variant="outline"
							size="lg"
							rightIcon={<ArrowRight size={18} />}
							onClick={() => {
								const el = document.querySelector(c.secondaryHref);
								el?.scrollIntoView({ behavior: "smooth" });
							}}
							className="border-white/40 text-white hover:bg-white/5  backdrop-blur-lg hover:text-white bg-transparent"
						>
							{c.secondaryLabel}
						</Button>
					</div>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
