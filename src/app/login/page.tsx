'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/buscar'

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      senha,
      redirect: false,
    })

    if (res?.ok) {
      const sessionRes = await fetch('/api/auth/session')
      const sessionData = await sessionRes.json()
      const role = sessionData?.user?.role

      if (role === 'ADMIN') {
        router.push('/admin')
      } else if (role === 'INSTRUTOR') {
        router.push('/instrutor/dashboard')
      } else {
        router.push(redirect)
      }
    } else {
      const err = res?.error ?? ''
      if (err === 'BLOQUEADO') setError('BLOQUEADO')
      else if (err === 'EM_ANALISE') setError('EM_ANALISE')
      else if (err === 'REJEITADO') setError('REJEITADO')
      else setError('Credenciais inválidas. Tente novamente.')
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await signIn('google', { callbackUrl: redirect })
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
          <p className="text-sm text-gray-500 mt-1">Bem-vindo de volta</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Entrar na sua conta</h1>
          <p className="text-sm text-gray-500 mb-7">Acesse para encontrar instrutores verificados perto de você.</p>

          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium mb-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">ou entre com e-mail</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm transition-colors pr-11"
                />
                <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/esqueci-senha" className="text-xs text-green-600 hover:text-green-700 font-medium">
                Esqueci minha senha
              </Link>
            </div>

            {error === 'BLOQUEADO' ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm space-y-3">
                <p className="font-semibold">Sua conta está bloqueada.</p>
                <p className="text-xs text-red-600">Entre em contato com o suporte para mais informações sobre o bloqueio.</p>
                <a
                  href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20minha%20conta%20foi%20bloqueada%20na%20DirigêJá.%20Preciso%20de%20ajuda."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Falar com o suporte via WhatsApp
                </a>
              </div>
            ) : error === 'EM_ANALISE' ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-2">
                <p className="font-semibold">Cadastro em análise</p>
                <p className="text-xs text-amber-700">Seus documentos estão sendo revisados pela nossa equipe. Você receberá uma mensagem no WhatsApp assim que houver resposta.</p>
              </div>
            ) : error === 'REJEITADO' ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm space-y-2">
                <p className="font-semibold">Cadastro reprovado</p>
                <p className="text-xs text-red-600">Verifique o WhatsApp cadastrado — enviamos um link para você reenviar seus documentos.</p>
              </div>
            ) : error ? (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Entrar
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Não tem conta?{' '}
          <Link href="/register" className="text-green-600 font-semibold hover:text-green-700">
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </div>
  )
}