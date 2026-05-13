"use client";

import { useState } from 'react';
import Image from 'next/image';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from './page.module.css';
import { getLanguageIconUrl, getLanguageColor } from '@/lib/languageIcons';

// ===== Types =====
type LanguageData = {
  name: string;
  code: number;
  blank: number;
  comment: number;
  nFiles: number;
};

type RepoData = {
  name: string;
  totalCode: number;
  languages: LanguageData[];
  primaryLanguage: string;
};

type AnalysisResult = {
  username: string;
  totalCode: number;
  totalRepos: number;
  totalReposAnalyzed: number;
  forksExcluded: number;
  languageBreakdown: LanguageData[];
  repoBreakdown: RepoData[];
};

const FALLBACK_COLORS = ['#4a8c5c', '#6baf7b', '#f0b429', '#3b82f6', '#ef4444', '#a78bfa', '#06b6d4', '#9ca3af'];

function LanguageIcon({ name, size = 16 }: { name: string; size?: number }) {
  const iconUrl = getLanguageIconUrl(name);
  if (!iconUrl) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconUrl}
      alt={name}
      width={size}
      height={size}
      style={{ flexShrink: 0 }}
    />
  );
}

// ===== INPUT VIEW =====
function InputView({ onSubmit, loading, error }: {
  onSubmit: (username: string) => void;
  loading: boolean;
  error: string;
}) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onSubmit(username.trim());
  };

  return (
    <div className={styles.inputView}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🌿</span>
          GitHub行数チェッカー
        </div>
      </header>

      <div className={styles.inputContent}>
        <Image
          src="/tree.png"
          alt="Tree illustration"
          width={260}
          height={260}
          className={styles.treeImage}
          priority
        />

        <h1 className={styles.inputTitle}>GitHub行数チェッカー</h1>
        <p className={styles.inputSubtitle}>
          GitHubの公開リポジトリから<br />
          コード行数を算出します
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>GitHub ユーザー名</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="例) octocat"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <p className={styles.formNote}>※パブリックリポジトリのみを対象とします</p>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !username.trim()}
          >
            🔍 分析する
          </button>
        </form>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.infoBox}>
          <span className={styles.infoIcon}>ℹ️</span>
          <div className={styles.infoText}>
            フォークしたリポジトリは除外されます<br />
            行数は cloc による解析値です（空行・コメント除外）
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className={styles.waveContainer}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={styles.wave}>
          <path d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z" fill="rgba(74, 140, 92, 0.06)" />
          <path d="M0,80 C360,20 720,100 1080,40 C1260,20 1380,60 1440,80 L1440,120 L0,120 Z" fill="rgba(107, 175, 123, 0.04)" />
        </svg>
      </div>

      <footer className={styles.footer}>
        © 2025 LOC Estimator
      </footer>
    </div>
  );
}

// ===== LOADING VIEW =====
function LoadingView({ progress }: { progress: string }) {
  return (
    <div className={styles.loadingView}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🌿</span>
          GitHub LOC Estimator
        </div>
      </header>

      <div className={styles.loadingContent}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>リポジトリを解析中...</p>
        {progress && <p className={styles.progressText}>{progress}</p>}
      </div>
    </div>
  );
}

