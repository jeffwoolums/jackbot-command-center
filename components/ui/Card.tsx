import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glow?: 'gold' | 'green' | 'blue' | 'none'
}

export function Card({ children, className = '', glow = 'none' }: CardProps) {
  const glowClasses = {
    gold: 'glow-gold',
    green: 'glow-green',
    blue: 'glow-blue',
    none: ''
  }

  return (
    <div className={`card ${glowClasses[glow]} ${className}`}>
      {children}
    </div>
  )
}