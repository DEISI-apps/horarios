import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";

export const runtime = "nodejs";

const handler = NextAuth(authConfig);

// Exportar GET e POST directamente do handler
export const GET = handler;
export const POST = handler;
