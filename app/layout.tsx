import './globals.css'
import { Providers } from './providers'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Acid Tango Technical Test',
    description: 'Technical test for Acid Tango',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`antialiased`} suppressHydrationWarning>
                <Providers>
                    {children}
                    <ToastContainer />
                </Providers>
            </body>
        </html>
    )
}
