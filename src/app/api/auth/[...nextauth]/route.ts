import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { cookies } from 'next/headers';

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
    async signIn({ account, profile, user }) {
      console.log('signIn', account, profile, user);

      if (account?.provider === 'google') {
        console.log('google access token:', account.access_token);
        const tenantId = cookies().get('tenant_id')?.value || null;
        console.log('tenantId:', tenantId);
        if (account.access_token && tenantId) {
          const res = await fetch(`${process.env.API_WEB_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: account.access_token,
              tenant_id: tenantId,
            }),
          });

          const resJson = await res.json();

          if (resJson.data.tokens) {
            console.log('Response from login:', resJson);
            const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
            cookies().set('survey_access_token', resJson.data.tokens, { expires: oneDayFromNow });
            return true;
          }
        }

        return false;
      }

      if (account?.provider === 'credentials') {
        if (user && user.accessToken) {
          return true;
        } else {
          console.error('No access token found for credentials user');
          return false;
        }
      }

      return false;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};

const handler = NextAuth(OPTIONS);

export { handler as GET, handler as POST, OPTIONS };
