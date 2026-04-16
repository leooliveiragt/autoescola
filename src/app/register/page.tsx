'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, GraduationCap, Car } from 'lucide-react'
import { signIn } from 'next-auth/react'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') === 'instrutor' ? 'INSTRUTOR' : 'ALUNO'

  const [role, setRole] = useState<'ALUNO' | 'INSTRUTOR'>(defaultRole as any)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao criar conta.')
        setLoading(false)
        return
      }

      // Auto login
      const loginRes = await signIn('credentials', {
        email,
        senha,
        redirect: false,
      })

      if (loginRes?.ok) {
        router.push('/kyc')
      } else {
        router.push('/login')
      }
    } catch {
      setError('Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Amber top accent */}
      <div className="fixed top-0 left-0 right-0 flex gap-3 h-1.5 z-50">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`flex-1 h-full ${i % 2 === 0 ? 'bg-amber-400' : 'bg-amber-100'}`} />
        ))}
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Dirige<span className="text-green-600">Já</span>
          </Link>
          <p className="text-sm text-gray-500 mt-1">Crie sua conta grátis</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>Criar conta</h1>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('ALUNO')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                role === 'ALUNO' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <GraduationCap className={`w-6 h-6 ${role === 'ALUNO' ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`text-sm font-semibold ${role === 'ALUNO' ? 'text-green-700' : 'text-gray-600'}`}>Sou Aluno</span>
              <span className="text-xs text-gray-400 text-center">Quero aprender a dirigir</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('INSTRUTOR')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                role === 'INSTRUTOR' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Car className={`w-6 h-6 ${role === 'INSTRUTOR' ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`text-sm font-semibold ${role === 'INSTRUTOR' ? 'text-green-700' : 'text-gray-600'}`}>Sou Instrutor</span>
              <span className="text-xs text-gray-400 text-center">Quero dar aulas</span>
            </button>
          </div>

          <button
            onClick={() => signIn('google', { callbackUrl: '/kyc' })}
            className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium mb-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Cadastrar com Google
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">ou preencha os dados</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="João Silva"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm transition-colors pr-11"
                />
                <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
            )}

            <p className="text-xs text-gray-400 leading-relaxed">
              Ao criar uma conta você concorda com nossos{' '}
              <Link href="/termos" className="text-green-600 underline">Termos de uso</Link>{' '}
              e{' '}
              <Link href="/privacidade" className="text-green-600 underline">Política de privacidade</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar conta e verificar identidade →
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Já tem conta?{' '}
          <Link href="/login" className="text-green-600 font-semibold hover:text-green-700">Entrar</Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return <Suspense><RegisterContent /></Suspense>
}
