import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/toast";
import { routeTree } from "./routeTree.gen";
import LostPage from "@/pages/lost";
import { AuthProvider } from "@/contexts/AuthContext";

// Create router instance using auto-generated routeTree
const router = createRouter({
	routeTree,
	defaultNotFoundComponent: LostPage,
});

// Register router for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5,
			refetchOnWindowFocus: false,
		},
	},
});

export function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<Toaster />
				<RouterProvider router={router} />
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default App;
