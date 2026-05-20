import Image from 'next/image';
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from '@/app/page.module.css';
import { getLanguageColor } from '@/lib/languageIcons';
import { LanguageIcon } from './LanguageIcon';
import { AnalysisResult } from '@/types';
import { AppLogoIcon, BackArrowIcon, DemoBadgeIcon, ExternalLinkIcon, HamburgerIcon, InfoIcon } from './Icons';
import { ShareModal } from './ShareModal';

export function ResultView({ data, onBack, onDemoExit, onLoginClick, onSearch, isDemo = false }: { data: AnalysisResult; onBack?: () => void; onDemoExit?: () => void; onLoginClick?: () => void; onSearch?: (username: string) => void; isDemo?: boolean }) {
  const [searchUsername, setSearchUsername] = useState(data.username);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const maxRepoLoc = data.repoBreakdown.length > 0 ? data.repoBreakdown[0].totalCode : 1;
  const getRepoUrl = (repoName: string) => `https://github.com/${data.username}/${repoName}`;
  const getProfileUrl = (username: string) => `https://github.com/${username}`;

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

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedUsername = searchUsername.trim();
    if (trimmedUsername && onSearch) {
      onSearch(trimmedUsername);
      setShowHeaderMenu(false);
    }
  };

  return (
    <div className={styles.resultView}>
      <header className={styles.resultHeader}>
        <div className={`${styles.logo} ${styles.resultLogo}`}>
          <AppLogoIcon className={styles.logoIconSvg} />
          GitHub行数チェッカー
        </div>
        <div className={styles.mobileMenuWrapper}>
          <button
            className={styles.mobileMenuButton}
            type="button"
            onClick={() => setShowHeaderMenu((open) => !open)}
            aria-label="ヘッダーメニューを開閉"
            aria-expanded={showHeaderMenu}
          >
            <HamburgerIcon className={styles.mobileMenuIcon} />
          </button>
          <div className={`${styles.headerActions} ${showHeaderMenu ? styles.headerActionsOpen : ''}`}>
            {!isDemo && onSearch && (
              <form className={styles.resultSearchForm} onSubmit={handleSearchSubmit}>
                <input
                  className={styles.resultSearchInput}
                  type="text"
                  value={searchUsername}
                  onChange={(event) => setSearchUsername(event.target.value)}
                  placeholder="次のユーザー名で検索"
                  aria-label="次の検索ユーザー名"
                />
                <button className={styles.resultSearchButton} type="submit">
                  検索
                </button>
              </form>
            )}
            {isDemo && onLoginClick && (
              <button
                className={styles.githubLoginButton}
                onClick={() => {
                  setShowHeaderMenu(false);
                  onLoginClick();
                }}
              >
                <ExternalLinkIcon className={styles.buttonIcon} />
                GitHubでログイン
              </button>
            )}
            <button
              className={styles.backButton}
              onClick={() => {
                setShowHeaderMenu(false);
                if (isDemo) {
                  onDemoExit?.();
                  return;
                }
                onBack?.();
              }}
            >
              {isDemo ? 'デモを終了' : <><BackArrowIcon className={styles.buttonIcon} /> 戻る</>}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.resultContent}>
        {isDemo && (
          <div style={{
            backgroundColor: 'rgba(100, 150, 200, 0.15)',
            border: '1px solid rgba(100, 150, 200, 0.4)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: 'rgba(50, 100, 150, 0.9)',
            textAlign: 'center'
          }}>
            <p style={{ fontWeight: 600, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'center' }}>
              <DemoBadgeIcon className={styles.inlineIconSmall} />
              デモモード
            </p>
            <p>これはサンプルデータです。実際の分析結果を見るにはログインしてください。</p>
          </div>
        )}

        {/* User Info */}
        <div className={styles.userInfo}>
          {!isDemo ? (
            <a
              href={getProfileUrl(data.username)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.userNameLink}
              aria-label={`${data.username} のGitHubプロフィールを新しいタブで開く`}
            >
              <span className={styles.userName}>{data.username}</span>
              <span className={styles.userNameExternal}>
                <ExternalLinkIcon className={styles.userNameExternalIcon} />
                GitHubで開く
              </span>
            </a>
          ) : (
            <div className={styles.userName}>{data.username}</div>
          )}
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
                      <td className={styles.repoNameCell}>
                        <a
                          href={getRepoUrl(repo.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.repoLink}
                        >
                          {repo.name}
                        </a>
                      </td>
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
            <InfoIcon className={styles.methodIconSvg} />
            <div>
              <div className={styles.methodTitle}>行数の計算方法</div>
              <div className={styles.methodDesc}>
                各リポジトリを cloc で解析し、空行・コメントを除いた純粋なコード行数を算出しています。
              </div>
              <div className={styles.methodDesc} style={{ marginTop: '0.25rem' }}>
                除外: JSON, YAML, Markdown, CSV, SVG, XML, INI, Makefile, Dockerfile, CMake, Text, TOML, Properties, Jupyter Notebook, および一部の設定ファイル
              </div>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <div className={styles.shareSection}>
          <button
            className={styles.shareOpenButton}
            onClick={() => setShowShareModal(true)}
            id="share-button"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" className={styles.buttonIcon}>
              <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.7" />
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            結果をシェアする
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        data={data}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      <footer className={styles.footer}>
        © 2026 GitHub行数チェッカー
      </footer>
    </div>
  );
}
