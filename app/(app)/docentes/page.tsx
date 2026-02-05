import React, { Suspense } from 'react'
import HorarioDocente from '@/components/HorarioDocente/HorarioDocente'


export default function page() {
  return <>
    <Suspense fallback={<div className="p-4">A carregar...</div>}>
      <HorarioDocente />
    </Suspense>
  </>
}
