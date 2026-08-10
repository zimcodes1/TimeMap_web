import { createFileRoute } from '@tanstack/react-router';
import VenuesContainer from '@/app/main/Venues';

export const Route = createFileRoute('/_main/venues')({
  component: VenuesContainer,
  beforeLoad: () => document.title = "Venues | NSUK TimeMap"
});
