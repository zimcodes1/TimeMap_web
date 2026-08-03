import { createFileRoute } from '@tanstack/react-router';
import HierarchyContainer from '@/app/main/Hierarchy';

export const Route = createFileRoute('/_main/hierarchy')({
  component: HierarchyContainer,
});
