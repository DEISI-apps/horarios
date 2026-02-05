import React, { Suspense } from 'react'
import Cursos from '@/components/Cursos/Cursos'

export default function page() {
  return <>
    <Suspense fallback={<div className="p-4">A carregar...</div>}>
      <Cursos />
    </Suspense>
  </>
}
