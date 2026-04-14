/**
 * WhatsApp notification utility.
 * Currently logs to console. Connect to Z-API, Twilio or Meta WhatsApp Business API in production.
 *
 * Z-API example:
 *   POST https://api.z-api.io/instances/{instanceId}/token/{token}/send-text
 *   { "phone": "5511999999999", "message": "..." }
 *
 * Twilio example:
 *   client.messages.create({ from: 'whatsapp:+14155238886', to: 'whatsapp:+5511...', body: '...' })
 */

function formatarTelefone(telefone: string): string {
  const digits = telefone.replace(/\D/g, '').replace(/^0/, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}

export async function enviarWhatsapp(telefone: string, mensagem: string): Promise<void> {
  const numero = formatarTelefone(telefone)

  // ── Production: replace this block with your WhatsApp provider ──────────
  // const res = await fetch(`https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE}/token/${process.env.ZAPI_TOKEN}/send-text`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ phone: numero, message: mensagem }),
  // })
  // ────────────────────────────────────────────────────────────────────────

  console.log(`[WhatsApp] → ${numero}\n${mensagem}\n`)
}

export function msgBoasVindas(nome: string, role: 'INSTRUTOR' | 'ALUNO'): string {
  if (role === 'INSTRUTOR') {
    return (
      `✅ *Bem-vindo(a) à DirigêJá, ${nome}!*\n\n` +
      `Seu cadastro foi aprovado e seu perfil já está visível para os alunos.\n\n` +
      `Acesse seu painel agora em: ${process.env.NEXT_PUBLIC_APP_URL ?? 'https://dirigeja.com.br'}/instrutor/dashboard\n\n` +
      `Em caso de dúvidas, fale conosco aqui mesmo. 🚗`
    )
  }
  return (
    `✅ *Bem-vindo(a) à DirigêJá, ${nome}!*\n\n` +
    `Sua identidade foi verificada. Agora você pode buscar instrutores e agendar suas aulas.\n\n` +
    `Acesse: ${process.env.NEXT_PUBLIC_APP_URL ?? 'https://dirigeja.com.br'}/buscar\n\n` +
    `Bons estudos! 🎓`
  )
}

export function msgReprovado(nome: string, motivo: string, userId: string): string {
  const link = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://dirigeja.com.br'}/reenviar-docs?u=${userId}`
  return (
    `⚠️ *DirigêJá — Cadastro não aprovado*\n\n` +
    `Olá, ${nome}. Infelizmente não conseguimos verificar seus documentos.\n\n` +
    `*Motivo:* ${motivo}\n\n` +
    `Para reenviar seus documentos, acesse o link abaixo:\n${link}\n\n` +
    `Se precisar de ajuda, responda esta mensagem.`
  )
}
