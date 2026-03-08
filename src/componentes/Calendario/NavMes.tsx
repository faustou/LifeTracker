import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAppStore } from '@/stores/useAppStore'

export default function NavMes() {
  const { mesActual, navegarMes } = useAppStore()

  const fecha = parseISO(mesActual + '-01')
  const etiqueta = format(fecha, 'MMMM yyyy', { locale: es })

  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white shrink-0">
      <button
        onClick={() => navegarMes('anterior')}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        title="Mes anterior"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-2xl font-semibold text-gray-900 capitalize flex-1 text-center">
        {etiqueta}
      </span>
      <button
        onClick={() => navegarMes('siguiente')}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        title="Mes siguiente"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
