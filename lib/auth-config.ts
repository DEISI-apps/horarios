import GoogleProvider from "next-auth/providers/google";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

// Função para carregar emails da variável de ambiente
function loadAuthorizedEmails(): string[] {
  const emailsEnv = process.env.AUTHORIZED_EMAILS || "";
  
  if (!emailsEnv) {
    console.warn("⚠️ AUTHORIZED_EMAILS environment variable not set");
    return [];
  }
  
  // Suporta emails separados por vírgula ou quebra de linha
  const emails = emailsEnv
    .split(/[,\n]/)
    .map(email => email.trim().toLowerCase())
    .filter(email => email && email.includes("@"));
  
  console.log(`✓ Loaded ${emails.length} authorized emails`);
  return emails;
}

const authorizedEmails = loadAuthorizedEmails();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function fetchAlunoByEmail(email: string): Promise<{ aluno: string; numero: string } | null> {
  try {
    const response = await fetch(
      `https://horariosdeisi.pythonanywhere.com/aluno-numero/${encodeURIComponent(email)}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data?.aluno && data?.numero) {
      return { aluno: data.aluno, numero: data.numero };
    }

    return null;
  } catch (error) {
    console.error("Erro ao validar aluno:", error);
    return null;
  }
}

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: requireEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    signIn: async ({ profile }: Any) => {
      if (!profile?.email) {
        console.error("❌ No email in profile");
        return false;
      }

      const email = profile.email.toLowerCase().trim();
      const isDocente = authorizedEmails.includes(email);

      if (isDocente) {
        return true;
      }

      const aluno = await fetchAlunoByEmail(email);
      if (!aluno) {
        console.warn(`⚠️ Aluno não encontrado: ${email}`);
        return false;
      }

      return true;
    },
    jwt: async ({ token, user }: Any) => {
      if (user) {
        token.email = user.email;
        token.id = user.id;
      }

      if (token.email && !token.role) {
        const email = String(token.email).toLowerCase().trim();
        const isDocente = authorizedEmails.includes(email);

        if (isDocente) {
          token.role = "docente";
        } else {
          const aluno = await fetchAlunoByEmail(email);
          if (aluno) {
            token.role = "aluno";
            token.numero = aluno.numero;
            token.name = aluno.aluno;
          }
        }
      }

      return token;
    },
    session: async ({ session, token }: Any) => {
      if (session.user) {
        const user = session.user as Any;
        user.email = token.email as string;
        user.role = token.role as string;
        user.numero = token.numero as string;
        if (token.name) {
          user.name = token.name as string;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
