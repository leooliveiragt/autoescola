# DirigêJá 🚗

Marketplace de instrutores particulares de direção — inspirado na nova lei do Detran que remove a obrigatoriedade da autoescola para tirar a CNH.

## Tecnologias

| Camada | Stack |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Auth | NextAuth v5 (Credentials + Google OAuth) |
| Banco | PostgreSQL via Prisma ORM |
| Pagamentos | Stripe (assinaturas + PaymentIntents) |
| KYC | Upload de documentos + verificação manual admin |
| Deploy | Vercel (frontend) + Railway/Supabase (banco) |

## Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── login/                    # Login
│   ├── register/                 # Cadastro (aluno/instrutor)
│   ├── kyc/                      # Verificação de identidade (4 etapas)
│   ├── buscar/                   # Listagem de instrutores (protegida)
│   ├── instrutor/[id]/           # Perfil do instrutor
│   ├── pagamento/                # Checkout Stripe
│   ├── avaliar/                  # Avaliação pós-aula
│   ├── admin/                    # Painel admin
│   └── api/
│       ├── auth/register/        # Criar conta
│       ├── instrutores/          # Busca com filtros
│       ├── kyc/                  # Submeter documentos
│       ├── avaliacoes/           # Criar avaliação
│       ├── stripe/subscription/  # Criar assinatura instrutor
│       ├── stripe/webhook/       # Webhook Stripe
│       └── admin/kyc/[id]/       # Aprovar/rejeitar KYC
├── components/
│   ├── layout/                   # Navbar, Footer, Hero, etc.
│   ├── instrutor/                # Cards, filtros, perfil
│   ├── admin/                    # Dashboard admin
│   └── kyc/                      # Componentes KYC
├── lib/
│   ├── prisma.ts                 # Cliente Prisma singleton
│   ├── auth.ts                   # NextAuth config
│   ├── stripe.ts                 # Stripe helpers
│   └── utils.ts                  # Utilitários
└── types/index.ts                # Tipos TypeScript
```

## Setup

### 1. Clonar e instalar

```bash
git clone https://github.com/seu-usuario/dirigeja
cd dirigeja
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Preencha o `.env` com:

- `DATABASE_URL` — URL do PostgreSQL (ex: Supabase ou Railway)
- `NEXTAUTH_SECRET` — gere com `openssl rand -base64 32`
- `STRIPE_SECRET_KEY` e `STRIPE_PUBLISHABLE_KEY` — do dashboard Stripe
- `STRIPE_WEBHOOK_SECRET` — gerado ao criar webhook no Stripe
- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` — opcional, para login Google

### 3. Banco de dados

```bash
npx prisma db push       # Criar tabelas
npm run db:seed          # Popular com dados de teste
```

### 4. Rodar em dev

```bash
npm run dev
```

Acesse: http://localhost:3000

### 5. Configurar Stripe

1. Crie dois preços no dashboard Stripe:
   - Plano Mensal: R$49/mês recorrente
   - Plano Anual: R$468/ano recorrente
2. Copie os `price_...` IDs para o `.env`
3. Para webhooks locais: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Fluxos principais

### Aluno
1. Acessa `/` → Landing page pública
2. Clica em qualquer CTA → Redireciona para `/login`
3. Cria conta em `/register` (role=ALUNO)
4. Faz KYC em `/kyc` (4 etapas: dados, docs, selfie, revisão)
5. Busca instrutores em `/buscar` com filtros
6. Vê perfil em `/instrutor/[id]`
7. Agenda e paga em `/pagamento`
8. Avalia em `/avaliar`

### Instrutor
1. Cria conta em `/register?role=instrutor`
2. Faz KYC com dados profissionais (CNH EAR, preço/hora, bio)
3. Escolhe plano de assinatura (mensal/anual via Stripe)
4. Admin aprova KYC → perfil fica visível
5. Recebe reservas e avaliações

### Admin
- Acessa `/admin` (role=ADMIN obrigatório)
- Métricas: alunos, instrutores, aulas, receita
- Aprova/rejeita KYC
- Gerencia usuários e assinaturas

## Credenciais de teste (após seed)

| Usuário | E-mail | Senha |
|---|---|---|
| Admin | admin@dirigeja.com.br | admin123 |
| Aluno | joao@email.com | aluno123 |
| Instrutor | carlos@dirigeja.com.br | instrutor123 |

## Deploy (Vercel + Railway)

```bash
# Deploy Next.js
vercel --prod

# Variáveis de ambiente no Vercel Dashboard
# Configure todas as vars do .env.example

# Webhook Stripe em produção:
# URL: https://seu-dominio.vercel.app/api/stripe/webhook
```

## Roadmap futuro

- [ ] Chat em tempo real entre aluno e instrutor
- [ ] Calendário de disponibilidade do instrutor
- [ ] App mobile (React Native)
- [ ] Integração Google Maps para rota até o instrutor
- [ ] Sistema de pacotes de aulas (desconto por volume)
- [ ] Certificado de conclusão digital
- [ ] Stripe Identity para KYC automatizado
