import { useEffect, useState } from 'react'
import { EyroEye } from './EyroEye'

interface Props { onComplete: () => void }

export function LaunchScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 120)
    const t2 = setTimeout(() => setPhase('exit'), 2200)
    const t3 = setTimeout(() => onComplete(), 2700)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`launch-screen launch-${phase}`}>
      <EyroEye state="idle" size={260} />
    </div>
  )
}
