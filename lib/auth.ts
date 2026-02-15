import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { getBaseUrl } from "@/lib/base-url";
import { rateLimit } from "@/lib/rate-limit";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  useSecureCookies: process.env.NODE_ENV === "production" && !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(\/|$)/i.test(String(process.env.NEXTAUTH_URL || "")),

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();

        // P0: login rate-limit + temporary lockout (in-memory, per-instance)
        const windowMs = 15 * 60 * 1000;

        const headersAny = (req as any)?.headers;
        const xf =
          typeof headersAny?.get === "function"
            ? String(headersAny.get("x-forwarded-for") || "")
            : String((headersAny && (headersAny["x-forwarded-for"] || headersAny["X-Forwarded-For"])) || "");

        const xr =
          typeof headersAny?.get === "function"
            ? String(headersAny.get("x-real-ip") || "")
            : String((headersAny && (headersAny["x-real-ip"] || headersAny["X-Real-Ip"])) || "");

        const ipRaw = (xf.split(",")[0] || xr || "").trim();
        const ip = ipRaw || "unknown";

        const okIp = rateLimit(`login:ip:${ip}`, 20, windowMs);
        const okEmail = rateLimit(`login:email:${email}`, 8, windowMs);

        if (!okIp || !okEmail) {
          throw new Error("Too many login attempts. Please wait 15 minutes and try again.");
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        // STEP 1D: Email verification gate (no login until verified)
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }
        // Matchbox: legacy-heal activation (older users may be verified but not active)
        if (user.emailVerified && user.isActive === false) {
          await prisma.user.update({
            where: { id: user.id },
            data: { isActive: true },
          });
          // keep local value consistent for this login
          (user as unknown as { isActive?: boolean }).isActive = true;
        }
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          dob: user.dob ?? null,
          ageVerified: user.ageVerified ?? false,
          emailVerified: user.emailVerified ?? false,
          phoneVerified: user.phoneVerified ?? false,
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
        token.id = (user as unknown as { id: string }).id;
        (token as unknown as { role?: string }).role = (user as unknown as { role?: string }).role;
        (token as unknown as { dob?: unknown }).dob = (user as unknown as { dob?: unknown }).dob ?? null;
        (token as unknown as { ageVerified?: boolean }).ageVerified = (user as unknown as { ageVerified?: boolean }).ageVerified ?? false;
        (token as unknown as { emailVerified?: boolean }).emailVerified = (user as unknown as { emailVerified?: boolean }).emailVerified ?? false;
        (token as unknown as { phoneVerified?: boolean }).phoneVerified = (user as unknown as { phoneVerified?: boolean }).phoneVerified ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { id?: string }).id = (token as unknown as { id?: string }).id;
        (session.user as unknown as { role?: string }).role = (token as unknown as { role?: string }).role;
        (session.user as unknown as { dob?: unknown }).dob = (token as unknown as { dob?: unknown }).dob ?? null;
        (session.user as unknown as { ageVerified?: boolean }).ageVerified = (token as unknown as { ageVerified?: boolean }).ageVerified ?? false;
        (session.user as unknown as { emailVerified?: boolean }).emailVerified = (token as unknown as { emailVerified?: boolean }).emailVerified ?? false;
        (session.user as unknown as { phoneVerified?: boolean }).phoneVerified = (token as unknown as { phoneVerified?: boolean }).phoneVerified ?? false;
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
