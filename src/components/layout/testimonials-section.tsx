import { Star } from 'lucide-react'

const TESTIMONIALS = [
  { name: 'Ana Lima', cidade: 'São José dos Campos', nota: 5, texto: 'Passei na primeira tentativa! O Carlos foi incrível, muito paciente comigo que tinha muito medo de dirigir. Recomendo demais a plataforma.', iniciais: 'AL', bg: 'bg-green-100', text: 'text-green-800' },
  { name: 'Pedro Souza', cidade: 'Taubaté', nota: 5, texto: 'Encontrei a Fernanda pelo DirigêJá e foi a melhor decisão. Atendimento impecável, preço justo e horários flexíveis. Já indiquei para vários amigos.', iniciais: 'PS', bg: 'bg-blue-100', text: 'text-blue-800' },
  { name: 'Mariana Costa', cidade: 'Jacareí', nota: 5, texto: 'Plataforma muito fácil de usar. Em menos de 10 minutos já tinha encontrado um instrutor perto de casa e agendado minha primeira aula.', iniciais: 'MC', bg: 'bg-purple-100', text: 'text-purple-800' },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-green-600">Depoimentos</span>
          <h2 className="text-4xl font-extrabold tracking-tight mt-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Quem já passou por aqui
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="p-6 rounded-2xl border-2 border-gray-100 flex flex-col gap-4">
              <div className="flex gap-0.5">
                {[...Array(t.nota)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed flex-1">"{t.texto}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className={`w-9 h-9 rounded-full ${t.bg} ${t.text} flex items-center justify-center text-xs font-bold`}>
                  {t.iniciais}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.cidade}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