// ===== RESULT VIEW =====
function ResultView({ data, onBack }: { data: AnalysisResult; onBack: () => void }) {
  const maxRepoLoc = data.repoBreakdown.length > 0 ? data.repoBreakdown[0].totalCode : 1;

  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Calculate language percentages
  const totalLangCode = data.languageBreakdown.reduce((sum, l) => sum + l.code, 0);
  const topLangs = data.languageBreakdown.slice(0, 5);
  const otherCode = data.languageBreakdown.slice(5).reduce((sum, l) => sum + l.code, 0);

  const chartData = [
    ...topLangs.map(l => ({ name: l.name, value: l.code })),
    ...(otherCode > 0 ? [{ name: 'その他', value: otherCode }] : []),
  ];

  return (
    <div className={styles.resultView}>
      <header className={styles.resultHeader}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🌿</span>
          GitHub行数チェッカー
        </div>
        <button className={styles.backButton} onClick={onBack}>
          ← 戻る
        </button>
      </header>

      <div className={styles.resultContent}>
        {/* User Info */}
        <div className={styles.userInfo}>
          <div className={styles.userName}>{data.username}</div>
          <div className={styles.analysisDate}>分析日時: {dateStr}</div>
        </div>

        {/* Top Row: Total LOC + Stats */}
        <div className={styles.topRow}>
          {/* Total LOC */}
          <div className={styles.totalCard}>
            <div className={styles.totalLeft}>
              <div className={styles.totalLabel}>合計コード行数</div>
              <div className={styles.totalValue}>
                {data.totalCode.toLocaleString()}
                <span className={styles.totalUnit}>行</span>
              </div>
            </div>
            <Image
              src="/tree.png"
              alt="Tree"
              width={220}
              height={220}
              className={styles.totalTreeImage}
            />
          </div>

          {/* Language Chart */}
          <div className={styles.statsCard}>
            <div className={styles.statsCardTitle}>言語別の割合</div>
            <div className={styles.chartArea}>
              <div style={{ width: 90, height: 90 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={22}
                      outerRadius={40}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {chartData.map((item, i) => (
                        <Cell key={i} fill={getLanguageColor(item.name)} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.legendList}>
                {chartData.map((item) => (
                  <div key={item.name} className={styles.legendItem}>
                    <span className={styles.legendColor} style={{ backgroundColor: getLanguageColor(item.name) }} />
                    <LanguageIcon name={item.name} size={12} />
                    {item.name}
                    <span className={styles.legendPercent}>
                      {totalLangCode > 0 ? ((item.value / totalLangCode) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Repo Count + Analysis Target combined */}
          <div className={styles.statsCard}>
            <div className={styles.statsCardTitle}>分析の対象</div>
            <div className={styles.targetList}>
              <div className={styles.targetItem}>
                <span className={styles.targetLabel}>解析リポジトリ</span>
                <span className={styles.targetValue}>{data.totalReposAnalyzed} 件</span>
              </div>
              <div className={styles.targetItem}>
                <span className={styles.targetLabel}>パブリック合計</span>
                <span className={styles.targetValue}>{data.totalRepos} 件</span>
              </div>
              <div className={styles.targetItem}>
                <span className={styles.targetLabel}>フォーク除外</span>
                <span className={styles.targetValue}>{data.forksExcluded} 件</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column: Language Table + Repo Table */}
        <div className={styles.twoColumnGrid}>
          {/* Language Totals Table */}
          <div className={styles.repoSection}>
            <div className={styles.repoSectionTitle}>
              言語別の合計行数
            </div>
            <table className={styles.repoTable}>
              <thead>
                <tr>
                  <th>言語</th>
                  <th style={{ textAlign: 'right' }}>コード</th>
                  <th style={{ textAlign: 'right' }}>コメント</th>
                  <th style={{ textAlign: 'right' }}>空行</th>
                  <th>割合</th>
                </tr>
              </thead>
              <tbody>
                {data.languageBreakdown.map((lang, i) => {
                  const percent = totalLangCode > 0 ? ((lang.code / totalLangCode) * 100) : 0;
                  const barWidth = data.languageBreakdown.length > 0 && data.languageBreakdown[0].code > 0
                    ? ((lang.code / data.languageBreakdown[0].code) * 100) : 0;
                  return (
                    <tr key={lang.name}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className={styles.legendColor} style={{ backgroundColor: getLanguageColor(lang.name) }} />
                          <LanguageIcon name={lang.name} size={16} />
                          <span className={styles.repoNameCell}>{lang.name}</span>
                        </div>
                      </td>
                      <td className={styles.repoLocCell}>{lang.code.toLocaleString()}</td>
                      <td className={styles.repoLocCell} style={{ color: 'var(--muted)' }}>{lang.comment.toLocaleString()}</td>
                      <td className={styles.repoLocCell} style={{ color: 'var(--muted)' }}>{lang.blank.toLocaleString()}</td>
                      <td className={styles.repoBarCell}>
                        <div className={styles.repoBar}>
                          <div className={styles.repoBarFill} style={{ width: `${barWidth}%` }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{percent.toFixed(1)}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Repo Table (Top 10) */}
          <div className={styles.repoSection}>
            <div className={styles.repoSectionTitle}>
              リポジトリ別（上位{Math.min(data.repoBreakdown.length, 10)}件）
            </div>
            <table className={styles.repoTable}>
              <thead>
                <tr>
                  <th>リポジトリ名</th>
                  <th>主要言語</th>
                  <th style={{ textAlign: 'right' }}>行数</th>
                  <th>割合</th>
                </tr>
              </thead>
              <tbody>
                {data.repoBreakdown.slice(0, 10).map((repo) => {
                  const percent = data.totalCode > 0 ? ((repo.totalCode / data.totalCode) * 100) : 0;
                  const barWidth = maxRepoLoc > 0 ? ((repo.totalCode / maxRepoLoc) * 100) : 0;
                  return (
                    <tr key={repo.name}>
                      <td className={styles.repoNameCell}>{repo.name}</td>
                      <td className={styles.repoLangCell}>{repo.primaryLanguage || '-'}</td>
                      <td className={styles.repoLocCell}>{repo.totalCode.toLocaleString()}</td>
                      <td className={styles.repoBarCell}>
                        <div className={styles.repoBar}>
                          <div className={styles.repoBarFill} style={{ width: `${barWidth}%` }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{percent.toFixed(1)}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Method Info */}
        <div className={styles.methodInfo}>
          <div className={styles.methodLeft}>
            <span className={styles.methodIcon}>ℹ️</span>
            <div>
              <div className={styles.methodTitle}>行数の計算方法</div>
              <div className={styles.methodDesc}>
                各リポジトリを cloc で解析し、空行・コメントを除いた純粋なコード行数を算出しています。
              </div>
              <div className={styles.methodDesc} style={{ marginTop: '0.25rem' }}>
                除外: JSON, YAML, Markdown, CSV, SVG, Jupyter Notebook
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        © 2025 LOC Estimator
      </footer>
    </div>
  );
}

// ===== MAIN PAGE =====
export default function Home() {
  const [view, setView] = useState<'input' | 'loading' | 'result'>('input');
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleSubmit = async (username: string) => {
    setView('loading');
    setError('');
    setData(null);
    setProgress('');

    try {
      const res = await fetch(`/api/estimate?username=${encodeURIComponent(username)}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'データ取得に失敗しました');
      }
      const jsonData: AnalysisResult = await res.json();
      setData(jsonData);
      setView('result');
    } catch (err: any) {
      setError(err.message || '予期せぬエラーが発生しました');
      setView('input');
    }
  };

  const handleBack = () => {
    setView('input');
    setData(null);
    setError('');
  };

  if (view === 'loading') {
    return <LoadingView progress={progress} />;
  }

  if (view === 'result' && data) {
    return <ResultView data={data} onBack={handleBack} />;
  }

  return <InputView onSubmit={handleSubmit} loading={false} error={error} />;
}
