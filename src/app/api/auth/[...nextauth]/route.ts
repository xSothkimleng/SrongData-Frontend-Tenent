import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

declare module 'next-auth' {
  interface User {
    accessToken?: string;
  }

  interface Session {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
  }
}

const OPTIONS: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async credentials => {
        const res = await fetch(`${process.env.API_URL}/user/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        const user = await res.json();

        if (res.ok && user && user.data) {
          return {
            id: user.data.user_id ? user.data.user_id : null,
            email: credentials?.email,
            accessToken: user.data.access_token,
          };
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
    async signIn({ account, profile }) {
      console.log('signIn', account, profile);
      // 1. get tenant id from cookie
      // 2. call user/login (account.accessToken) and tenant id
      // 3. if success, return accessToken

      // if (account.provider === "google") {
      //   return profile.email_verified && profile.email.endsWith("@example.com")
      // }
      return true; // Do different verification for other providers that don't have `email_verified`
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};

const handler = NextAuth(OPTIONS);

export { handler as GET, handler as POST, OPTIONS };
