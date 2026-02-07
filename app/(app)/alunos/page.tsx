import React, { Suspense } from 'react'
import HorarioAluno from '@/components/HorarioAluno/HorarioAluno'


export default function page() {
  return <>
    <Suspense fallback={<div className="p-4">A carregar...</div>}>
      <HorarioAluno />
    </Suspense>
  </>
}
