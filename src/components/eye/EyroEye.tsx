import eyroEyeSrc from '../../assets/eyro_eye.svg'

export type EyeState = 'idle' | 'processing' | 'error' | 'warning' | 'capability' | 'network' | 'disabled'

interface Props {
  state?: EyeState
  size?: number
  className?: string
  style?: React.CSSProperties
}

export function EyroEye({ state = 'idle', size = 300, className = '', style }: Props) {
  const aspect = 551 / 747
  return (
    <div
      className={`eyro-eye-wrap eye-${state} ${className}`}
      style={{ width: size, height: Math.round(size * aspect), flexShrink: 0, ...style }}
    >
      <img
        src={eyroEyeSrc}
        alt=""
        draggable={false}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}
