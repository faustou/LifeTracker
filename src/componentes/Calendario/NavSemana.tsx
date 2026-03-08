import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAppStore } from '@/stores/useAppStore'

export default function NavSemana() {
  const { inicioSemanaActual, navegarSemana } = useAppStore()

  const inicio = parseISO(inicioSemanaActual)
  const fin = addDays(inicio, 6)

  const etiqueta = `${format(inicio, "d 'de' MMM", { locale: es })} – ${format(fin, "d 'de' MMM yyyy", { locale: es })}`

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-800 bg-gray-900/50">
      <button
        onClick={() => navegarSemana('anterior')}
        className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        title="Semana anterior"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-medium text-gray-200 capitalize flex-1 text-center">
        {etiqueta}
      </span>
      <button
        onClick={() => navegarSemana('siguiente')}
        className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        title="Semana siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
