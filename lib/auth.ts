import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  // ✅ ensure localhost works as http in dev
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

        // IMPORTANT: include id here
        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],

  // Your login page
  pages: { signIn: "/auth/login" },

  secret: process.env.NEXTAUTH_SECRET,

  // ✅ make sure user.id survives in JWT + session
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
};

// ✅ helper for Server Components / route handlers
export function auth() {
  return getServerSession(authOptions);
}
