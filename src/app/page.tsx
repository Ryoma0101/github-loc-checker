"use client";

import { useState } from 'react';
import { AnalysisResult } from '@/types';
import { InputView } from '@/components/InputView';
import { LoadingView } from '@/components/LoadingView';
import { ResultView } from '@/components/ResultView';

// ===== MAIN PAGE =====
export default function Home() {
  const [view, setView] = useState<'input' | 'loading' | 'result'>('input');
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (username: string) => {
    setView('loading');
    setError('');
    setData(null);

    try {
      const res = await fetch(`/api/estimate?username=${encodeURIComponent(username)}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'データ取得に失敗しました');
      }
      const jsonData: AnalysisResult = await res.json();
      setData(jsonData);
      setView('result');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期せぬエラーが発生しました';
      setError(errorMessage);
      setView('input');
    }
  };

  const handleBack = () => {
    setView('input');
    setData(null);
    setError('');
  };

  if (view === 'loading') {
    return <LoadingView />;
  }

  if (view === 'result' && data) {
    return <ResultView data={data} onBack={handleBack} />;
  }

  return <InputView onSubmit={handleSubmit} loading={false} error={error} />;
}
