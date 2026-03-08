import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import CabeceraDia from './CabeceraDia'
import ChipCompletado from './ChipCompletado'
import type { Completado, Actividad, ConfiguracionUsuario } from '@/tipos'

interface Props {
  fecha: string
  completadosDia: Completado[]
  actividades: Actividad[]
  configuracion: ConfiguracionUsuario | null
  esDelMes?: boolean
}

export default function ColumnaDia({ fecha, completadosDia, actividades, configuracion, esDelMes = true }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id: fecha, disabled: !esDelMes })

  const horasUsadas = completadosDia.reduce((sum, c) => {
    const act = actividades.find(a => a.id === c.actividad_id)
    return sum + (act ? act.duracion_minutos / 60 : 0)
  }, 0)

  return (
    <div
      className={cn(
        'flex flex-col border-r border-b border-gray-100 last:border-r-0 overflow-hidden bg-white',
        'min-h-[80px] md:min-h-[100px]',
        esDelMes && !isOver && 'hover:border-indigo-200 hover:bg-indigo-50/20',
        isOver && esDelMes && 'border-indigo-400 bg-indigo-50',
        !esDelMes && 'bg-gray-50/60'
      )}
    >
      <CabeceraDia
        fecha={fecha}
        configuracion={configuracion}
        horasUsadas={horasUsadas}
        esDelMes={esDelMes}
      />

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-1 pt-0.5 flex flex-wrap gap-1 content-start overflow-y-auto transition-colors duration-150 min-h-0',
          !esDelMes && 'pointer-events-none'
        )}
      >
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
