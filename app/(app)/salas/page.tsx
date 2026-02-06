import React, { Suspense } from 'react'
import HorarioSala from '@/components/HorarioSala/HorarioSala'


export default function page() {
  return (
    <Suspense fallback={<div className="p-4">A carregar...</div>}>
      <HorarioSala />
    </Suspense>
  )
}
