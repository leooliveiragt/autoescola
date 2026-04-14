'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  CalendarDays,
  User,
  Settings,
  CreditCard,
  LogOut,
  Car,
  FileText,
} from 'lucide-react'

const links = [
  { href: '/instrutor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/instrutor/aulas', label: 'Minhas aulas', icon: CalendarDays },
  { href: '/instrutor/perfil', label: 'Meu perfil', icon: User },
  { href: '/instrutor/veiculo', label: 'Meu veículo', icon: Car },
  { href: '/instrutor/documentos', label: 'Documentos', icon: FileText },
  { href: '/instrutor/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/instrutor/assinatura', label: 'Assinatura', icon: CreditCard },
]

interface InstructorSidebarProps {
  userName: string
  userEmail: string
}

export function InstructorSidebar({ userName, userEmail }: InstructorSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-gray-100">
        <Link href="/" className="text-lg font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Dirige<span className="text-green-600">Já</span>
        </Link>
        <span className="ml-2 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Instrutor</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-green-600' : 'text-gray-400'}`} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + signout */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{userName.split(' ')[0]}</p>
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
