import { isToday, parseISO, format } from 'date-fns'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { calcularHorasRestantes, colorPorHoras } from '@/lib/utilidadesFecha'
import CabeceraDia from './CabeceraDia'
import ChipCompletado from './ChipCompletado'
import type { Completado, Actividad, ConfiguracionUsuario } from '@/tipos'

interface Props {
  fecha: string
  completadosDia: Completado[]
  actividades: Actividad[]
  configuracion: ConfiguracionUsuario | null
  esDelMes?: boolean
  esSemanaActiva?: boolean
}

export default function ColumnaDia({ fecha, completadosDia, actividades, configuracion, esDelMes = true, esSemanaActiva }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id: fecha, disabled: !esDelMes })

  // Color por horas: todos los días del mes visible
  const horasRestantes = esDelMes && configuracion
    ? calcularHorasRestantes(fecha, completadosDia, actividades, configuracion)
    : null
  // Colores solo en semana activa; el badge de horas se muestra en todos los días del mes
  const colores = horasRestantes !== null && esSemanaActiva ? colorPorHoras(horasRestantes) : null
  const badgeHoras = horasRestantes !== null ? colorPorHoras(horasRestantes) : null

  const fechaObj = parseISO(fecha)
  const esHoy = isToday(fechaObj)
  const numeroDia = format(fechaObj, 'd')

  return (
    <div
      className={cn(
        'flex flex-col border-r border-b last:border-r-0 overflow-hidden transition-colors duration-300',
        'min-h-[72px] md:min-h-[100px]',
        isOver && esDelMes
          ? 'border-indigo-400 bg-indigo-100'
          : colores
            ? cn(colores.fondo, 'border-black/[0.08]')
            : esSemanaActiva && esDelMes
              ? 'bg-indigo-50 border-indigo-200'
              : esDelMes
                ? 'bg-white border-gray-100'
                : 'bg-gray-50/60 border-gray-100'
      )}
    >
      {/* Horas disponibles — todos los días del mes visible */}
      <CabeceraDia
        horasRestantes={horasRestantes}
        textoColor={badgeHoras?.texto ?? 'text-gray-400'}
        fondoColor={badgeHoras?.fondo ?? ''}
        esDelMes={esDelMes}
      />

      {/* Cuerpo: número del día + chips en el mismo flujo */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-1 flex flex-wrap gap-1 content-start items-start overflow-y-auto min-h-0',
          !esDelMes && 'pointer-events-none'
        )}
      >
        {/* Número del día — primera posición del flex */}
        <div
          className={cn(
            'w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full shrink-0',
            'text-[10px] md:text-xs font-bold leading-none',
            esHoy && esDelMes
              ? 'bg-indigo-600 text-white'
              : esDelMes
                ? 'text-gray-400'
                : 'text-gray-200'
          )}
        >
          {numeroDia}
        </div>

        {/* Chips de completados */}
        {completadosDia.map(completado => {
          const actividad = actividades.find(a => a.id === completado.actividad_id)
          if (!actividad) return null
          return (
            <ChipCompletado
              key={completado.id}
              completado={completado}
              actividad={actividad}
            />
          )
        })}
      </div>
    </div>
  )
}
