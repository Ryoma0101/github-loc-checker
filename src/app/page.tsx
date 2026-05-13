"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { AnalysisResult } from '@/types';
import { DEMO_DATA } from '@/lib/demoData';
import { InputView } from '@/components/InputView';
import { LoadingView } from '@/components/LoadingView';
import { ResultView } from '@/components/ResultView';
import { LoginView } from '@/components/LoginView';

// ===== MAIN PAGE =====
export default function Home() {
  const { data: session, status } = useSession();
  const [view, setView] = useState<'input' | 'loading' | 'result'>('input');
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [isRateLimit, setIsRateLimit] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // デモモード判定
  useEffect(() => {
    const isDemo = localStorage.getItem('demoMode') === 'true';
    setDemoMode(isDemo);
  }, []);

  const handleDemoClick = () => {
    setDemoMode(true);
  };

  const handleSubmit = async (username: string) => {
    setError('');
    setErrorDetails('');
    setIsRateLimit(false);
    setData(null);

    // デモモードの場合：即座に結果を表示
    if (demoMode) {
      setData(DEMO_DATA);
      setView('result');
      return;
    }

    // 実分析の場合：ローディング表示
    setView('loading');

    try {
      const res = await fetch(`/api/estimate?username=${encodeURIComponent(username)}`);
      if (!res.ok) {
        const errData = await res.json();
        
        // レート制限エラーの場合
        if (res.status === 429 && errData.isRateLimit) {
          setError(errData.error);
          setErrorDetails(errData.details);
          setIsRateLimit(true);
        } else {
          setError(errData.error || 'データ取得に失敗しました');
          setErrorDetails('');
          setIsRateLimit(false);
        }
        setView('input');
        return;
      }
      const jsonData: AnalysisResult = await res.json();
      setData(jsonData);
      setView('result');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期せぬエラーが発生しました';
      setError(errorMessage);
      setErrorDetails('');
      setIsRateLimit(false);
      setView('input');
    }
  };

  const handleBack = () => {
    setView('input');
    setData(null);
    setError('');
    setErrorDetails('');
    setIsRateLimit(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('demoMode');
    setDemoMode(false);
    setView('input');
    setData(null);
    setError('');
    setErrorDetails('');
    setIsRateLimit(false);
  };

  // デモモード時はセッション確認をスキップ
  if (!demoMode && status === 'loading') {
    return <LoadingView message="ログイン情報を確認中..." />; // Session loading state
  }

  // デモモードの場合は InputView を表示
  if (demoMode) {
    if (view === 'result' && data) {
      return <ResultView data={data} onBack={handleBack} isDemo={true} />;
    }

    return (
      <InputView 
        onSubmit={handleSubmit} 
        loading={view === 'loading'} 
        error={error}
        errorDetails={errorDetails}
        isRateLimit={isRateLimit}
        demoMode={true}
        onLogout={handleLogout}
      />
    );
  }

  // ログイン必須（ゲストモード廃止）
  if (status === 'unauthenticated' || !session) {
    return <LoginView onDemoClick={handleDemoClick} />;
  }

  if (view === 'loading') {
    return <LoadingView message="リポジトリを解析中..." />;
  }

  if (view === 'result' && data) {
    return <ResultView data={data} onBack={handleBack} isDemo={demoMode} />;
  }

  return (
    <InputView 
      onSubmit={handleSubmit} 
      loading={view === 'loading'} 
      error={error}
      errorDetails={errorDetails}
      isRateLimit={isRateLimit}
      demoMode={false}
      onLogout={handleLogout}
    />
  );
}
