import { ImageResponse } from 'next/og';
import { decodeShareData } from '@/lib/shareUrl';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataParam = searchParams.get('d');

    if (!dataParam) {
      return new Response('Missing data parameter', { status: 400 });
    }

    const data = decodeShareData(dataParam);
    if (!data) {
      return new Response('Invalid data parameter', { status: 400 });
    }

    // 日本語フォントをSatoriで扱うのはファイルサイズやTTF変換のハードルが高いため、
    // OGP画像は英語（ASCII）のみで構成する洗練されたデザインを採用します。
    // GitHubユーザー名はASCIIのみのため問題ありません。

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#0f172a', // slate-900
            padding: '60px',
            fontFamily: 'sans-serif',
            color: '#f8fafc', // slate-50
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              right: '-5%',
              width: '600px',
              height: '600px',
              backgroundColor: '#22c55e', // green-500
              opacity: 0.15,
              borderRadius: '50%',
              filter: 'blur(80px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-10%',
              left: '-10%',
              width: '400px',
              height: '400px',
              backgroundColor: '#3b82f6', // blue-500
              opacity: 0.15,
              borderRadius: '50%',
              filter: 'blur(80px)',
            }}
          />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#22c55e', // green-500
                letterSpacing: '-0.02em',
                display: 'flex',
              }}
            >
              GitHub LOC Analyzer
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: 40, color: '#94a3b8', display: 'flex' }}>
              @{data.u}&apos;s Profile
            </div>
            <div
              style={{
                fontSize: 100,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.04em',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'baseline',
              }}
            >
              {data.t.toLocaleString()}
              <span style={{ fontSize: 40, color: '#94a3b8', marginLeft: '16px', fontWeight: 600 }}>
                LOC
              </span>
            </div>
            <div style={{ fontSize: 24, color: '#64748b', display: 'flex', marginTop: '8px' }}>
              Across {data.r} public repositories
            </div>
          </div>

          {/* Footer: Top Languages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: 20, color: '#94a3b8', fontWeight: 600, display: 'flex' }}>
              TOP LANGUAGES
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              {data.l.map((lang) => (
                <div
                  key={lang.n}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: lang.c,
                      marginRight: '12px',
                    }}
                  />
                  <span style={{ fontSize: 24, fontWeight: 500, color: '#e2e8f0', display: 'flex' }}>
                    {lang.n}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
