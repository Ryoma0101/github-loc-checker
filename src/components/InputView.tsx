import { useState } from 'react';
import Image from 'next/image';
import styles from '@/app/page.module.css';

export function InputView({ onSubmit, loading, error }: {
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
        © 2025 GitHub行数チェッカー
      </footer>
    </div>
  );
}
