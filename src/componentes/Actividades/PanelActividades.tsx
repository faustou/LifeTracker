import { useState } from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { startOfWeek, format } from 'date-fns'
import TarjetaActividad from './TarjetaActividad'
import ModalActividad from './ModalActividad'
import { useAppStore } from '@/stores/useAppStore'

interface Props {
  modoMobile?: boolean
  expandido?: boolean
  onExpandir?: () => void
  onCerrar?: () => void
}

export default function PanelActividades({ modoMobile, expandido, onExpandir, onCerrar }: Props) {
  const { actividades, completados } = useAppStore()

  // Siempre mostrar progreso de la semana donde cae hoy (independiente del mes visible)
  const inicioSemanaHoy = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const completadosSemana = completados.filter(c => c.inicio_semana === inicioSemanaHoy)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [actividadEditandoId, setActividadEditandoId] = useState<string | null>(null)

  const actividadesActivas = actividades.filter(a => !a.archivada)

  const abrirCrear = () => {
    setActividadEditandoId(null)
    setModalAbierto(true)
  }

  const abrirEditar = (id: string) => {
    setActividadEditandoId(id)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setActividadEditandoId(null)
  }

  // Bottom sheet para mobile
  if (modoMobile) {
    return (
      <div className="flex flex-col bg-gray-900 rounded-t-2xl shadow-2xl border-t border-gray-800">
        {/* Handle */}
        <div
          className="flex flex-col items-center pt-2 pb-1 cursor-pointer shrink-0"
          onClick={() => expandido ? onCerrar?.() : onExpandir?.()}
        >
          <div className="w-8 h-1 rounded-full bg-gray-700 mb-2" />
          <div className="flex items-center justify-between w-full px-4 pb-1">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Actividades
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={e => { e.stopPropagation(); abrirCrear() }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
              >
                <Plus size={11} />
                Nueva
              </button>
              {expandido && (
                <button
                  onClick={e => { e.stopPropagation(); onCerrar?.() }}
                  className="p-1 rounded-lg hover:bg-gray-800 text-gray-500"
                >
                  <ChevronDown size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista horizontal de tarjetas compactas */}
        <div className="flex gap-2 px-3 pb-3 overflow-x-auto overscroll-x-contain">
          {actividadesActivas.length === 0 && (
            <p className="text-gray-600 text-xs py-2">Crea una actividad y arrastrala al calendario.</p>
          )}
          {actividadesActivas.map(actividad => {
            const cantidad = completadosSemana.filter(c => c.actividad_id === actividad.id).length
            return (
              <TarjetaActividad
                key={actividad.id}
                actividad={actividad}
                completadosSemana={cantidad}
                onEditar={() => abrirEditar(actividad.id)}
                compacta
              />
            )
          })}
        </div>

        {modalAbierto && (
          <ModalActividad
            actividadId={actividadEditandoId}
            onCerrar={cerrarModal}
          />
        )}
      </div>
    )
  }

  return (
    <aside className="w-72 shrink-0 flex flex-col border-r border-gray-800 bg-gray-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Actividades
        </h2>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
        >
          <Plus size={12} />
          Nueva
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {actividadesActivas.length === 0 && (
          <div className="text-center mt-12 px-4">
            <p className="text-gray-600 text-sm">No tenes actividades.</p>
            <p className="text-gray-700 text-xs mt-1">
              Crea una y arrastrala al calendario.
            </p>
          </div>
        )}

        {actividadesActivas.map(actividad => {
          const cantidad = completadosSemana.filter(c => c.actividad_id === actividad.id).length
          return (
            <TarjetaActividad
              key={actividad.id}
              actividad={actividad}
              completadosSemana={cantidad}
              onEditar={() => abrirEditar(actividad.id)}
            />
          )
        })}
      </div>

      {modalAbierto && (
        <ModalActividad
          actividadId={actividadEditandoId}
          onCerrar={cerrarModal}
        />
      )}
    </aside>
  )
}
