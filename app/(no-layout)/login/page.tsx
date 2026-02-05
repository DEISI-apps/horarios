"use client";

import { Suspense, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, LogIn } from "lucide-react";
import Image from "next/image";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = useMemo(() => {
    const errorCode = searchParams.get("error");
    if (!errorCode) return "";
    if (errorCode === "AccessDenied") return "Email nao autorizado.";
    return "Falha ao autenticar. Tente novamente.";
  }, [searchParams]);

  async function handleLogin() {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Image
              src="/deisi-ball.png"
              alt="DEISI"
              width={64}
              height={64}
              className="w-16 h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Horários DEISI</h1>
            <p className="text-gray-600">Aplicação de visualização de horários</p>
          </div>

          {/* Login */}
          <div className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? "A redirecionar..." : "Entrar com Google"}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Nota:</span> Só emails autorizados (tipicamente que comecem por pxxx ou fxxx) conseguem entrar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 animate-pulse">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full" />
            <div className="h-8 bg-gray-200 rounded mb-2 w-2/3 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
          </div>
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
