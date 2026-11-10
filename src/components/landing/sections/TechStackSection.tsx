import { motion } from "framer-motion";

const TECH_CHIPS = [
  { label: "Django / DRF", sublabel: "Backend API", chipColor: "border-blue-200 bg-blue-50 text-blue-800" },
  { label: "React + TypeScript", sublabel: "Admin Web App", chipColor: "border-sky-200 bg-sky-50 text-sky-800" },
  { label: "React Native / Expo", sublabel: "Mobile App", chipColor: "border-violet-200 bg-violet-50 text-violet-800" },
  { label: "Constraint Solver", sublabel: "Custom Optimizer Engine", chipColor: "border-emerald-200 bg-emerald-50 text-emerald-800" },
];

export default function TechStackSection() {
  return (
    <section className="bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-primary-muted text-primary border border-primary/20">
            Under the Hood
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
            Modern Stack,{" "}
            <span className="text-primary">Practical Choices</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-text-muted leading-relaxed">
            Built with well-established, open-source technology — maintainable
            by the institution's technical staff.
          </p>
        </motion.div>

        {/* Tech chips */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          {TECH_CHIPS.map((chip) => (
            <div
              key={chip.label}
              className={`flex flex-col items-center px-5 py-3 rounded-2xl border ${chip.chipColor} shadow-sm`}
            >
              <span className="text-sm font-bold">{chip.label}</span>
              <span className="text-xs opacity-70 mt-0.5">{chip.sublabel}</span>
            </div>
          ))}
        </motion.div>

        {/* Callout paragraph */}
        <motion.p
          className="text-sm text-text-muted leading-relaxed max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        >
          The constraint optimizer is a custom-built solver designed specifically
          for the scheduling constraints academic institutions face — not a
          general-purpose optimizer adapted to fit.
        </motion.p>
      </div>
    </section>
  );
}
