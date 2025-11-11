'use client'

import { HeroUIProvider } from '@heroui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
    // Create QueryClient inside component to ensure a new instance per request
    // This prevents sharing state between users in SSR
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Disable automatic refetching to reduce network calls
                        staleTime: 1000 * 60 * 5, // 5 minutes
                        refetchOnWindowFocus: false,
                        retry: 1,
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            <HeroUIProvider>{children}</HeroUIProvider>
        </QueryClientProvider>
    )
}
