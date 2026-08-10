import { createFileRoute } from '@tanstack/react-router';
import SchedulesContainer from '@/app/main/Schedules';

export const Route = createFileRoute('/_main/schedules')({
  component: SchedulesContainer,
  beforeLoad: () => { document.title = "Timetables | NSUK TimeMap" }
});
