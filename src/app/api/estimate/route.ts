import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { execSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

type ClocLanguageResult = {
  nFiles: number;
  blank: number;
  comment: number;
  code: number;
};

type ClocOutput = {
  [language: string]: ClocLanguageResult;
};

interface GitHubRepo {
  name: string;
  fork: boolean;
  clone_url: string;
}

export async function GET(request: NextRequest) {
  // セッション確認（ログイン必須）
  const session = await getServerSession(authOptions);
  
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'ログインが必要です。GitHubでログインしてください。' }, { status: 401 });
  }

  const token = session.accessToken as string;

  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'ユーザー名が必要です' }, { status: 400 });
  }

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-LOC-Estimator',
    Authorization: `Bearer ${token}`,
  };

  // レート制限エラーをハンドルするヘルパー関数
  const handleRateLimitError = (response: Response) => {
    const remaining = response.headers.get('x-ratelimit-remaining');
    const limit = response.headers.get('x-ratelimit-limit');
    const resetHeader = response.headers.get('x-ratelimit-reset');
    
    if (remaining === '0' || response.status === 403 || response.status === 429) {
      const resetTime = resetHeader ? new Date(parseInt(resetHeader) * 1000) : null;
      const resetTimeStr = resetTime ? resetTime.toLocaleTimeString('ja-JP') : '不明';
      
      return {
        error: 'GitHub APIのレート制限に達しました。',
        details: `
残りリクエスト数: ${remaining || '0'}/${limit || '不明'}
リセット時刻: ${resetTimeStr}

ログインするか、${resetTimeStr}までお待ちください。`,
        isRateLimit: true,
      };
    }
    return null;
  };

  try {
    // 1. Fetch all public repositories for the user (paginated)
    let allRepos: GitHubRepo[] = [];
    let page = 1;
    while (true) {
      const reposResponse = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`,
        { headers }
      );

      if (!reposResponse.ok) {
        if (reposResponse.status === 404) {
          return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
        }
        
        // レート制限エラーのチェック
        const rateLimitError = handleRateLimitError(reposResponse);
        if (rateLimitError) {
          return NextResponse.json(rateLimitError, { status: 429 });
        }
        
        const err = await reposResponse.text();
        return NextResponse.json({ error: `GitHub API Error: ${err}` }, { status: reposResponse.status });
      }

      const repos = await reposResponse.json();
      if (repos.length === 0) break;
      allRepos = allRepos.concat(repos);
      if (repos.length < 100) break;
      page++;
    }

    const totalRepos = allRepos.length;
    const forkedRepos = allRepos.filter((r) => r.fork);
    const validRepos = allRepos.filter((r) => !r.fork);
    const forksExcluded = forkedRepos.length;

    // 2. Clone each repo and run cloc
    const languageTotals: Record<string, { code: number; blank: number; comment: number; nFiles: number }> = {};
    const repoBreakdown: Array<{
      name: string;
      totalCode: number;
      languages: Array<{ name: string; code: number; blank: number; comment: number; nFiles: number }>;
      primaryLanguage: string;
    }> = [];

    for (const repo of validRepos) {
      const tmpDir = mkdtempSync(join(tmpdir(), 'loc-'));

      try {
        // git clone --depth 1 (shallow clone for speed)
        const cloneUrl = token
          ? `https://x-access-token:${token}@github.com/${username}/${repo.name}.git`
          : repo.clone_url;

        execSync(`git clone --depth 1 --quiet "${cloneUrl}" "${tmpDir}/repo"`, {
          timeout: 60000, // 1 minute timeout per repo
          stdio: 'pipe',
        });

        // Run cloc
        let clocResult: ClocOutput;
        try {
          const clocOutput = execSync(
            `cloc "${tmpDir}/repo" --json --quiet --exclude-dir=node_modules,dist,build,.next,out,vendor,__pycache__,.venv,venv --exclude-lang="Jupyter Notebook",JSON,YAML,Markdown,CSV,SVG,XML,INI,make,Dockerfile,CMake,Text,TOML,Properties,ignore`,
            {
              timeout: 60000,
              stdio: 'pipe',
              encoding: 'utf-8',
            },
          );
          clocResult = JSON.parse(clocOutput);
        } catch (clocError) {
          // cloc might fail on empty repos or binary-only repos
          console.warn(`cloc failed or returned invalid JSON for repo ${repo.name}`, clocError);
          continue;
        }

        // Process cloc output
        let repoTotalCode = 0;
        const repoLangsMap: Record<string, { code: number; blank: number; comment: number; nFiles: number }> = {};

        for (const [lang, stats] of Object.entries(clocResult)) {
          if (lang === 'header' || lang === 'SUM') continue;

          // 言語名の正規化 (JS/TSとJSX/TSXを分ける)
          let normalizedLang = lang;
          if (lang === 'TypeScript React') normalizedLang = 'TSX';

          const langStats = stats as ClocLanguageResult;
          repoTotalCode += langStats.code;

          if (!repoLangsMap[normalizedLang]) {
            repoLangsMap[normalizedLang] = { code: 0, blank: 0, comment: 0, nFiles: 0 };
          }
          repoLangsMap[normalizedLang].code += langStats.code;
          repoLangsMap[normalizedLang].blank += langStats.blank;
          repoLangsMap[normalizedLang].comment += langStats.comment;
          repoLangsMap[normalizedLang].nFiles += langStats.nFiles;

          // Accumulate totals
          if (!languageTotals[normalizedLang]) {
            languageTotals[normalizedLang] = { code: 0, blank: 0, comment: 0, nFiles: 0 };
          }
          languageTotals[normalizedLang].code += langStats.code;
          languageTotals[normalizedLang].blank += langStats.blank;
          languageTotals[normalizedLang].comment += langStats.comment;
          languageTotals[normalizedLang].nFiles += langStats.nFiles;
        }

        let maxCode = 0;
        let primaryLanguage = '';
        const repoLanguages = [];

        for (const [name, stats] of Object.entries(repoLangsMap)) {
          repoLanguages.push({ name, ...stats });
          if (stats.code > maxCode) {
            maxCode = stats.code;
            primaryLanguage = name;
          }
        }

        if (repoTotalCode > 0) {
          repoBreakdown.push({
            name: repo.name,
            totalCode: repoTotalCode,
            languages: repoLanguages.sort((a, b) => b.code - a.code),
            primaryLanguage,
          });
        }
      } catch (cloneError) {
        // Skip repos that fail to clone (e.g., empty repos)
        console.error(`Failed to process repo ${repo.name}:`, cloneError);
      } finally {
        // Always clean up temp directory
        try {
          rmSync(tmpDir, { recursive: true, force: true });
        } catch {}
      }
    }

    // Sort repos by code count descending
    repoBreakdown.sort((a, b) => b.totalCode - a.totalCode);

    // Format language breakdown
    const languageBreakdown = Object.entries(languageTotals)
      .map(([name, stats]) => ({
        name,
        ...stats,
      }))
      .sort((a, b) => b.code - a.code);

    const totalCode = languageBreakdown.reduce((sum, l) => sum + l.code, 0);

    return NextResponse.json({
      username,
      totalCode,
      totalRepos,
      totalReposAnalyzed: validRepos.length,
      forksExcluded,
      languageBreakdown,
      repoBreakdown,
    });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
