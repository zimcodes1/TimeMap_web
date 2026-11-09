import { Clock, MapPin, User } from 'lucide-react';
import type { LandingSession } from '@/constants/landingDummy';

interface Props {
  session: LandingSession;
}

const STATUS_STYLES: Record<string, { accent: string; badge: string; label: string }> = {
  scheduled: {
    accent: 'bg-[#10b981]',
    badge: 'bg-[rgba(16,185,129,0.15)] text-[#10b981] border-[rgba(16,185,129,0.3)]',
    label: 'Scheduled',
  },
  shifted: {
    accent: 'bg-[#f59e0b]',
    badge: 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border-[rgba(245,158,11,0.3)]',
    label: 'Shifted',
  },
  cancelled: {
    accent: 'bg-[#ef4444]',
    badge: 'bg-[rgba(239,68,68,0.15)] text-[#ef4444] border-[rgba(239,68,68,0.3)]',
    label: 'Cancelled',
  },
  held: {
    accent: 'bg-[#10b981]',
    badge: 'bg-[rgba(16,185,129,0.15)] text-[#10b981] border-[rgba(16,185,129,0.3)]',
    label: 'Held',
  },
  not_held: {
    accent: 'bg-[#ef4444]',
    badge: 'bg-[rgba(239,68,68,0.15)] text-[#ef4444] border-[rgba(239,68,68,0.3)]',
    label: 'Not Held',
  },
  postponed: {
    accent: 'bg-[#a78bfa]',
    badge: 'bg-[rgba(167,139,250,0.15)] text-[#a78bfa] border-[rgba(167,139,250,0.3)]',
    label: 'Postponed',
  },
};

export default function MobileSessionCard({ session }: Props) {
  const style = session.isExam
    ? {
        accent: 'bg-[#a78bfa]',
        badge: 'bg-[rgba(167,139,250,0.15)] text-[#a78bfa] border-[rgba(167,139,250,0.3)]',
        label: 'Exam',
      }
    : (STATUS_STYLES[session.status] ?? STATUS_STYLES.scheduled);

  return (
    <div className="mx-4 mb-3 flex rounded-2xl border border-[#27272a] bg-[#18181b] overflow-hidden">
      {/* Left accent bar */}
      <div className={`w-1 shrink-0 ${style.accent}`} />

      {/* Card body */}
      <div className="flex-1 px-3 py-3">
        {/* Top row: course code + badge */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-bold text-white">{session.course.code}</span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.badge}`}
          >
            {style.label}
          </span>
        </div>

        {/* Course title */}
        <p className="text-xs text-[#a1a1aa] mb-2 leading-snug">{session.course.title}</p>

        {/* Meta row */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-[#71717a] shrink-0" />
            <span className="text-[11px] text-[#71717a]">
              {session.startTime} – {session.endTime}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={11} className="text-[#71717a] shrink-0" />
            <span className="text-[11px] text-[#71717a]">{session.venue.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User size={11} className="text-[#71717a] shrink-0" />
            <span className="text-[11px] text-[#71717a]">
              {session.lecturers.map((l) => l.name).join(', ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
