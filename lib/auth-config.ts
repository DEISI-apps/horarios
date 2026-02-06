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

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    signIn: async ({ profile }: Any) => {
      if (!profile?.email) {
        console.error("❌ No email in profile");
        return false;
      }

      const email = profile.email.toLowerCase().trim();
      const isAuthorized = authorizedEmails.includes(email);
      
      if (!isAuthorized) {
        console.warn(`⚠️ Unauthorized email: ${email}`);
      }
      
      return isAuthorized;
    },
    jwt: async ({ token, user }: Any) => {
      if (user) {
        token.email = user.email;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }: Any) => {
      if (session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
