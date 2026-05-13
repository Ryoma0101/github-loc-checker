"use client";

import { signIn } from "next-auth/react";
import Image from 'next/image';
import styles from '@/app/page.module.css';
import { AppLogoIcon, DemoBadgeIcon } from './Icons';

export function LoginView({ onDemoClick }: { onDemoClick?: () => void }) {
  const handleDemoClick = () => {
    localStorage.setItem('demoMode', 'true');
    if (onDemoClick) onDemoClick();
    window.location.reload();
  };

  return (
    <div className={styles.inputView}>
      <header className={styles.header} style={{ borderBottom: 'none' }}>
        <div className={styles.logo}>
          <AppLogoIcon className={styles.logoIconSvg} />
          GitHub行数チェッカー
        </div>
      </header>

      <div className={styles.inputContent} style={{ maxWidth: '920px' }}>
        {/* Hero Section with Image and Text Side by Side */}
        <div className={styles.heroSection}>
          {/* Hero Image */}
          <div className={styles.heroImage}>
            <Image
              src="/tree.png"
              alt="Tree illustration"
              width={340}
              height={340}
              className={styles.treeImage}
              priority
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Text Content */}
          <div className={styles.heroText}>
            {/* Main Title */}
            <h1 className={styles.inputTitle} style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>
              GitHub行数<br />チェッカー
            </h1>
            
            {/* Subtitle */}
            <div className={styles.inputSubtitle} style={{ marginBottom: '2rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
              <p>
                GitHubのリポジトリから<br />
                <strong>実質的なコード行数を</strong><br />
                <strong>厳密に解析・算出</strong><br />
                <span style={{ fontSize: '0.9rem', opacity: 0.75, marginTop: '0.5rem', display: 'block' }}>空行やコメント除外で正確な統計</span>
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          backgroundColor: 'rgba(74, 140, 92, 0.08)',
          border: '1px solid rgba(74, 140, 92, 0.2)',
          borderRadius: '12px',
          padding: '1.8rem',
          margin: '0 auto 2.5rem',
          fontSize: '0.9rem',
          lineHeight: '1.7',
          color: 'var(--foreground)',
          width: '100%',
          maxWidth: '720px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, var(--primary) 0%, rgba(74, 140, 92, 0.5) 100%)'
          }} />
          
          <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem' }}>
            <DemoBadgeIcon className={styles.inlineIconLarge} />
            <div>
              <p style={{ fontWeight: 600, marginBottom: '0.3rem' }}>GitHubアカウント連携で実際に解析</p>
              <p style={{ opacity: 0.9 }}>
                認証済みトークンでAPIレート制限が大幅に拡大。あなたのGitHubリポジトリから正確なコード行数を算出できます。
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <DemoBadgeIcon className={styles.inlineIconLarge} />
            <div>
              <p style={{ fontWeight: 600, marginBottom: '0.3rem' }}>デモモードでUIをプレビュー</p>
              <p style={{ opacity: 0.9 }}>
                サンプルデータで画面デザインと機能を確認。実際の分析にはログインが必要です。
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
          {/* Primary Button: Login */}
          <button
            onClick={() => signIn("github")}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '1.1rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#fff',
              backgroundColor: '#24292e',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(36, 41, 46, 0.2)',
              transition: 'all 0.3s ease',
              letterSpacing: '0.3px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(36, 41, 46, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(36, 41, 46, 0.2)';
            }}
          >
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
            </svg>
            GitHub でログイン
          </button>

          {/* Secondary Button: Demo */}
          <button
            onClick={handleDemoClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '1.1rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--primary)',
              backgroundColor: 'rgba(74, 140, 92, 0.1)',
              border: '2px solid rgba(74, 140, 92, 0.3)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '0.3px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(74, 140, 92, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(74, 140, 92, 0.5)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(74, 140, 92, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(74, 140, 92, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(74, 140, 92, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <DemoBadgeIcon className={styles.inlineIcon} />
            デモを見る
          </button>
        </div>

        {/* Footer Note */}
        <p style={{
          marginTop: '2rem',
          fontSize: '0.8rem',
          color: 'var(--muted)',
          textAlign: 'center',
          lineHeight: 1.5
        }}>
          公開リポジトリのみ解析可能です。<br />
          <a href="https://github.com/Ryoma0101/github-loc-checker/issues" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
            フィードバック・バグ報告
          </a>
        </p>
      </div>
    </div>
  );
}
