import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const kyc = await prisma.kYC.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json(kyc ?? { status: null })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const form = await req.formData()
  const docFrente   = form.get('docFrente')   as File | null
  const docVerso    = form.get('docVerso')    as File | null
  const comprovante = form.get('comprovante') as File | null
  const selfie      = form.get('selfie')      as File | null

  if (!docFrente || !docVerso || !selfie) {
    return NextResponse.json({ error: 'Frente, verso e selfie são obrigatórios.' }, { status: 400 })
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'kyc')
  await mkdir(uploadDir, { recursive: true })

  async function saveFile(file: File, prefix: string) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const name = `${prefix}-${session!.user.id}-${Date.now()}.${ext}`
    await writeFile(join(uploadDir, name), Buffer.from(await file.arrayBuffer()))
    return `/uploads/kyc/${name}`
  }

  const docFrenteUrl    = await saveFile(docFrente, 'frente')
  const docVersoUrl     = await saveFile(docVerso, 'verso')
  const selfieUrl       = await saveFile(selfie, 'selfie')
  const comprovanteUrl  = comprovante ? await saveFile(comprovante, 'comprovante') : undefined

  const kyc = await prisma.kYC.upsert({
    where: { userId: session.user.id },
    update: { docFrenteUrl, docVersoUrl, selfieUrl, comprovanteUrl, status: 'PENDENTE' },
    create: { userId: session.user.id, docFrenteUrl, docVersoUrl, selfieUrl, comprovanteUrl, status: 'PENDENTE' },
  })

  return NextResponse.json(kyc, { status: 201 })
}
