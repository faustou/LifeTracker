import type { Actividad } from '@/tipos'

export default function PillDrag({ actividad }: { actividad: Actividad }) {
  return (
    <div
      style={{ backgroundColor: actividad.color }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg text-white text-sm font-medium cursor-grabbing opacity-95 pointer-events-none"
    >
      {actividad.icono && <span>{actividad.icono}</span>}
      <span>{actividad.nombre}</span>
    </div>
  )
}
