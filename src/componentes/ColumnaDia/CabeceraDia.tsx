import { cn } from '@/lib/utils'

interface Props {
  horasRestantes: number | null
  textoColor: string
  fondoColor: string
  esDelMes?: boolean
}

export default function CabeceraDia({ horasRestantes, textoColor, fondoColor, esDelMes = true }: Props) {
  if (!esDelMes) return null

  const horasStr = horasRestantes !== null
    ? (horasRestantes > 0
        ? horasRestantes.toFixed(horasRestantes % 1 === 0 ? 0 : 1)
        : '0') + 'h'
    : null

  return (
    <div className="flex items-center justify-end px-1.5 py-1 border-b border-black/[0.06] shrink-0 min-h-[24px]">
      {horasStr !== null && (
        <span
          className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none',
            fondoColor,
            textoColor
          )}
        >
          {horasStr} libres
        </span>
      )}
    </div>
  )
}
