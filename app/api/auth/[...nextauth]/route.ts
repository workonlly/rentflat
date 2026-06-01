import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return !!user.email;
    },
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "google") {
        token.googleEmail = user?.email || profile?.email || token.email;
        token.googleName = user?.name || profile?.name || token.name;
        token.googleImage = user?.image || profile?.image || token.picture;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = (token.googleName as string) || session.user.name;
        session.user.email = (token.googleEmail as string) || session.user.email;
        session.user.image = (token.googleImage as string) || session.user.image;
      }

      return session;
    },
  },
});

export { handler as GET, handler as POST };