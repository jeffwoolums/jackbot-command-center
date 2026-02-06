interface StatusDotProps {
  status: 'online' | 'offline' | 'idle' | 'building' | 'ready' | 'active' | 'limited' | 'failed' | 'training'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
}

export function StatusDot({ status, size = 'md', pulse = true }: StatusDotProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const colorClasses = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    idle: 'bg-yellow-500',
    building: 'bg-amber-500',
    ready: 'bg-blue-500',
    active: 'bg-green-500',
    limited: 'bg-yellow-500',
    failed: 'bg-red-500',
    training: 'bg-purple-500'
  }

  const shouldPulse = pulse && (status === 'online' || status === 'active' || status === 'training')

  return (
    <div 
      className={`${sizeClasses[size]} ${colorClasses[status]} rounded-full ${shouldPulse ? 'animate-pulse' : ''}`}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
    />
  )
}