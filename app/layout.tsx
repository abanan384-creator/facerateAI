
import { ScanProvider } from '@/context/ScanContext'
import './globals.css'

export const metadata = {
    title: 'FaceRate AI — Precision Face Analysis',
    description: 'AI-powered facial analysis with precision landmark scoring. Upload your photo for instant ratings.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="bg-bg text-text font-base antialiased">
                <ScanProvider>
                    {children}
                </ScanProvider>
            </body>
        </html>
    )
}
