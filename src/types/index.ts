export type Role = 'ALUNO' | 'INSTRUTOR' | 'ADMIN'
export type KYCStatus = 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO'
export type AulaStatus = 'AGENDADA' | 'CONFIRMADA' | 'REALIZADA' | 'CANCELADA'
export type SubscriptionStatus = 'ATIVA' | 'CANCELADA' | 'EXPIRADA' | 'TRIAL'

export interface User {
  id: string
  nome: string
  email: string
  telefone?: string
  cpf?: string
  genero?: string
  avatarUrl?: string
  role: Role
  ativo: boolean
  createdAt: Date
  kyc?: KYC
  perfilInstrutor?: PerfilInstrutor
}

export interface KYC {
  id: string
  userId: string
  status: KYCStatus
  docFrenteUrl?: string
  docVersoUrl?: string
  comprovanteUrl?: string
  selfieUrl?: string
  observacaoAdmin?: string
  createdAt: Date
}

export interface Endereco {
  id: string
  cep: string
  logradouro: string
  numero?: string
  bairro: string
  cidade: string
  estado: string
  lat?: number
  lng?: number
}

export interface PerfilInstrutor {
  id: string
  userId: string
  bio?: string
  cnhEAR?: string
  precoPorHora: number
  raioAtendimentoKm: number
  transmissoes: string[]
  especialidades: string[]
  taxaAprovacao?: number
  totalAlunos: number
  anosExperiencia: number
  mediaAvaliacao: number
  totalAvaliacoes: number
  visivel: boolean
  user?: User
  subscription?: Subscription
  disponibilidades?: Disponibilidade[]
  distanciaKm?: number
}

export interface Disponibilidade {
  id: string
  instrutorId: string
  diaSemana: number
  horaInicio: string
  horaFim: string
  ativo: boolean
}

export interface Subscription {
  id: string
  status: SubscriptionStatus
  plano: string
  valorMensal: number
  inicioEm?: Date
  fimEm?: Date
}

export interface Aula {
  id: string
  alunoId: string
  instrutorId: string
  data: Date
  duracaoHoras: number
  precoPorHora: number
  totalPago: number
  status: AulaStatus
  aluno?: User
  instrutor?: User
  avaliacao?: Avaliacao
  createdAt: Date
}

export interface Avaliacao {
  id: string
  aulaId: string
  autorId: string
  alvoId: string
  nota: number
  comentario?: string
  autor?: User
  createdAt: Date
}

export interface FiltrosInstrutor {
  cidade?: string
  genero?: 'M' | 'F' | ''
  avaliacaoMinima?: number
  precoMaximo?: number
  distanciaMaximaKm?: number
  especialidades?: string[]
  ordenacao?: 'relevancia' | 'avaliacao' | 'preco_asc' | 'preco_desc' | 'distancia'
  pagina?: number
  limite?: number
}

export interface AdminMetrics {
  totalAlunos: number
  totalInstrutores: number
  instrutoresAtivos: number
  totalAulas: number
  aulasMes: number
  receitaMes: number
  kycPendentes: number
  subscricoesAtivas: number
  mediaAvaliacoes: number
  alunosNovosSetmana: number
  instrutoresNovosSetmana: number
}
