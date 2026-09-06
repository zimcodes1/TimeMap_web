import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import type { DiscrepancyRequest } from "@/types";

interface DiscrepancyDetailSlideOverProps {
	isOpen: boolean;
	onClose: () => void;
	onApprove: (id: string) => void;
	onRejectTrigger: (id: string) => void;
	onWithdraw: (id: string) => void;
	request: DiscrepancyRequest | null;
}

export default function DiscrepancyDetailSlideOver({
	isOpen,
	onClose,
	onApprove,
	onRejectTrigger,
	onWithdraw,
	request,
}: DiscrepancyDetailSlideOverProps) {
	if (!request) return null;

	const isPending = request.status === "pending";
	const displayDate =
		request.proposedDate ||
		(request.createdAt
			? new Date(request.createdAt).toLocaleDateString()
			: "N/A");

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={
				<div className="flex items-center gap-2">
					<span className="font-bold text-text-main">
						Discrepancy Inspection #{request.id}
					</span>
					<Badge
						variant={
							request.status === "approved" || request.status === "applied"
								? "success"
								: request.status === "rejected"
									? "danger"
									: request.status === "withdrawn"
										? "secondary"
										: "warning"
						}
					>
						{request.status === "applied"
							? "APPROVED"
							: request.status.toUpperCase()}
					</Badge>
				</div>
			}
			description={`Discrepancy approval request for ${request.courseCode}`}
			size="lg"
			footer={
				isPending ? (
					<div className="flex items-center justify-between w-full">
						{request.canWithdraw ? (
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									onWithdraw(request.id);
									onClose();
								}}
								className="cursor-pointer"
							>
								Withdraw Request
							</Button>
						) : (
							<div />
						)}
						<div className="flex items-center gap-2">
							{request.canReject && (
								<Button
									variant="danger"
									size="sm"
									onClick={() => {
										onRejectTrigger(request.id);
										onClose();
									}}
									className="cursor-pointer"
								>
									Reject Request
								</Button>
							)}
							{request.canApprove && (
								<Button
									variant="primary"
									size="sm"
									onClick={() => {
										onApprove(request.id);
										onClose();
									}}
									className="cursor-pointer"
								>
									Approve
								</Button>
							)}
						</div>
					</div>
				) : (
					<Button
						variant="outline"
						onClick={onClose}
						className="cursor-pointer"
					>
						Close
					</Button>
				)
			}
		>
			<div className="space-y-4">
				{/* Course Header Banner */}
				<div className="p-4 bg-raised/50 rounded-xl border border-border/70 space-y-2">
					<div className="flex items-center justify-between">
						<div>
							<Text
								variant="caption"
								className="font-bold text-primary text-base block"
							>
								{request.courseCode}{" "}
								<span className="text-text-muted font-normal text-xs">
									on {displayDate}
								</span>
							</Text>
							<Text
								variant="caption"
								className="text-text-main text-xs font-semibold block"
							>
								{request.courseTitle}
							</Text>
						</div>
						<span className="text-xs px-2.5 py-1 rounded-md bg-surface border border-border/80 text-primary font-bold">
							#{request.id}
						</span>
					</div>
					<div className="text-xs text-text-muted flex flex-wrap gap-4 pt-2 border-t border-border/40">
						<span>
							Request Type:{" "}
							<strong className="text-text-main capitalize">
								{request.requestType.replace("_", " ")}
							</strong>
						</span>
						<span>
							Created At:{" "}
							<strong className="text-text-main">
								{new Date(request.createdAt).toLocaleString()}
							</strong>
						</span>
					</div>
				</div>

				{/* Applier Details Box */}
				<div className="p-3.5 bg-surface rounded-xl border border-border/80 space-y-2">
					<Text
						variant="caption"
						className="font-bold text-text-muted text-xs block uppercase tracking-wider"
					>
						Applicant Information
					</Text>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
						<div>
							<span className="text-text-muted block">
								Applied By (Full Name):
							</span>
							<strong className="text-text-main text-sm block">
								{request.requestedBy}
							</strong>
						</div>
						<div>
							<span className="text-text-muted block">
								Admin Scope (Department/Faculty Abbreviation):
							</span>
							<strong className="text-primary text-sm block">
								Admin: {request.requestedByScope || "CYB"}
							</strong>
						</div>
					</div>
				</div>

				{/* Reason / Justification */}
				<div>
					<Text variant="caption" className="font-semibold mb-1 block text-xs">
						Stated Reason / Justification
					</Text>
					<p className="text-xs p-3 bg-surface rounded-xl border border-border/80 text-text-main leading-relaxed">
						{request.reason}
					</p>
				</div>

				{/* Schedule Comparison Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div className="p-3 bg-surface rounded-xl border border-border/80 space-y-1">
						<Text
							variant="caption"
							className="font-bold text-text-muted text-xs block"
						>
							Original Schedule
						</Text>
						<Text variant="caption" className="font-semibold block text-xs">
							Venue: {request.originalVenueName || "Standard Assigned Venue"}
						</Text>
						<Text variant="caption" color="muted" className="block text-xs">
							Time:{" "}
							{request.originalStartTime && request.originalEndTime
								? `${request.originalStartTime} - ${request.originalEndTime}`
								: "Standard Time Slot"}
						</Text>
					</div>

					<div className="p-3 bg-raised/50 rounded-xl border border-primary/30 space-y-1">
						<Text
							variant="caption"
							className="font-bold text-primary text-xs block"
						>
							Proposed Schedule Adjustment
						</Text>
						<Text
							variant="caption"
							className="font-semibold block text-xs text-text-main"
						>
							Venue: {request.proposedVenueName || "No Venue Change"}
						</Text>
						<Text variant="caption" color="muted" className="block text-xs">
							Time:{" "}
							{request.proposedStartTime && request.proposedEndTime
								? `${request.proposedStartTime} - ${request.proposedEndTime}`
								: "No Time Change"}
						</Text>
					</div>
				</div>
			</div>
		</Modal>
	);
}
