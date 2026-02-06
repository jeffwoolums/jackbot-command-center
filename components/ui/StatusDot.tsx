interface StatusDotProps {
  status: 'online' | 'offline' | 'idle' | 'building' | 'ready' | 'active'
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
    active: 'bg-green-500'
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${colorClasses[status]} rounded-full ${pulse && status === 'online' ? 'animate-pulse' : ''}`}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
    />
  )
}