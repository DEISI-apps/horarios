import React, { Suspense } from 'react'
import TurmasAlunos from '@/components/TurmasAlunos/TurmasAlunos'
import { Loader2 } from 'lucide-react'

function LoadingFallback() {
  return (
    <div className="flex justify-center items-center h-32">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-gray-500 ml-3">A carregar...</p>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TurmasAlunos />
    </Suspense>
  )
}
