'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Users, Car, DollarSign, Star, LayoutDashboard, FileCheck, LogOut,
  MessageSquare, Settings, ChevronDown, ChevronRight, Banknote,
} from 'lucide-react'
import { useState } from 'react'

export function AdminSidebar({ kycPendentes = 0, sacPendentes = 0 }: { kycPendentes?: number; sacPendentes?: number }) {
  const pathname = usePathname()
  const [pagamentosOpen, setPagamentosOpen] = useState(pathname.startsWith('/admin/pagamentos'))

  const isActive = (href: string) =>
    href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  function NavItem({ icon: Icon, label, href, badge }: { icon: any; label: string; href: string; badge?: number }) {
    const active = isActive(href)
    return (
      <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-green-600' : 'text-gray-400'}`} />
        {label}
        {badge && badge > 0 ? <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">{badge}</span> : null}
      </Link>
    )
  }

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0 min-h-screen">
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/" className="text-base font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Dirige<span className="text-green-600">Já</span>
        </Link>
        <div className="text-xs text-gray-400 mt-0.5">Painel Admin</div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <NavItem icon={LayoutDashboard} label="Visão geral" href="/admin" />
        <NavItem icon={Users} label="Alunos" href="/admin/alunos" />
        <NavItem icon={Car} label="Instrutores" href="/admin/instrutores" />
        <NavItem icon={FileCheck} label="Fila KYC" href="/admin/kyc" badge={kycPendentes} />
        <NavItem icon={Star} label="Avaliações" href="/admin/avaliacoes" />
        <NavItem icon={MessageSquare} label="SAC" href="/admin/sac" badge={sacPendentes} />
        <NavItem icon={Settings} label="Parâmetros" href="/admin/parametros" />

        {/* Pagamentos — collapsible */}
        <div>
          <button
            onClick={() => setPagamentosOpen(v => !v)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith('/admin/pagamentos') ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <DollarSign className={`w-4 h-4 shrink-0 ${pathname.startsWith('/admin/pagamentos') ? 'text-green-600' : 'text-gray-400'}`} />
            Pagamentos
            <span className="ml-auto">{pagamentosOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}</span>
          </button>
          {pagamentosOpen && (
            <div className="ml-7 mt-0.5 flex flex-col gap-0.5">
              <Link href="/admin/pagamentos" className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${pathname === '/admin/pagamentos' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                Visão geral
              </Link>
              <Link href="/admin/pagamentos/liberar" className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${pathname === '/admin/pagamentos/liberar' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                <Banknote className="w-3.5 h-3.5" /> Liberar repasses
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair do admin
        </button>
      </div>
    </aside>
  )
}
