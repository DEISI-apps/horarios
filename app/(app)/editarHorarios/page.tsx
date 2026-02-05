import React, { Suspense } from 'react'
import EditarHorarios from '@/components/EditarHorarios/EditarHorarios'

export default function page() {
  return <>
    <Suspense fallback={<div className="p-4">A carregar...</div>}>
      <EditarHorarios></EditarHorarios>
    </Suspense>
  </>
}
