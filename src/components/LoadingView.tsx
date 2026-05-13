import styles from '@/app/page.module.css';
import { AppLogoIcon } from './Icons';

export function LoadingView({ message = 'リポジトリを解析中...' }) {
  return (
    <div className={styles.loadingView}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <AppLogoIcon className={styles.logoIconSvg} />
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
