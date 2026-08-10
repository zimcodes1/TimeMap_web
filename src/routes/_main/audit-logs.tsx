import { createFileRoute } from '@tanstack/react-router';
import AuditLogsContainer from '@/app/main/AuditLogs';

export const Route = createFileRoute('/_main/audit-logs')({
  component: AuditLogsContainer,
  beforeLoad: () => document.title = "System Audits | NSUK TimeMap"
});
