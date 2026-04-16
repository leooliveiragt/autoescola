'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Menu, X, ChevronDown, User, LogOut, Settings, LayoutDashboard, MessageSquare, Calendar } from 'lucide-react'
import { AvaliacaoPrompt } from './avaliacao-prompt'

export function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <>
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Dirige<span className="text-green-600">Já</span>
          </span>
        </Link>

        {/* Nav links desktop */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/como-funciona" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
            Como funciona
          </Link>
          {session?.user.role !== 'ALUNO' && (
            <>
              <Link href="/para-instrutores" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                Para instrutores
              </Link>
              <Link href="/precos" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                Preços
              </Link>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {session.user.name?.split(' ')[0]}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                  </div>
                  {session.user.role === 'INSTRUTOR' ? (
                    <>
                      <Link href="/instrutor/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard className="w-4 h-4" /> Painel do instrutor
                      </Link>
                      <Link href="/instrutor/aulas" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="w-4 h-4" /> Minhas aulas
                      </Link>
                      <Link href="/instrutor/configuracoes" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="w-4 h-4" /> Configurações
                      </Link>
                    </>
                  ) : session.user.role === 'ADMIN' ? (
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <LayoutDashboard className="w-4 h-4" /> Admin
                    </Link>
                  ) : (
                    <>
                      <Link href="/buscar" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard className="w-4 h-4" /> Buscar instrutores
                      </Link>
                      <Link href="/aluno/aulas" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Calendar className="w-4 h-4" /> Minhas aulas
                      </Link>
                      <Link href="/perfil" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4" /> Meu perfil
                      </Link>
                    </>
                  )}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <Link href="/suporte" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <MessageSquare className="w-4 h-4" /> Suporte
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:text-green-600 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                Cadastre-se grátis
              </Link>
            </>
          )}

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-2">
          <Link href="/como-funciona" className="py-2 text-sm text-gray-700">Como funciona</Link>
          {session?.user.role !== 'ALUNO' && (
            <>
              <Link href="/para-instrutores" className="py-2 text-sm text-gray-700">Para instrutores</Link>
              <Link href="/precos" className="py-2 text-sm text-gray-700">Preços</Link>
            </>
          )}
          {!session && (
            <>
              <Link href="/login" className="py-2 text-sm font-medium text-gray-700 border-t border-gray-100 mt-2 pt-4">Entrar</Link>
              <Link href="/register" className="py-2 text-sm font-semibold text-green-600">Cadastre-se grátis</Link>
            </>
          )}
        </div>
      )}
    </nav>
    <AvaliacaoPrompt />
    </>
  )
}
