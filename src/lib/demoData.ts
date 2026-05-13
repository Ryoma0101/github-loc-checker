import { AnalysisResult } from '@/types';

export const DEMO_DATA: AnalysisResult = {
  username: 'octocat',
  totalCode: 250000,
  totalRepos: 15,
  totalReposAnalyzed: 14,
  forksExcluded: 1,
  languageBreakdown: [
    { name: 'TypeScript', code: 120000, blank: 15000, comment: 8000, nFiles: 250 },
    { name: 'JavaScript', code: 65000, blank: 8000, comment: 4000, nFiles: 120 },
    { name: 'Python', code: 35000, blank: 5000, comment: 2000, nFiles: 80 },
    { name: 'CSS', code: 18000, blank: 2000, comment: 500, nFiles: 45 },
    { name: 'HTML', code: 12000, blank: 1000, comment: 300, nFiles: 30 },
  ],
  repoBreakdown: [
    {
      name: 'github-loc-checker',
      totalCode: 85000,
      languages: [
        { name: 'TypeScript', code: 50000, blank: 6000, comment: 3000, nFiles: 100 },
        { name: 'CSS', code: 18000, blank: 2000, comment: 500, nFiles: 20 },
        { name: 'HTML', code: 12000, blank: 1000, comment: 300, nFiles: 15 },
        { name: 'JavaScript', code: 5000, blank: 600, comment: 200, nFiles: 8 },
      ],
      primaryLanguage: 'TypeScript',
    },
    {
      name: 'awesome-project',
      totalCode: 72000,
      languages: [
        { name: 'TypeScript', code: 45000, blank: 5500, comment: 3000, nFiles: 85 },
        { name: 'JavaScript', code: 20000, blank: 2500, comment: 1200, nFiles: 35 },
        { name: 'Python', code: 7000, blank: 1000, comment: 500, nFiles: 12 },
      ],
      primaryLanguage: 'TypeScript',
    },
    {
      name: 'data-pipeline',
      totalCode: 55000,
      languages: [
        { name: 'Python', code: 28000, blank: 4000, comment: 1500, nFiles: 68 },
        { name: 'JavaScript', code: 18000, blank: 2500, comment: 1000, nFiles: 25 },
        { name: 'SQL', code: 9000, blank: 1000, comment: 800, nFiles: 15 },
      ],
      primaryLanguage: 'Python',
    },
    {
      name: 'web-frontend',
      totalCode: 38000,
      languages: [
        { name: 'JavaScript', code: 22000, blank: 2400, comment: 1600, nFiles: 52 },
        { name: 'CSS', code: 12000, blank: 1200, comment: 400, nFiles: 18 },
        { name: 'HTML', code: 4000, blank: 400, comment: 100, nFiles: 10 },
      ],
      primaryLanguage: 'JavaScript',
    },
  ],
};
