import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import { useState, type PropsWithChildren } from "react";

import type { AppRouter } from "../server/router.js";

export const trpc = createTRPCReact<AppRouter>();

export const TrpcProvider = ({ children }: PropsWithChildren) => {
	const [queryClient] = useState(() => new QueryClient());
	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: "/api/trpc",
				}),
			],
		}),
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	);
};
