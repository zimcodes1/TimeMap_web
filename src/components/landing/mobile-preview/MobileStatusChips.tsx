import { useState } from "react";

type FilterChip =
	"All" | "Scheduled" | "Shifted" | "Cancelled" | "Held" | "Not Held";

const CHIPS: FilterChip[] = [
	"All",
	"Scheduled",
	"Shifted",
	"Cancelled",
	"Held",
	"Not Held",
];

export default function MobileStatusChips() {
	const [active, setActive] = useState<FilterChip>("All");

	return (
		<div className="px-4 pb-2">
			<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
				{CHIPS.map((chip) => {
					const isActive = chip === active;
					return (
						<button
							key={chip}
							onClick={() => setActive(chip)}
							className={[
								"shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all",
								isActive
									? "bg-[rgba(16,185,129,0.15)] border-[#10b981] text-[#10b981]"
									: "bg-[#18181b] border-[#27272a] text-[#71717a]",
							].join(" ")}
						>
							{chip}
						</button>
					);
				})}
			</div>
		</div>
	);
}
