
export const metadata = {
    title: 'LooksMaxing AI',
    description: 'Precision Face Ratings MVP',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="bg-black text-white antialiased selection:bg-cyan-900 selection:text-white">
                {children}
            </body>
        </html>
    )
}
