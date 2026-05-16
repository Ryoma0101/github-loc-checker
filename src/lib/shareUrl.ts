import { AnalysisResult } from '@/types';
import { getLanguageColor } from '@/lib/languageIcons';

// OGP用の短縮データ構造
export type CompressedShareData = {
  u: string; // username
  t: number; // total LOC
  r: number; // total repos
  l: Array<{
    n: string; // name
    c: string; // color
    v: number; // loc
  }>;
};

/**
 * 分析結果をURLに埋め込めるようBase64URL文字列にエンコードする
 */
export function encodeShareData(username: string, result: AnalysisResult): string {
  // 元の配列を変更しないようにスプレッド構文でコピーしてからソート
  const topLangs = [...result.languageBreakdown]
    .sort((a, b) => b.code - a.code)
    .slice(0, 4)
    .map(lang => ({
      n: lang.name,
      c: getLanguageColor(lang.name) || '#cccccc',
      v: lang.code,
    }));

  const data: CompressedShareData = {
    u: username,
    t: result.totalCode,
    r: result.totalReposAnalyzed,
    l: topLangs,
  };

  const jsonStr = JSON.stringify(data);
  // Base64URLエンコード（URLで安全に使えるようにする）
  const base64 = Buffer.from(jsonStr, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
    
  return base64;
}

/**
 * URLのBase64URL文字列からデータを復元する
 */
export function decodeShareData(base64url: string): CompressedShareData | null {
  try {
    // Base64URLから通常のBase64に戻す
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const jsonStr = Buffer.from(base64, 'base64').toString('utf-8');
    const data = JSON.parse(jsonStr) as CompressedShareData;
    
    // 簡単なバリデーション
    if (typeof data.u !== 'string' || typeof data.t !== 'number') {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Failed to decode share data:', error);
    return null;
  }
}
