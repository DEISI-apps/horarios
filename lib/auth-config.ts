import { readFileSync } from "fs";
import { join } from "path";
import GoogleProvider from "next-auth/providers/google";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

// Função para carregar e processar emails do ficheiro
function loadAuthorizedEmails(): string[] {
  try {
    const filePath = join(process.cwd(), "data", "emails.txt");
    const fileContent = readFileSync(filePath, "utf-8");
    
    // Extrair emails entre < e >
    const emailRegex = /<([^>]+)>/g;
    const emails: string[] = [];
    let match;
    
    while ((match = emailRegex.exec(fileContent)) !== null) {
      const email = match[1].trim().toLowerCase();
      if (email && !emails.includes(email)) {
        emails.push(email);
      }
    }
    
    console.log(`✓ Loaded ${emails.length} authorized emails`);
    return emails;
  } catch (error) {
    console.error("Erro ao carregar emails autorizados:", error);
    return [];
  }
}

const authorizedEmails = loadAuthorizedEmails();

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ profile }: Any) {
      const email = profile?.email?.toLowerCase().trim();
      if (!email) {
        return false;
      }

      return authorizedEmails.includes(email);
    },
    async jwt({ token, user }: Any) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: Any) {
      if (session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};
