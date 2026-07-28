import { Toaster as SonnerToaster, toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
        },
        className: 'font-sans border border-gray-200 dark:border-gray-800 shadow-lg',
      }}
    />
  );
}

export { toast };
