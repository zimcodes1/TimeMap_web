import { TrendingUp, ArrowRight } from "lucide-react";
import { landingAnalytics } from "@/constants/landingDummy";

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function MobileQuickAnalyticsCard() {
	const { holdRatePercentage, heldCount, totalSessions } = landingAnalytics;
	const pct = Math.min(holdRatePercentage / 100, 1);
	const dash = pct * CIRCUMFERENCE;
	const gap = CIRCUMFERENCE - dash;

	return (
		<div className="mx-4 mb-4 rounded-2xl bg-[#10b981] p-4">
			<div className="flex items-center justify-between gap-3">
				{/* Left content */}
				<div className="flex-1 min-w-0">
					{/* Label */}
					<div className="flex items-center gap-1.5 mb-2">
						<TrendingUp size={12} className="text-white/80" />
						<span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
							Lecture Hold Rate
						</span>
					</div>

					{/* Headline */}
					<p className="sm:text-xl font-bold text-white leading-none mb-1">
						{Math.round(holdRatePercentage)}% Hold Rate
					</p>

					{/* Subtext */}
					<p className="text-xs text-white/70 mb-3">
						{heldCount} of {totalSessions} scheduled lectures held
					</p>

					{/* Action */}
					<button className="flex items-center gap-1 text-white text-xs font-semibold underline-offset-2 hover:underline">
						View Detailed Analytics
						<ArrowRight size={12} />
					</button>
				</div>

				{/* Circular ring */}
				<div className="shrink-0">
					<svg width={74} height={74} viewBox="0 0 74 74">
						{/* Track */}
						<circle
							cx="37"
							cy="37"
							r={RADIUS}
							fill="none"
							stroke="rgba(255,255,255,0.25)"
							strokeWidth={6}
						/>
						{/* Progress */}
						<circle
							cx="37"
							cy="37"
							r={RADIUS}
							fill="none"
							stroke="white"
							strokeWidth={6}
							strokeLinecap="round"
							strokeDasharray={`${dash} ${gap}`}
							strokeDashoffset={CIRCUMFERENCE / 4}
							transform="rotate(-90 37 37)"
						/>
						{/* Center label */}
						<text
							x="37"
							y="37"
							textAnchor="middle"
							dominantBaseline="central"
							fill="white"
							fontSize="13"
							fontWeight="bold"
						>
							{Math.round(holdRatePercentage)}%
						</text>
					</svg>
				</div>
			</div>
		</div>
	);
}
