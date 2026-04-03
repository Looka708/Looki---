import NextAuth, { type NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    sub?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: 'identify email guilds',
        },
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, account, user }) {
      console.log('JWT Callback - account:', account ? { provider: account.provider, access_token: account.access_token?.substring(0, 20) + '...' } : 'none');
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
        console.log('JWT Callback - token updated with accessToken');
      }
      if (user) {
        token.id = user.id;
        console.log('JWT Callback - token.id set to:', user.id);
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback - token.accessToken:', token.accessToken ? token.accessToken.substring(0, 20) + '...' : 'undefined');
      if (session.user) {
        session.user.id = token.id || token.sub || '';
      }
      // Pass access token to session
      session.accessToken = token.accessToken as string;
      console.log('Session Callback - session.accessToken set:', session.accessToken ? session.accessToken.substring(0, 20) + '...' : 'undefined');
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative URLs and same-origin URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allow same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};
