import React, { Suspense } from 'react'
import HorarioDisciplina from '@/components/HorarioDisciplina/HorarioDisciplina'

export default function page() {
  return (
    <Suspense fallback={<div className="p-4">A carregar...</div>}>
      <HorarioDisciplina />
    </Suspense>
  )
}
