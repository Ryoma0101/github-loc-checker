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
