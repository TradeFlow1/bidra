import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { getBaseUrl } from "@/lib/base-url";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  useSecureCookies: process.env.NODE_ENV === "production",

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],

  pages: { signIn: "/auth/login" },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async redirect({ url }) {
      const canonical = getBaseUrl();

      if (url && url.startsWith("/")) return canonical + url;

      try {
        const u = new URL(url);
        const c = new URL(canonical);
        if (u.origin === c.origin) return url;
      } catch {}

      return canonical;
    },
async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        (token as any).role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
