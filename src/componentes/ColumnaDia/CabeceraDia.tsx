import { format, isToday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { ConfiguracionUsuario } from '@/tipos'

interface Props {
  fecha: string
  configuracion: ConfiguracionUsuario | null
  horasUsadas: number
  esDelMes?: boolean
}

export default function CabeceraDia({ fecha, configuracion, horasUsadas, esDelMes = true }: Props) {
  const fechaObj = parseISO(fecha)
  const esHoy = isToday(fechaObj)
  const numeroDia = format(fechaObj, 'd')

  const horasLibres = configuracion && esDelMes
    ? Math.max(0, 24 - configuracion.horas_sueno - configuracion.horas_trabajo - horasUsadas)
    : null

  return (
    <div
      className={cn(
        'px-1.5 pt-1.5 pb-1 border-b border-gray-100 shrink-0',
        !esDelMes && 'opacity-40'
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <div
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold leading-none',
            esHoy && esDelMes
              ? 'bg-indigo-600 text-white'
              : esDelMes
                ? 'text-gray-700'
                : 'text-gray-300'
          )}
        >
          {numeroDia}
        </div>
        {horasLibres !== null && (
          <span className="text-[10px] text-gray-400 leading-none mt-1.5 shrink-0">
            {horasLibres.toFixed(0)}h
          </span>
        )}
      </div>
    </div>
  )
}
