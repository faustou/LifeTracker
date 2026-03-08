import { addDays, format, parseISO } from 'date-fns'
import ColumnaDia from '../ColumnaDia/ColumnaDia'
import NavSemana from './NavSemana'
import { useAppStore } from '@/stores/useAppStore'

export default function CalendarioSemanal() {
  const { inicioSemanaActual, completados, actividades, configuracion } = useAppStore()

  const dias = Array.from({ length: 7 }, (_, i) =>
    format(addDays(parseISO(inicioSemanaActual), i), 'yyyy-MM-dd')
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <NavSemana />
      <div className="flex-1 flex overflow-x-auto">
        {dias.map(fecha => (
          <ColumnaDia
            key={fecha}
            fecha={fecha}
            completadosDia={completados.filter(c => c.fecha_completado === fecha)}
            actividades={actividades}
            configuracion={configuracion}
          />
        ))}
      </div>
    </div>
  )
}
