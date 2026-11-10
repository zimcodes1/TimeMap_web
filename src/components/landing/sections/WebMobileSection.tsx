import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Calendar,
  Bell,
  ClipboardList,
} from "lucide-react";

interface BulletItem {
  Icon: typeof LayoutDashboard;
  text: string;
}

const WEB_BULLETS: BulletItem[] = [
  { Icon: LayoutDashboard, text: "Full scheduling dashboard — generate, inspect, approve, and publish timetables." },
  { Icon: BarChart3, text: "Role-scoped analytics — hold rates, venue utilization, discrepancy resolution metrics." },
  { Icon: Settings, text: "Institutional configuration — operating days, session rules, venue policies." },
];

const MOBILE_BULLETS: BulletItem[] = [
  { Icon: Calendar, text: "Live schedule view — always up to date with published changes." },
  { Icon: Bell, text: "Push notifications — shift alerts, cancellations, and exam reminders." },
  { Icon: ClipboardList, text: "Attendance reporting — class reps file session reports; lecturers respond." },
];

function ProductColumn({
  badge,
  badgeColor,
  bullets,
  deviceType,
  delay,
}: {
  badge: string;
  badgeColor: string;
  bullets: BulletItem[];
  deviceType: "web" | "mobile";
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" as const, delay }}
      className="flex flex-col gap-6"
    >
      {/* Badge */}
      <span
        className={`inline-block self-start px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${badgeColor}`}
      >
        {badge}
      </span>

      {/* Bullets */}
      <div className="flex flex-col gap-4">
        {bullets.map((item) => (
          <div key={item.text} className="flex gap-3 items-start">
            <item.Icon size={18} className="text-white/70 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/80 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Device frame mockup */}
      {deviceType === "web" ? (
        <div className="mt-2 rounded-xl border border-white/20 bg-white/10 overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border-b border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            <div className="flex-1 ml-2 h-4 rounded bg-white/10" />
          </div>
          {/* Fake content area */}
          <div className="p-4 flex flex-col gap-2">
            <div className="h-3 rounded bg-white/15 w-3/4" />
            <div className="h-3 rounded bg-white/10 w-full" />
            <div className="h-3 rounded bg-white/10 w-5/6" />
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-2 mx-auto w-36 rounded-3xl border-2 border-white/20 bg-white/10 overflow-hidden">
          {/* Phone notch */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-white/20" />
          </div>
          {/* Fake screen content */}
          <div className="px-3 pb-4 flex flex-col gap-2">
            <div className="h-2.5 rounded bg-white/20 w-full mt-2" />
            <div className="h-2.5 rounded bg-white/15 w-4/5" />
            <div className="mt-2 flex flex-col gap-1.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 rounded-lg bg-white/10" />
              ))}
            </div>
          </div>
          {/* Home indicator */}
          <div className="flex justify-center pb-2">
            <div className="w-8 h-1 rounded-full bg-white/20" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function WebMobileSection() {
  return (
    <section className="bg-primary py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-white/20 text-white border border-white/30">
            Two Products, One Platform
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Built for the Admin's Desk and{" "}
            <span className="text-white/80">the Student's Palm</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-white/75 leading-relaxed">
            TimeMapper ships as two tightly integrated products that share the
            same live data.
          </p>
        </motion.div>

        {/* Two-column product columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
          <ProductColumn
            badge="Admin Web App"
            badgeColor="bg-white/20 text-white border border-white/30"
            bullets={WEB_BULLETS}
            deviceType="web"
            delay={0}
          />
          <ProductColumn
            badge="Mobile App"
            badgeColor="bg-white/20 text-white border border-white/30"
            bullets={MOBILE_BULLETS}
            deviceType="mobile"
            delay={0.1}
          />
        </div>
      </div>
    </section>
  );
}
