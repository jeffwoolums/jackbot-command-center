import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jackbot Command Center',
  description: 'AI Empire Operations Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
