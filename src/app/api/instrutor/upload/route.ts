import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
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

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo não permitido. Use JPG, PNG ou PDF.' }, { status: 400 })
    }

    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx 10 MB)' }, { status: 400 })
    }

    const rawExt = file.name?.split('.').pop()?.toLowerCase() ?? ''
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(rawExt) ? rawExt : 'bin'
    const fileName = `${session.user.id}-${Date.now()}.${safeExt}`

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    await writeFile(join(uploadDir, fileName), Buffer.from(bytes))

    return NextResponse.json({ url: `/uploads/${fileName}` })
  } catch (err) {
    console.error('[upload] erro:', err)
    return NextResponse.json({ error: 'Erro interno ao salvar o arquivo' }, { status: 500 })
  }
}
