import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GitHub OAuthトークンを失効させるAPIエンドポイント
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.accessToken) {
      const clientId = process.env.GITHUB_ID;
      const clientSecret = process.env.GITHUB_SECRET;

      if (clientId && clientSecret) {
        // GitHub APIでOAuthトークンを失効させる
        await fetch(`https://api.github.com/applications/${clientId}/token`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
          body: JSON.stringify({ access_token: session.accessToken }),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Token revocation failed:', error);
    // トークン失効に失敗してもログアウト自体は続行させる
    return NextResponse.json({ success: true });
  }
}
