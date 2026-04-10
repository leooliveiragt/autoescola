import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/layout/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DirigêJá — Encontre seu instrutor de direção',
  description:
    'Plataforma de instrutores particulares de direção. Agende aulas com instrutores verificados perto de você.',
  keywords: 'CNH, instrutor de direção, aulas de direção, habilitação, autoescola particular',
  openGraph: {
    title: 'DirigêJá',
    description: 'Encontre instrutores de direção verificados perto de você',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
