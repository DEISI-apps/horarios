import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Verifica se há sessão via cookie
  const sessionToken = 
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  const pathname = request.nextUrl.pathname;

  // Permite acesso à página de login e rotas de API de auth sem autenticação
  if (
    pathname === "/login" ||
    pathname === "/disciplinas-lei" ||
    pathname === "/turmas-lei" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") // arquivos estáticos como favicon.ico
  ) {
    return NextResponse.next();
  }

  // Redireciona para login se não estiver autenticado
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protege todas as rotas excepto estáticos
    "/((?!_next/static|_next/image).*)",
  ],
};
