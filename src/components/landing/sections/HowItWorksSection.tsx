import { motion } from "framer-motion";
import {
  Database,
  GitMerge,
  Cpu,
  Wrench,
  ShieldCheck,
  Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  number: number;
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    Icon: Database,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "Academic Data",
    description:
      "Courses, lecturers, venues, student counts, and institutional rules uploaded once and re-used each semester.",
  },
  {
    number: 2,
    Icon: GitMerge,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Preprocessing",
    description:
      "Conflict graph construction from student course registrations. Eligibility matrices computed for every venue–exam-type pair.",
  },
  {
    number: 3,
    Icon: Cpu,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    title: "Optimizer",
    description:
      "Constraint-satisfaction solver assigns sessions to slots and venues, respecting hard rules and soft preferences.",
  },
  {
    number: 4,
    Icon: Wrench,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
    title: "Repair",
    description:
      "Remaining conflicts and unassigned sessions are surfaced with structured diagnostics so administrators can resolve edge cases manually.",
  },
  {
    number: 5,
    Icon: ShieldCheck,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    title: "Validation",
    description:
      "An independent validator re-checks every assignment before the timetable is promoted to draft. Zero tolerance for hard violations.",
  },
  {
    number: 6,
    Icon: Send,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    title: "Published",
    description:
      "Administrators review diagnostics, approve, and publish. Students and lecturers receive push notifications instantly.",
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" as const, delay: index * 0.1 }}
      className="bg-surface rounded-2xl border border-border p-5 flex flex-col gap-3 shadow-sm"
    >
      {/* Number + icon row */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex-shrink-0">
          {step.number}
        </span>
        <div
          className={`relative inline-flex items-center justify-center w-10 h-10 rounded-xl ${step.iconBg} ring-1 ring-inset ring-white/50 shadow-sm overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
          <step.Icon size={18} className={`relative z-10 ${step.iconColor}`} />
        </div>
      </div>
      <h3 className="text-sm font-bold text-text-main leading-snug">
        {step.title}
      </h3>
      <p className="text-xs text-text-muted leading-relaxed">
        {step.description}
      </p>
    </motion.div>
  );
}

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-background py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
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
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
            No Black Box —{" "}
            <span className="text-primary">Just a Clear, Auditable Process</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-text-muted leading-relaxed">
            Every timetable TimeMapper produces is the result of a transparent,
            step-by-step pipeline you can inspect at any stage.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start">
          {STEPS.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-stretch">
              <StepCard step={step} index={index} />
              {/* Arrow connector — desktop only */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-6 h-6">
                  <span className="text-text-subtle text-lg font-bold">›</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
