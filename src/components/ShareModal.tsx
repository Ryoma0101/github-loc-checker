'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import styles from '@/app/page.module.css';
import { AnalysisResult } from '@/types';
import { getLanguageColor } from '@/lib/languageIcons';

const PRODUCTION_URL = 'https://github-loc-checker-upzls4iyca-an.a.run.app/';

type ShareModalProps = {
  data: AnalysisResult;
  isOpen: boolean;
  onClose: () => void;
};

/* ─── helpers ─── */
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  rr(ctx, x, y, w, h, 14);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawSep(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number) {
  ctx.strokeStyle = '#ececec';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
}

function drawBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, filled: number) {
  rr(ctx, x, y, w, 8, 4);
  ctx.fillStyle = '#e8f5e9';
  ctx.fill();
  if (filled > 0) {
    rr(ctx, x, y, Math.max(filled, 6), 8, 4);
    ctx.fillStyle = '#4a8c5c';
    ctx.fill();
  }
}

/* ─── main image generator ─── */
function generateShareImage(data: AnalysisResult): Promise<string> {
  return new Promise((resolve) => {
    const W = 1200;
    const H = 680;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    const P = 48;
    const G = 14;

    const treeImg = new Image();
    treeImg.crossOrigin = 'anonymous';

    const draw = (tree: HTMLImageElement | null) => {
      /* ── background ── */
      ctx.fillStyle = '#fafaf8';
      ctx.fillRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, 'rgba(74,140,92,0.04)');
      bg.addColorStop(1, 'rgba(107,175,123,0.03)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      /* ── header ── */
      if (tree) ctx.drawImage(tree, P, 20, 78, 78);
      const hx = tree ? P + 94 : P;

      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 40px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(data.username, hx, 58);

      const now = new Date();
      const ds = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      ctx.fillStyle = '#6b7280';
      ctx.font = '500 15px "Noto Sans JP", sans-serif';
      ctx.fillText(`⏱ 分析日時：${ds}`, hx, 86);

      /* ── layout ── */
      const contentW = W - P * 2;
      const topY = 112;
      const topH = 172;
      const c1W = 340, c2W = 400;
      const c3W = contentW - c1W - c2W - G * 2;
      const c1X = P, c2X = c1X + c1W + G, c3X = c2X + c2W + G;

      const botY = topY + topH + G;
      const botW = contentW;
      const botH = H - botY - P;
      const botX = P;

      const totalCode = data.languageBreakdown.reduce((s, l) => s + l.code, 0);
      const top5 = data.languageBreakdown.slice(0, 5);

      /* ═══ Card 1 : Total LOC ═══ */
      drawCard(ctx, c1X, topY, c1W, topH);
      ctx.fillStyle = '#6b7280';
      ctx.font = '600 14px "Noto Sans JP", sans-serif';
      ctx.fillText('合計コード行数', c1X + 24, topY + 36);

      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 52px "Noto Sans JP", sans-serif';
      const locStr = data.totalCode.toLocaleString();
      ctx.fillText(locStr, c1X + 24, topY + 112);
      const nw = ctx.measureText(locStr).width;
      ctx.font = 'bold 28px "Noto Sans JP", sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('行', c1X + 30 + nw, topY + 112);

      /* ═══ Card 2 : Language Chart ═══ */
      drawCard(ctx, c2X, topY, c2W, topH);
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 14px "Noto Sans JP", sans-serif';
      ctx.fillText('言語別の割合', c2X + 24, topY + 36);

      // donut
      const dcx = c2X + 106, dcy = topY + 108, oR = 52, iR = 30;
      let ang = -Math.PI / 2;
      top5.forEach((l) => {
        const sl = (totalCode > 0 ? l.code / totalCode : 0) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(dcx, dcy, oR, ang, ang + sl);
        ctx.arc(dcx, dcy, iR, ang + sl, ang, true);
        ctx.closePath();
        ctx.fillStyle = getLanguageColor(l.name);
        ctx.fill();
        ang += sl;
      });

      // legend
      const lx = c2X + 180;
      top5.forEach((l, i) => {
        const ly = topY + 56 + i * 25;
        const pct = totalCode > 0 ? ((l.code / totalCode) * 100).toFixed(1) : '0';
        ctx.fillStyle = getLanguageColor(l.name);
        ctx.beginPath();
        ctx.arc(lx, ly, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '500 14px "Noto Sans JP", sans-serif';
        ctx.fillText(l.name, lx + 16, ly + 5);
        const tw = ctx.measureText(l.name).width;
        ctx.fillStyle = '#6b7280';
        ctx.fillText(`${pct}%`, lx + 20 + tw, ly + 5);
      });

      /* ═══ Card 3 : Analysis Target ═══ */
      drawCard(ctx, c3X, topY, c3W, topH);
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 14px "Noto Sans JP", sans-serif';
      ctx.fillText('分析の対象', c3X + 24, topY + 36);

      const targets = [
        { icon: '📋', label: '解析リポジトリ', val: data.totalReposAnalyzed },
        { icon: '🌐', label: 'パブリック合計', val: data.totalRepos },
        { icon: '🔀', label: 'フォーク除外', val: data.forksExcluded },
      ];
      targets.forEach((t, i) => {
        const ty = topY + 66 + i * 40;
        ctx.fillStyle = '#6b7280';
        ctx.font = '500 14px "Noto Sans JP", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${t.icon}  ${t.label}`, c3X + 24, ty);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 18px "Noto Sans JP", sans-serif';
        ctx.fillText(`${t.val} 件`, c3X + c3W - 24, ty);
        ctx.textAlign = 'left';
      });

      /* ═══ Card 4 : Language Table (full width) ═══ */
      drawCard(ctx, botX, botY, botW, botH);
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 15px "Noto Sans JP", sans-serif';
      ctx.fillText('言語別の合計行数', botX + 28, botY + 32);

      // column positions – spread across full width
      const lt = {
        nm: botX + 28,
        cd: botX + 340,
        cm: botX + 520,
        bl: botX + 680,
        br: botX + 820,
      };
      const lty = botY + 60;

      ctx.fillStyle = '#6b7280';
      ctx.font = '600 12px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('言語', lt.nm, lty);
      ctx.textAlign = 'right';
      ctx.fillText('コード行数', lt.cd + 80, lty);
      ctx.fillText('コメント', lt.cm + 60, lty);
      ctx.fillText('空行', lt.bl + 50, lty);
      ctx.textAlign = 'left';
      ctx.fillText('割合', lt.br, lty);

      drawSep(ctx, botX + 20, botX + botW - 20, lty + 12);

      const maxLC = top5[0]?.code ?? 1;
      const rowH = Math.min(46, (botH - 80) / top5.length);
      top5.forEach((l, i) => {
        const ry = lty + 36 + i * rowH;
        const pct = totalCode > 0 ? ((l.code / totalCode) * 100).toFixed(1) : '0';

        // dot
        ctx.fillStyle = getLanguageColor(l.name);
        ctx.beginPath();
        ctx.arc(lt.nm + 7, ry, 6, 0, Math.PI * 2);
        ctx.fill();

        // name
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '600 15px "Noto Sans JP", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(l.name, lt.nm + 22, ry + 5);

        // numbers
        ctx.font = '600 15px "SFMono-Regular", Consolas, monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#1a1a1a';
        ctx.fillText(l.code.toLocaleString(), lt.cd + 80, ry + 5);
        ctx.fillStyle = '#9ca3af';
        ctx.fillText(l.comment.toLocaleString(), lt.cm + 60, ry + 5);
        ctx.fillText(l.blank.toLocaleString(), lt.bl + 50, ry + 5);
        ctx.textAlign = 'left';

        // bar
        const bw = (l.code / maxLC) * 120;
        drawBar(ctx, lt.br, ry - 5, 120, bw);

        // pct
        ctx.fillStyle = '#6b7280';
        ctx.font = '500 12px "Noto Sans JP", sans-serif';
        ctx.fillText(`${pct}%`, lt.br + 126, ry + 5);

        if (i < top5.length - 1) drawSep(ctx, botX + 20, botX + botW - 20, ry + 20);
      });

      resolve(canvas.toDataURL('image/png'));
    };

    treeImg.onload = () => draw(treeImg);
    treeImg.onerror = () => draw(null);
    treeImg.src = '/tree.png';
  });
}

/* ─── share text ─── */
function generateShareText(data: AnalysisResult): string {
  const topLang = data.languageBreakdown[0]?.name ?? '-';
  return [
    `🌳 GitHubコード行数チェック結果`,
    ``,
    `@${data.username} の合計コード行数は ${data.totalCode.toLocaleString()} 行！`,
    `📊 ${data.totalReposAnalyzed} リポジトリ / ${data.languageBreakdown.length} 言語`,
    `🏆 最も多い言語: ${topLang}`,
    ``,
    `みんなも自分のコード行数をチェックしてみてね！👇`,
    PRODUCTION_URL,
    ``,
    `#GitHub行数チェッカー #GitHub #プログラミング`,
  ].join('\n');
}

/* ─── modal component ─── */
export function ShareModal({ data, isOpen, onClose }: ShareModalProps) {
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const generateImage = useCallback(async () => {
    setIsGenerating(true);
    try {
      const url = await generateShareImage(data);
      setShareImageUrl(url);
    } finally {
      setIsGenerating(false);
    }
  }, [data]);

  useEffect(() => {
    if (isOpen && !shareImageUrl) {
      generateImage();
    }
  }, [isOpen, shareImageUrl, generateImage]);

  useEffect(() => {
    if (!isOpen) {
      setShareImageUrl(null);
      setCopyFeedback(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const shareText = generateShareText(data);

  const handleShareX = () => {
    const text = encodeURIComponent(shareText);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareInstagram = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    } catch { /* fallback */ }
    if (shareImageUrl) downloadImage(shareImageUrl);
  };

  const handleDownload = () => {
    if (shareImageUrl) downloadImage(shareImageUrl);
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.download = `github-loc-${data.username}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className={styles.shareOverlay} onClick={handleBackdropClick}>
      <div className={styles.shareModal} ref={modalRef}>
        <div className={styles.shareModalHeader}>
          <h3 className={styles.shareModalTitle}>結果をシェア</h3>
          <button className={styles.shareModalClose} onClick={onClose} aria-label="閉じる">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={styles.shareImagePreview}>
          {isGenerating ? (
            <div className={styles.shareImageLoading}>
              <div className={styles.shareSpinner} />
              <span>画像を生成中...</span>
            </div>
          ) : shareImageUrl ? (
            <img src={shareImageUrl} alt="シェア用画像" className={styles.shareImage} />
          ) : null}
        </div>

        <div className={styles.shareButtons}>
          <button className={styles.shareButtonX} onClick={handleShareX} id="share-x-button">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Xでシェア</span>
          </button>

          <button className={styles.shareButtonInsta} onClick={handleShareInstagram} id="share-instagram-button">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            <span>{copyFeedback ? 'テキストをコピーしました！' : 'Instagram用にコピー'}</span>
          </button>

          <button className={styles.shareButtonDownload} onClick={handleDownload} id="share-download-button">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>画像をダウンロード</span>
          </button>
        </div>
      </div>
    </div>
  );
}
