import Image from 'next/image';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from '@/app/page.module.css';
import { getLanguageColor } from '@/lib/languageIcons';
import { LanguageIcon } from './LanguageIcon';
import { AnalysisResult } from '@/types';

export function ResultView({ data, onBack }: { data: AnalysisResult; onBack: () => void }) {
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
        © 2025 GitHub行数チェッカー
      </footer>
    </div>
  );
}
