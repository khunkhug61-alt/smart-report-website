import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Navbar } from '@/components/navbar'
import './globals.css'

const geistSans = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Smart Report - ระบบแจ้งปัญหาภายในวิทยาลัย',
  description: 'ระบบแจ้งปัญหาภายในวิทยาลัยอาชีวศึกษาภักดีพณิชยการและเทคโนโลยี สำหรับนักศึกษาและบุคลากร',
  keywords: ['แจ้งปัญหา', 'วิทยาลัย', 'ภักดีพณิชยการ', 'Smart Report'],
}

export const viewport: Viewport = {
  themeColor: '#3b5998',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="min-h-screen font-sans antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-border bg-card py-6">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
            <p>วิทยาลัยอาชีวศึกษาภักดีพณิชยการและเทคโนโลยี</p>
            <p className="mt-1">Smart Report System</p>
          </div>
        </footer>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
