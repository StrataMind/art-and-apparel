'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface BackButtonProps {
  href?: string
  label?: string
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export default function BackButton({ 
  href, 
  label = 'Back',
  variant = 'ghost',
  size = 'sm',
  className = ""
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`flex items-center ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}