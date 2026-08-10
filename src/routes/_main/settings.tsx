import { createFileRoute } from '@tanstack/react-router';
import SettingsContainer from '@/app/main/Settings';

export const Route = createFileRoute('/_main/settings')({
  component: SettingsContainer,
  beforeLoad: () => document.title = "Settings | NSUK TimeMap"
});
