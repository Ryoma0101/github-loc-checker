import styles from '@/app/page.module.css';

export function LoadingView({ message = 'リポジトリを解析中...' }) {
  return (
    <div className={styles.loadingView}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🌿</span>
          GitHub行数チェッカー
        </div>
      </header>

      <div className={styles.loadingContent}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>{message}</p>
      </div>
    </div>
  );
}
