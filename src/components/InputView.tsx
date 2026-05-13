import { useState } from 'react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import styles from '@/app/page.module.css';

export function InputView({ onSubmit, loading, error, errorDetails, isRateLimit, demoMode = false, defaultUsername, onLoginClick, onLogout }: {
  onSubmit: (username: string) => void;
  loading: boolean;
  error: string;
  errorDetails?: string;
  isRateLimit?: boolean;
  demoMode?: boolean;
  defaultUsername?: string;
  onLoginClick?: () => void;
  onLogout?: () => void;
}) {
  const [username, setUsername] = useState(defaultUsername ?? (demoMode ? 'octocat' : ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onSubmit(username.trim());
  };

  const handleLogoutClick = () => {
    if (demoMode && onLogout) {
      onLogout();
    } else {
      signOut();
    }
  };

  const logoutLabel = demoMode ? 'デモを終了' : 'ログアウト';

  return (
    <div className={styles.inputView}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🌿</span>
          GitHub行数チェッカー
        </div>
        <div className={styles.headerActions}>
          {demoMode && onLoginClick && (
            <button
              className={styles.githubLoginButton}
              onClick={onLoginClick}
              title="GitHubログイン"
            >
              GitHubでログイン
            </button>
          )}
          <button 
            className={styles.logoutButton}
            onClick={handleLogoutClick}
            title={logoutLabel}
          >
            {logoutLabel}
          </button>
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

        {demoMode && (
          <div style={{
            backgroundColor: 'rgba(100, 150, 200, 0.1)',
            border: '1px solid rgba(100, 150, 200, 0.3)',
            borderRadius: '8px',
            padding: '0.9rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: 'rgba(50, 100, 150, 0.9)',
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>🎬</span>
            <div>
              <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>デモモード</p>
              <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                これはサンプルデータです。実際の分析にはログインが必要です。
              </p>
            </div>
          </div>
        )}

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

        {isRateLimit && error && (
          <div style={{
            backgroundColor: 'rgba(200, 100, 100, 0.15)',
            border: '1px solid rgba(200, 100, 100, 0.4)',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '1rem',
            fontSize: '0.9rem',
            color: '#c33',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            fontFamily: 'monospace'
          }}>
            <p style={{ fontWeight: 600, marginBottom: '0.8rem', fontSize: '1rem', color: '#a22' }}>
              ⚠️ {error}
            </p>
            {errorDetails && <p>{errorDetails}</p>}
          </div>
        )}

        {error && !isRateLimit && <div className={styles.error}>{error}</div>}

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
        © 2026 GitHub行数チェッカー
      </footer>
    </div>
  );
}
