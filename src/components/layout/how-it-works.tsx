export function HowItWorks() {
  const steps = [
    { num: '01', title: 'Crie sua conta grátis', desc: 'Cadastro rápido com verificação de identidade (KYC). Seus dados protegidos com criptografia.' },
    { num: '02', title: 'Escolha seu instrutor', desc: 'Filtre por localização, preço, gênero e avaliação. Perfis completos com depoimentos reais.' },
    { num: '03', title: 'Agende e dirija', desc: 'Escolha data, horário e pague com segurança via Stripe. Após a aula, avalie o instrutor.' },
  ]
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-green-600">Como funciona</span>
          <h2 className="text-4xl font-extrabold tracking-tight mt-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Simples, rápido e seguro</h2>
          <p className="text-gray-500 mt-3 text-base max-w-md mx-auto">Três passos para você começar a aprender a dirigir com o instrutor ideal.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="p-8 rounded-2xl border-2 border-gray-100 hover:border-green-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-700 font-extrabold text-lg mb-5" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {s.num}
              </div>
              <h3 className="text-lg font-bold mb-2 tracking-tight">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
