import { Metadata } from 'next';
import { decodeShareData } from '@/lib/shareUrl';
import ClientRedirect from './ClientRedirect';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const d = typeof params.d === 'string' ? params.d : '';
  const data = decodeShareData(d);

  if (!data) {
    return {
      title: 'GitHub行数チェッカー',
      description: 'GitHubの公開リポジトリから実質的なコード行数を算出します。',
    };
  }

  // アプリケーションのベースURLを取得（VercelやCloud Runなど）
  const baseUrl = process.env.NEXTAUTH_URL || 'https://github-loc-checker-821305482933.asia-northeast1.run.app';
  const ogImageUrl = new URL(`/api/og?d=${d}`, baseUrl);

  return {
    title: `${data.u}のGitHub行数解析結果`,
    description: `総コード行数は ${data.t.toLocaleString()} 行でした！上位言語: ${data.l.map(l => l.n).join(', ')}`,
    openGraph: {
      title: `${data.u}のGitHub行数解析結果`,
      description: `総コード行数は ${data.t.toLocaleString()} 行でした！上位言語: ${data.l.map(l => l.n).join(', ')}`,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: `${data.u}'s GitHub LOC Profile`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.u}のGitHub行数解析結果`,
      description: `総コード行数は ${data.t.toLocaleString()} 行でした！上位言語: ${data.l.map(l => l.n).join(', ')}`,
      images: [ogImageUrl.toString()],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams;
  const d = typeof params.d === 'string' ? params.d : '';
  const data = decodeShareData(d);

  const targetUrl = data ? `/?user=${data.u}` : '/';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'sans-serif' }}>
      <div>
        <p>リダイレクトしています...</p>
        {/* ボットにはリダイレクトさせず、人間だけJSでリダイレクトさせる */}
        <ClientRedirect to={targetUrl} />
      </div>
    </div>
  );
}
