import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          // パブリックリポジトリの読み取りとユーザー情報のみ（最小権限）
          scope: "read:user public_repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // 初期ログイン時にアクセストークンをJWTに保存
      if (account) {
        token.accessToken = account.access_token;
        token.githubUsername = (profile as { login?: string } | undefined)?.login;
      }
      return token;
    },
    async session({ session, token }) {
      // JWTからセッションオブジェクトにアクセストークンを渡す
      session.accessToken = token.accessToken as string;
      session.githubUsername = token.githubUsername as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
