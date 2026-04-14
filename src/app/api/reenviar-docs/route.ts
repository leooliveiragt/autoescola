import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// Public endpoint — no auth required, uses user ID as token
export async function POST(req: NextRequest) {
  const form = await req.formData()
  const userId      = form.get('userId')      as string | null
  const docFrente   = form.get('docFrente')   as File | null
  const docVerso    = form.get('docVerso')    as File | null
  const comprovante = form.get('comprovante') as File | null
  const selfie      = form.get('selfie')      as File | null

  if (!userId) return NextResponse.json({ error: 'Usuário não identificado.' }, { status: 400 })
  if (!docFrente || !docVerso || !selfie) {
    return NextResponse.json({ error: 'Frente, verso e selfie são obrigatórios.' }, { status: 400 })
  }

  // Verify user exists and is REJEITADO
  const kyc = await prisma.kYC.findUnique({ where: { userId }, include: { user: true } })
  if (!kyc || kyc.status !== 'REJEITADO') {
    return NextResponse.json({ error: 'Reenvio não permitido.' }, { status: 403 })
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'kyc')
  await mkdir(uploadDir, { recursive: true })

  async function saveFile(file: File, prefix: string) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const name = `${prefix}-${userId}-${Date.now()}.${ext}`
    await writeFile(join(uploadDir, name), Buffer.from(await file.arrayBuffer()))
    return `/uploads/kyc/${name}`
  }

  const docFrenteUrl   = await saveFile(docFrente, 'frente')
  const docVersoUrl    = await saveFile(docVerso, 'verso')
  const selfieUrl      = await saveFile(selfie, 'selfie')
  const comprovanteUrl = comprovante ? await saveFile(comprovante, 'comprovante') : undefined

  await prisma.kYC.update({
    where: { userId },
    data: {
      docFrenteUrl,
      docVersoUrl,
      selfieUrl,
      comprovanteUrl,
      status: 'PENDENTE',
      observacaoAdmin: null,
      analisadoEm: null,
      analisadoPor: null,
    },
  })

  return NextResponse.json({ ok: true })
}

// GET — return user info + rejection reason for display
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('u')
  if (!userId) return NextResponse.json({ error: 'ID não informado.' }, { status: 400 })

  const kyc = await prisma.kYC.findUnique({
    where: { userId },
    include: { user: { select: { nome: true, email: true } } },
  })

  if (!kyc) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })
  if (kyc.status !== 'REJEITADO') return NextResponse.json({ error: 'Reenvio não permitido.' }, { status: 403 })

  return NextResponse.json({
    nome: kyc.user.nome,
    motivo: kyc.observacaoAdmin ?? 'Documentos ilegíveis ou inválidos.',
  })
}
