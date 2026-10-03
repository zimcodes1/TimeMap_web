import React from "react";
import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Mail,
	IdCard,
	Building2,
	Edit2,
	KeyRound,
	ShieldOff,
	CheckCircle2,
	Copy,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { User } from "@/types";

interface LecturerProfileHeaderProps {
	lecturer: User;
	canManage?: boolean;
	onEdit: () => void;
	onResetPassword: () => void;
	onToggleStatus: () => void;
}

export const LecturerProfileHeader: React.FC<LecturerProfileHeaderProps> = ({
	lecturer,
	canManage = true,
	onEdit,
	onResetPassword,
	onToggleStatus,
}) => {
	const handleCopyStaffId = () => {
		if (lecturer.staffId || lecturer.identifier) {
			navigator.clipboard.writeText(lecturer.staffId || lecturer.identifier);
			toast.success("Staff ID copied to clipboard");
		}
	};

	const initials = (lecturer.name || "Lecturer")
		.split(" ")
		.map((part) => part[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();

	return (
		<div className="space-y-4">
			{/* Top Navigation Bar */}
			<div className="flex items-center justify-between">
				<Link to={"/users" as any}>
					<Button
						variant="outline"
						size="sm"
						className="rounded-xl flex items-center gap-1.5 h-9"
					>
						<ArrowLeft size={16} />
						<span>Back to Directory</span>
					</Button>
				</Link>

				<div className="flex items-center gap-2">
					<Badge
						variant={lecturer.isActive ? "success" : "danger"}
						className="text-xs px-2.5 py-1"
					>
						{lecturer.isActive ? "Active Account" : "Account Disabled"}
					</Badge>
					{lecturer.requiresPasswordReset && (
						<Badge variant="warning" className="text-xs px-2.5 py-1">
							Password Reset Pending
						</Badge>
					)}
				</div>
			</div>

			{/* Main Profile Card */}
			<Card className="p-6 border border-border/80 bg-surface/90 backdrop-blur-md shadow-sm">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
					{/* Left: Avatar & Info */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
						{/* Big Avatar */}
						<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary border-2 border-primary/30 text-white flex items-center justify-center font-bold text-3xl sm:text-4xl shadow-inner shrink-0">
							{initials}
						</div>

						{/* Details */}
						<div className="space-y-1.5">
							<div className="flex flex-wrap items-center gap-2.5">
								<Text
									variant="h3"
									weight="bold"
									className="text-text-main text-xl sm:text-2xl"
								>
									{lecturer.name}
								</Text>
								<Badge variant="primary" className="text-xs font-semibold">
									Lecturer
								</Badge>
							</div>

							<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted pt-1">
								{/* Staff ID */}
								<button
									type="button"
									onClick={handleCopyStaffId}
									className="flex items-center gap-1.5 font-mono text-text-main font-semibold hover:text-primary transition-colors cursor-pointer bg-surface-raised px-2.5 py-1 rounded-lg border border-border/60"
									title="Click to copy Staff ID"
								>
									<IdCard size={14} className="text-primary" />
									<span>
										{lecturer.staffId || lecturer.identifier || "N/A"}
									</span>
									<Copy
										size={11}
										className="text-text-muted opacity-60 ml-0.5"
									/>
								</button>

								{/* Department */}
								<div className="flex items-center gap-1.5 text-text-muted">
									<Building2 size={14} className="text-blue-500" />
									<span>
										{lecturer.departmentName || "Department Assigned"}
									</span>
								</div>

								{/* Email */}
								{lecturer.email && (
									<a
										href={`mailto:${lecturer.email}`}
										className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors"
									>
										<Mail size={14} className="text-emerald-500" />
										<span>{lecturer.email}</span>
									</a>
								)}
							</div>
						</div>
					</div>

					{/* Right: Actions */}
					{canManage && (
						<div className="flex flex-wrap items-center justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
							<Button
								variant="outline"
								size="sm"
								onClick={onEdit}
								className="rounded-xl flex items-center gap-1.5 h-9 text-xs font-medium cursor-pointer"
								title="Edit Lecturer Details"
							>
								<Edit2 size={14} />
								<span>Edit Profile</span>
							</Button>

							{!lecturer.requiresPasswordReset && (
								<Button
									variant="outline"
									size="sm"
									onClick={onResetPassword}
									className="rounded-xl flex items-center gap-1.5 h-9 text-xs font-medium text-warning border-warning/30 hover:bg-warning/10 cursor-pointer"
									title="Force Password Reset"
								>
									<KeyRound size={14} />
									<span>Reset Password</span>
								</Button>
							)}

							<Button
								variant="outline"
								size="sm"
								onClick={onToggleStatus}
								className={`rounded-xl flex items-center gap-1.5 h-9 text-xs font-medium cursor-pointer ${
									lecturer.isActive
										? "text-danger border-danger/30 hover:bg-danger/10"
										: "text-success border-success/30 hover:bg-success/10"
								}`}
								title={
									lecturer.isActive ? "Deactivate Account" : "Activate Account"
								}
							>
								{lecturer.isActive ? (
									<>
										<ShieldOff size={14} />
										<span>Disable Account</span>
									</>
								) : (
									<>
										<CheckCircle2 size={14} />
										<span>Enable Account</span>
									</>
								)}
							</Button>
						</div>
					)}
				</div>
			</Card>
		</div>
	);
};

export default LecturerProfileHeader;
