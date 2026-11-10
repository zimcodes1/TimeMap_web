import { motion } from "framer-motion";
import { AlertCircle, Search, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface WorkflowStep {
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  accentText: string;
  title: string;
  description: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    Icon: AlertCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    accentText: "text-red-500",
    title: "Detect",
    description:
      "Class reps report session issues directly from the mobile app. Lecturers flag venue or time mismatches. The system flags unreported sessions automatically after the reporting window closes.",
  },
  {
    Icon: Search,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
    accentText: "text-amber-500",
    title: "Review",
    description:
      "Department admins see all open discrepancy requests in a prioritised queue. Full session context — planned vs actual — is shown side by side.",
  },
  {
    Icon: CheckCircle2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    accentText: "text-emerald-600",
    title: "Resolve",
    description:
      "Admins approve venue shifts, acknowledge cancellations, or flag for further investigation. All decisions are timestamped and attributed for the audit trail.",
  },
];

const MOCK_ROWS = [
  {
    course: "CSC 301",
    type: "Venue Mismatch",
    reporter: "Class Rep",
    status: "Pending",
    statusColor: "bg-amber-100 text-amber-700",
  },
  {
    course: "MTH 201",
    type: "Session Cancelled",
    reporter: "Lecturer",
    status: "Approved",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    course: "EEE 402",
    type: "Time Shift",
    reporter: "System",
    status: "Rejected",
    statusColor: "bg-red-100 text-red-700",
  },
];

export default function DiscrepancySection() {
  return (
    <section id="discrepancy" className="bg-background py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-primary-muted text-primary border border-primary/20">
            Discrepancy Management
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
            When Plans Meet{" "}
            <span className="text-primary">Reality</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-text-muted leading-relaxed">
            Lectures get cancelled, shifted, or held in the wrong venue.
            TimeMapper closes the loop — from detection to resolution, with a
            complete audit trail.
          </p>
        </motion.div>

        {/* Three-step workflow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14 relative">
          {WORKFLOW_STEPS.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-stretch">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: "easeOut" as const, delay: index * 0.1 }}
                className="bg-surface rounded-2xl border border-border p-6 flex flex-col gap-4 shadow-sm h-full"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`relative inline-flex items-center justify-center w-12 h-12 rounded-2xl ${step.iconBg} ring-1 ring-inset ring-white/50 shadow-sm overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
                    <step.Icon
                      size={22}
                      className={`relative z-10 ${step.iconColor}`}
                    />
                  </div>
                  <h3 className={`text-lg font-bold ${step.accentText}`}>
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">
                  {step.description}
                </p>
              </motion.div>

              {/* Connector arrow — desktop only */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                  <span className="text-2xl text-text-subtle">›</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Discrepancy queue mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <span className="text-sm font-bold text-text-main">
              Discrepancy Queue
            </span>
            <span className="ml-auto text-xs text-text-subtle">
              3 open requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-raised">
                  <th className="text-left px-5 py-3 text-xs font-bold text-text-subtle uppercase tracking-wide">
                    Course
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-text-subtle uppercase tracking-wide">
                    Issue Type
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-text-subtle uppercase tracking-wide">
                    Reported By
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-text-subtle uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-b-0 hover:bg-surface-raised transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold text-text-main">
                      {row.course}
                    </td>
                    <td className="px-5 py-3.5 text-text-muted">{row.type}</td>
                    <td className="px-5 py-3.5 text-text-muted">{row.reporter}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${row.statusColor}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
