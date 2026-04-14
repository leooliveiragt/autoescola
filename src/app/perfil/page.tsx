'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import {
  User, Mail, Phone, CreditCard, MapPin, ShieldCheck, Pencil, Save, Loader2, X, Calendar,
} from 'lucide-react'

const KYC_LABEL: Record<string, string> = {
  APROVADO: 'Verificado', PENDENTE: 'Em análise', EM_ANALISE: 'Em análise', REJEITADO: 'Reprovado',
}
const KYC_COLOR: Record<string, string> = {
  APROVADO: 'bg-green-50 text-green-700 border-green-200',
  PENDENTE: 'bg-amber-50 text-amber-700 border-amber-200',
  EM_ANALISE: 'bg-blue-50 text-blue-700 border-blue-200',
  REJEITADO: 'bg-red-50 text-red-700 border-red-200',
}

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [perfil, setPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ nome: '', telefone: '', cpf: '' })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?redirect=/perfil')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/aluno/perfil')
        .then(r => r.json())
        .then(d => {
          setPerfil(d)
          setForm({ nome: d.nome ?? '', telefone: d.telefone ?? '', cpf: d.cpf ?? '' })
        })
        .finally(() => setLoading(false))
    }
  }, [status])

  async function handleSave() {
    setSaving(true)
    await fetch('/api/aluno/perfil', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSaved(true)
    setPerfil((p: any) => ({ ...p, ...form }))
    setEditando(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (status === 'loading' || status === 'unauthenticated') return null

  const iniciais = session?.user?.name
    ? session.user.name.trim().split(' ').filter(Boolean).slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()
    : '?'

  const endereco = perfil?.enderecos?.[0]
  const kycStatus = perfil?.kyc?.status ?? null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Meu perfil
            </h1>
            <p className="text-sm text-gray-500 mt-1">Suas informações pessoais e histórico.</p>
          </div>
          {!editando && (
            <button
              onClick={() => setEditando(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-green-400 hover:text-green-700 transition-colors"
            >
              <Pencil className="w-4 h-4" /> Editar
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            {/* Avatar + nome */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center text-2xl font-extrabold shrink-0">
                  {perfil?.avatarUrl
                    ? <img src={perfil.avatarUrl} className="w-full h-full rounded-2xl object-cover" alt="" />
                    : iniciais}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">{perfil?.nome}</h2>
                  <p className="text-sm text-gray-500">{perfil?.email}</p>
                  {kycStatus && (
                    <span className={`inline-flex items-center gap-1.5 mt-2 text-xs font-semibold px-2.5 py-1 rounded-full border ${KYC_COLOR[kycStatus] ?? 'bg-gray-100 text-gray-500'}`}>
                      <ShieldCheck className="w-3 h-3" />
                      {KYC_LABEL[kycStatus] ?? kycStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Dados */}
              {editando ? (
                <div className="space-y-4">
                  {[
                    { label: 'Nome completo', key: 'nome', icon: User },
                    { label: 'Telefone / WhatsApp', key: 'telefone', icon: Phone },
                    { label: 'CPF', key: 'cpf', icon: CreditCard },
                  ].map(({ label, key, icon: Icon }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        {label}
                      </label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={(form as any)[key]}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setEditando(false)}
                      className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Nome', val: perfil?.nome, icon: User },
                    { label: 'E-mail', val: perfil?.email, icon: Mail },
                    { label: 'Telefone', val: perfil?.telefone ?? '—', icon: Phone },
                    { label: 'CPF', val: perfil?.cpf ?? '—', icon: CreditCard },
                  ].map(({ label, val, icon: Icon }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 truncate">{val}</p>
                    </div>
                  ))}
                </div>
              )}

              {saved && (
                <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center font-medium">
                  ✓ Perfil atualizado!
                </div>
              )}
            </div>

            {/* Endereço */}
            {endereco && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-700">Endereço cadastrado</h3>
                </div>
                <p className="text-sm text-gray-700">
                  {endereco.logradouro}{endereco.numero ? `, ${endereco.numero}` : ''} — {endereco.bairro}
                </p>
                <p className="text-sm text-gray-500">{endereco.cidade} / {endereco.estado} · CEP {endereco.cep}</p>
              </div>
            )}

            {/* Ações rápidas */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Acesso rápido</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/aluno/aulas"
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all"
                >
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Minhas aulas</p>
                    <p className="text-xs text-gray-500">Ver agendamentos</p>
                  </div>
                </Link>
                <Link
                  href="/buscar"
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all"
                >
                  <User className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Buscar instrutores</p>
                    <p className="text-xs text-gray-500">Agendar nova aula</p>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
