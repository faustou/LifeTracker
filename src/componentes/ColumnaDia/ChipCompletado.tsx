import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import type { Completado, Actividad } from '@/tipos'

interface Props {
  completado: Completado
  actividad: Actividad
}

export default function ChipCompletado({ completado, actividad }: Props) {
  const { quitarCompletado } = useAppStore()
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null)
  const chipRef = useRef<HTMLDivElement | null>(null)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: completado.id,
    data: { type: 'completado', completado },
  })

  // Combinar ref de dnd-kit con el ref local para calcular posicion del popup
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    chipRef.current = node
    setNodeRef(node)
  }, [setNodeRef])

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return
    e.stopPropagation()
    if (popupPos) { setPopupPos(null); return }
    const rect = chipRef.current?.getBoundingClientRect()
    if (rect) {
      setPopupPos({
        top: rect.bottom + 6,
        left: Math.min(rect.left, window.innerWidth - 170),
      })
    }
  }

  // Cerrar popup al hacer click fuera
  useEffect(() => {
    if (!popupPos) return
    const close = () => setPopupPos(null)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [Boolean(popupPos)])

  const duracionLabel = actividad.duracion_minutos >= 60
    ? `${(actividad.duracion_minutos / 60).toFixed(1)}h`
    : `${actividad.duracion_minutos}min`

  const tieneIcono = Boolean(actividad.icono)

  return (
    <>
      <div
        ref={setRefs}
        style={{
          transform: CSS.Translate.toString(transform),
          backgroundColor: actividad.color,
        }}
        {...listeners}
        {...attributes}
        onClick={handleClick}
        className={cn(
          'group relative flex items-center justify-center cursor-grab select-none transition-opacity',
          tieneIcono ? 'h-5 w-5 rounded' : 'h-5 w-5 rounded-full',
          isDragging ? 'opacity-20 cursor-grabbing' : 'hover:brightness-110',
          // Area de tap minima para mobile
          'min-h-[20px] min-w-[20px] md:min-h-0 md:min-w-0'
        )}
      >
        {tieneIcono && (
          <span className="text-[10px] leading-none">{actividad.icono}</span>
        )}

        {/* Tooltip — solo desktop, hover con delay 300ms */}
        <div
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50',
            'pointer-events-none select-none whitespace-nowrap',
            'bg-gray-900 text-white text-xs px-2 py-1 rounded-lg shadow-lg',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-300',
            'hidden md:block'
          )}
        >
          {actividad.nombre} · {duracionLabel}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-gray-900" />
        </div>
      </div>

      {/* Popup click/tap — nombre + duracion + boton Quitar */}
      {popupPos && createPortal(
        <div
          style={{ top: popupPos.top, left: popupPos.left, position: 'fixed' }}
          className="z-[200] bg-white rounded-xl shadow-xl border border-gray-100 p-3 min-w-[160px]"
          onPointerDown={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-sm shrink-0"
              style={{ backgroundColor: actividad.color }}
            >
              {tieneIcono ? actividad.icono : null}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
                {actividad.nombre}
              </p>
              <p className="text-xs text-gray-400">{duracionLabel}</p>
            </div>
          </div>
          <button
            onClick={() => { quitarCompletado(completado.id); setPopupPos(null) }}
            className="w-full py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Quitar
          </button>
        </div>,
        document.body
      )}
    </>
  )
}
