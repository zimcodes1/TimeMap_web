import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export interface MultiSelectOption {
	value: string;
	label: string;
	subtitle?: string;
	group?: string;
}

export interface MultiSelectProps {
	label?: string;
	placeholder?: string;
	searchPlaceholder?: string;
	options: MultiSelectOption[];
	selectedValues: string[];
	onChange: (values: string[]) => void;
	disabled?: boolean;
	error?: string;
	helperText?: string;
	className?: string;
	maxDisplayed?: number;
}

export function MultiSelect({
	label,
	placeholder = "Select options...",
	searchPlaceholder = "Search...",
	options = [],
	selectedValues = [],
	onChange,
	disabled = false,
	error,
	helperText,
	className,
	maxDisplayed = 2,
}: MultiSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Close on click outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	// Focus search input when dropdown opens
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => {
				searchInputRef.current?.focus();
			}, 50);
		} else {
			setSearchQuery("");
		}
	}, [isOpen]);

	// Filter options by search query
	const filteredOptions = useMemo(() => {
		if (!searchQuery.trim()) return options;
		const q = searchQuery.toLowerCase();
		return options.filter(
			(opt) =>
				opt.label.toLowerCase().includes(q) ||
				(opt.subtitle && opt.subtitle.toLowerCase().includes(q)) ||
				(opt.group && opt.group.toLowerCase().includes(q)),
		);
	}, [options, searchQuery]);

	// Group filtered options if groups exist
	const groupedOptions = useMemo(() => {
		const groups: { [key: string]: MultiSelectOption[] } = {};
		filteredOptions.forEach((opt) => {
			const groupName = opt.group || "";
			if (!groups[groupName]) {
				groups[groupName] = [];
			}
			groups[groupName].push(opt);
		});
		return groups;
	}, [filteredOptions]);

	const selectedOptions = useMemo(() => {
		return options.filter((opt) => selectedValues.includes(opt.value));
	}, [options, selectedValues]);

	const toggleOption = (val: string) => {
		if (selectedValues.includes(val)) {
			onChange(selectedValues.filter((v) => v !== val));
		} else {
			onChange([...selectedValues, val]);
		}
	};

	const removeValue = (val: string, e: React.MouseEvent) => {
		e.stopPropagation();
		onChange(selectedValues.filter((v) => v !== val));
	};

	const clearAll = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange([]);
	};

	const selectAllFiltered = () => {
		const allFilteredValues = filteredOptions.map((opt) => opt.value);
		const newSet = new Set([...selectedValues, ...allFilteredValues]);
		onChange(Array.from(newSet));
	};

	const hasGroups = Object.keys(groupedOptions).some((k) => k !== "");

	return (
		<div className={cn("w-full flex flex-col gap-1.5", className)} ref={containerRef}>
			{label && (
				<label className="text-xs font-semibold text-text-muted">
					{label}
				</label>
			)}

			<div className="relative">
				{/* Trigger Button */}
				<div
					onClick={() => {
						if (!disabled) setIsOpen(!isOpen);
					}}
					className={cn(
						"min-h-10 w-full rounded-lg border bg-surface px-3 py-1.5 flex items-center justify-between gap-2 text-sm text-text-main cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:border-primary",
						disabled && "cursor-not-allowed opacity-50 bg-surface-raised",
						error
							? "border-danger focus-within:ring-danger/50 focus-within:border-danger"
							: isOpen
								? "border-primary ring-1 ring-primary/40"
								: "border-border hover:border-border-strong",
					)}
				>
					<div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
						{selectedValues.length === 0 ? (
							<span className="text-text-subtle text-xs select-none">
								{placeholder}
							</span>
						) : (
							<>
								{selectedOptions.slice(0, maxDisplayed).map((opt) => (
									<Badge
										key={opt.value}
										variant="secondary"
										className="text-[11px] py-0 px-1.5 flex items-center gap-1 max-w-40 truncate bg-surface-raised border border-border"
									>
										<span className="truncate">{opt.label}</span>
										<button
											type="button"
											onClick={(e) => removeValue(opt.value, e)}
											className="hover:text-danger cursor-pointer shrink-0"
										>
											<X size={11} />
										</button>
									</Badge>
								))}
								{selectedOptions.length > maxDisplayed && (
									<Badge
										variant="outline"
										className="text-[10px] py-0 px-1.5 bg-surface-raised"
									>
										+{selectedOptions.length - maxDisplayed} more
									</Badge>
								)}
							</>
						)}
					</div>

					<div className="flex items-center gap-1 shrink-0 text-text-subtle">
						{selectedValues.length > 0 && !disabled && (
							<button
								type="button"
								onClick={clearAll}
								className="p-1 hover:text-text-main rounded-md transition-colors cursor-pointer"
								title="Clear all"
							>
								<X size={13} />
							</button>
						)}
						<ChevronDown
							size={16}
							className={cn(
								"transition-transform duration-150",
								isOpen && "rotate-180 text-text-main",
							)}
						/>
					</div>
				</div>

				{/* Dropdown Popover */}
				{isOpen && (
					<div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-72">
						{/* Search & Actions Bar */}
						<div className="p-2 border-b border-border bg-surface-raised/40 space-y-1.5">
							<div className="relative">
								<Search
									size={13}
									className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle"
								/>
								<input
									ref={searchInputRef}
									type="text"
									placeholder={searchPlaceholder}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-surface border border-border text-xs text-text-main placeholder:text-text-subtle focus:outline-hidden focus:ring-1 focus:ring-primary"
								/>
							</div>
							<div className="flex items-center justify-between text-[11px] px-1 text-text-muted">
								<span>
									{selectedValues.length} of {options.length} selected
								</span>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={selectAllFiltered}
										className="text-primary hover:underline cursor-pointer font-medium"
									>
										Select all
									</button>
									<span>•</span>
									<button
										type="button"
										onClick={() => onChange([])}
										className="text-text-muted hover:text-text-main hover:underline cursor-pointer"
									>
										Clear
									</button>
								</div>
							</div>
						</div>

						{/* Options List */}
						<div className="overflow-y-auto flex-1 p-1.5 space-y-0.5 scrollbar-thin">
							{filteredOptions.length === 0 ? (
								<div className="py-6 text-center text-xs text-text-muted">
									No matching options found.
								</div>
							) : hasGroups ? (
								Object.entries(groupedOptions).map(([groupName, groupOpts]) => (
									<div key={groupName} className="space-y-0.5">
										{groupName && (
											<div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-subtle">
												{groupName}
											</div>
										)}
										{groupOpts.map((opt) => {
											const isSelected = selectedValues.includes(opt.value);
											return (
												<div
													key={opt.value}
													onClick={() => toggleOption(opt.value)}
													className={cn(
														"px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors",
														isSelected
															? "bg-primary/10 text-primary font-medium"
															: "hover:bg-surface-raised text-text-main",
													)}
												>
													<div className="flex flex-col min-w-0 pr-2">
														<span className="truncate">{opt.label}</span>
														{opt.subtitle && (
															<span className="text-[10px] text-text-subtle truncate">
																{opt.subtitle}
															</span>
														)}
													</div>
													<div
														className={cn(
															"w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
															isSelected
																? "bg-primary border-primary text-white"
																: "border-border-strong bg-surface",
														)}
													>
														{isSelected && <Check size={11} strokeWidth={3} />}
													</div>
												</div>
											);
										})}
									</div>
								))
							) : (
								filteredOptions.map((opt) => {
									const isSelected = selectedValues.includes(opt.value);
									return (
										<div
											key={opt.value}
											onClick={() => toggleOption(opt.value)}
											className={cn(
												"px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors",
												isSelected
													? "bg-primary/10 text-primary font-medium"
													: "hover:bg-surface-raised text-text-main",
											)}
										>
											<div className="flex flex-col min-w-0 pr-2">
												<span className="truncate">{opt.label}</span>
												{opt.subtitle && (
													<span className="text-[10px] text-text-subtle truncate">
														{opt.subtitle}
													</span>
												)}
											</div>
											<div
												className={cn(
													"w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
													isSelected
														? "bg-primary border-primary text-white"
														: "border-border-strong bg-surface",
												)}
											>
												{isSelected && <Check size={11} strokeWidth={3} />}
											</div>
										</div>
									);
								})
							)}
						</div>
					</div>
				)}
			</div>

			{error ? (
				<span className="text-xs text-danger font-medium">{error}</span>
			) : helperText ? (
				<span className="text-xs text-text-muted">{helperText}</span>
			) : null}
		</div>
	);
}
