import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#030712] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <Outlet />
    </div>
  );
}
