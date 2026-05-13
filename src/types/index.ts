export type LanguageData = {
  name: string;
  code: number;
  blank: number;
  comment: number;
  nFiles: number;
};

export type RepoData = {
  name: string;
  totalCode: number;
  languages: LanguageData[];
  primaryLanguage: string;
};

export type AnalysisResult = {
  username: string;
  totalCode: number;
  totalRepos: number;
  totalReposAnalyzed: number;
  forksExcluded: number;
  languageBreakdown: LanguageData[];
  repoBreakdown: RepoData[];
};

// NextAuth型拡張
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    githubUsername?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    githubUsername?: string;
  }
}
