import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import LinkedInProvider from "next-auth/providers/linkedin"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder-secret",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "placeholder-id",
      clientSecret: process.env.GITHUB_SECRET || "placeholder-secret",
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "placeholder-id",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "placeholder-secret",
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "placeholder-secret-change-in-production",
  callbacks: {
    async jwt({ token, account, profile }) {
      // Store OAuth tokens in JWT
      if (account) {
        token.provider = account.provider
        if (account.provider === "github") {
          token.githubAccessToken = account.access_token
        }
        if (account.provider === "linkedin") {
          token.linkedinAccessToken = account.access_token
        }
        if (account.provider === "google") {
          // Google doesn't provide additional scopes for connecting accounts
          // But we store the provider info
        }
      }
      return token
    },
    async session({ session, token }) {
      // Add tokens to session
      if (token.githubAccessToken) {
        (session as any).githubAccessToken = token.githubAccessToken
      }
      if (token.linkedinAccessToken) {
        (session as any).linkedinAccessToken = token.linkedinAccessToken
      }
      // Store provider info
      if (token.provider) {
        (session as any).provider = token.provider
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
