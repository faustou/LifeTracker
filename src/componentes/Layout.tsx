import { useEffect, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Settings, LogOut, Menu } from 'lucide-react'
import PanelActividades from './Actividades/PanelActividades'
import CalendarioMensual from './Calendario/CalendarioMensual'
import ModalConfiguracion from './ModalConfiguracion'
import { useAppStore } from '@/stores/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import type { Actividad, Completado } from '@/tipos'

export default function Layout() {
  const [modalConfigAbierto, setModalConfigAbierto] = useState(false)
  const [panelAbierto, setPanelAbierto] = useState(false)
  const { cerrarSesion } = useAuth()
  const {
    mesActual,
    cargarDatosMes,
    actividades,
    agregarCompletado,
    quitarCompletado,
    cargando,
  } = useAppStore()

  const [arrastrandoActividad, setArrastrandoActividad] = useState<Actividad | null>(null)
  const [arrastrandoCompletado, setArrastrandoCompletado] = useState<Completado | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  useEffect(() => {
    cargarDatosMes(mesActual)
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    document.body.style.overflow = 'hidden'
    const data = event.active.data.current as { type: string; actividad?: Actividad; completado?: Completado } | undefined
    if (data?.type === 'actividad' && data.actividad) setArrastrandoActividad(data.actividad)
    if (data?.type === 'completado' && data.completado) setArrastrandoCompletado(data.completado)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    document.body.style.overflow = ''
    const { active, over } = event
    const data = active.data.current as { type: string; actividad?: Actividad; completado?: Completado } | undefined

    setArrastrandoActividad(null)
    setArrastrandoCompletado(null)

    if (!data) return

    if (data.type === 'actividad' && over && data.actividad) {
      // Soltar actividad en un dia -> crear completado
      agregarCompletado({
        actividad_id: data.actividad.id,
        fecha_completado: over.id as string,
      })
    }

    if (data.type === 'completado' && !over && data.completado) {
      // Soltar chip fuera de cualquier columna -> eliminar completado
      quitarCompletado(data.completado.id)
    }
  }

  const actividadOverlay = arrastrandoActividad
  const completadoOverlay = arrastrandoCompletado
    ? actividades.find(a => a.id === arrastrandoCompletado.actividad_id)
    : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
          <div className="flex items-center gap-2">
            {/* Boton panel tablet */}
            <button
              onClick={() => setPanelAbierto(!panelAbierto)}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors hidden md:flex lg:hidden"
              title="Actividades"
            >
              <Menu size={16} />
            </button>
            <h1 className="text-base font-bold text-white tracking-tight">LifeTracker</h1>
          </div>
          <div className="flex items-center gap-1">
            {cargando && (
              <span className="text-xs text-gray-600 mr-2">Sincronizando...</span>
            )}
            <button
              onClick={() => setModalConfigAbierto(true)}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              title="Configuracion"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={cerrarSesion}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              title="Cerrar sesion"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Cuerpo */}
        <div className="flex flex-1 overflow-hidden relative">

          {/* Desktop: panel fijo izquierda */}
          <div className="hidden lg:flex shrink-0">
            <PanelActividades />
          </div>

          {/* Tablet: drawer desde la izquierda */}
          {panelAbierto && (
            <div
              className="absolute inset-0 z-40 bg-black/50 hidden md:block lg:hidden"
              onClick={() => setPanelAbierto(false)}
            />
          )}
          <div
            className={cn(
              'absolute inset-y-0 left-0 z-50 hidden md:flex lg:hidden transition-transform duration-300',
              panelAbierto ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <PanelActividades onCerrar={() => setPanelAbierto(false)} />
          </div>

          {/* Calendario */}
          <CalendarioMensual />

          {/* Mobile: bottom sheet */}
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 z-50 md:hidden transition-transform duration-300',
              panelAbierto ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]'
            )}
          >
            <PanelActividades
              modoMobile
              expandido={panelAbierto}
              onExpandir={() => setPanelAbierto(true)}
              onCerrar={() => setPanelAbierto(false)}
            />
          </div>
        </div>

        {modalConfigAbierto && (
          <ModalConfiguracion onCerrar={() => setModalConfigAbierto(false)} />
        )}
      </div>

      {/* Preview de arrastre */}
      <DragOverlay dropAnimation={null}>
        {actividadOverlay && (
          <div
            className="px-3 py-2 rounded-xl text-sm font-medium text-white shadow-2xl cursor-grabbing opacity-90 pointer-events-none"
            style={{ backgroundColor: actividadOverlay.color }}
          >
            {actividadOverlay.icono} {actividadOverlay.nombre}
          </div>
        )}
        {completadoOverlay && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white shadow-2xl cursor-grabbing opacity-90 pointer-events-none"
            style={{ backgroundColor: completadoOverlay.color }}
          >
            {completadoOverlay.icono && (
              <span className="text-base leading-none">{completadoOverlay.icono}</span>
            )}
            {completadoOverlay.nombre}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
