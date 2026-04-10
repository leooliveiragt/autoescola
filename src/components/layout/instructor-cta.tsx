import Link from 'next/link'

export function InstructorCTA() {
  return (
    <section className="py-20 bg-green-600">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Você é instrutor de direção?
        </h2>
        <p className="text-green-100 text-base mb-8 max-w-lg mx-auto leading-relaxed">
          Crie seu perfil gratuitamente, defina seu preço e alcance alunos na sua região. A nova lei facilita seu trabalho como autônomo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register?role=instrutor" className="px-8 py-3.5 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-colors text-sm">
            Criar meu perfil de instrutor
          </Link>
          <Link href="/para-instrutores" className="px-8 py-3.5 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-sm">
            Saber mais
          </Link>
        </div>
        <div className="flex justify-center gap-8 mt-10 pt-8 border-t border-green-500">
          {[
            { val: 'R$0', label: 'Para criar o perfil' },
            { val: '85%', label: 'Você fica de cada aula' },
            { val: 'R$49/mês', label: 'Plano mensal' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold text-white">{s.val}</div>
              <div className="text-xs text-green-200 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
