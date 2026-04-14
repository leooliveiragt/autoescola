import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'INSTRUTOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    let formData: FormData
    try {
      formData = await req.formData()
    } catch {
      return NextResponse.json({ error: 'Falha ao processar o arquivo enviado' }, { status: 400 })
    }

    const file = formData.get('file') as File | null
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo não permitido. Use JPG, PNG ou WebP.' }, { status: 400 })
    }

    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Imagem muito grande (máx 5 MB)' }, { status: 400 })
    }

    const rawExt = file.name?.split('.').pop()?.toLowerCase() ?? ''
    const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'jpg'
    const fileName = `avatar-${session.user.id}-${Date.now()}.${safeExt}`

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    await writeFile(join(uploadDir, fileName), Buffer.from(bytes))

    const avatarUrl = `/uploads/${fileName}`

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl },
    })

    return NextResponse.json({ avatarUrl })
  } catch (err) {
    console.error('[POST /api/instrutor/avatar] erro:', err)
    return NextResponse.json({ error: 'Erro interno ao salvar a foto' }, { status: 500 })
  }
}
