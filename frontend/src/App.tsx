import { useState } from 'react';
import axios from 'axios';
import InputForm from './components/InputForm';
import ResultPanel from './components/ResultPanel';
import type { GenerateRequest, ApiResponse } from './types';
import './App.css';

const DEFAULT_FORM: GenerateRequest = {
  mbti: '',
  traits: '',
  content: '',
  scenes: [],
  intensity: 'standard',
};

export default function App() {
  const [form, setForm] = useState<GenerateRequest>(DEFAULT_FORM);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const { data } = await axios.post<ApiResponse>(
        `${apiBase}/api/generate`,
        form
      );
      setResult(data);
      setTimeout(() => {
        document.getElementById('result-anchor')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : '不明なエラーが発生しました';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-badge">MBTI × マネジメント</div>
          <h1 className="header-title">会話設計支援ツール</h1>
          <p className="header-sub">
            メンバーのMBTI特性に応じた最適な伝え方を、AIが設計します
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="layout">
          <section className="input-section">
            <div className="section-heading">
              <span className="section-icon">✏️</span>
              条件を入力する
            </div>
            <InputForm
              form={form}
              onChange={setForm}
              onSubmit={handleGenerate}
              loading={loading}
            />
          </section>

          <section className="result-section">
            <div id="result-anchor" />
            {error && (
              <div className="error-box">
                <strong>エラー：</strong>{error}
              </div>
            )}
            {!result && !error && !loading && (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <p>左側の条件を入力して<br />「会話設計を生成する」を押してください</p>
              </div>
            )}
            {loading && (
              <div className="loading-state">
                <div className="loading-dots">
                  <span /><span /><span />
                </div>
                <p>AIが会話設計を生成中...</p>
              </div>
            )}
            {result && !loading && (
              <>
                <div className="section-heading">
                  <span className="section-icon">📋</span>
                  会話設計レポート
                  <button className="reset-btn" onClick={() => setResult(null)}>
                    リセット
                  </button>
                </div>
                <ResultPanel data={result} />
              </>
            )}
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>MBTI別 マネジメント会話支援ツール — Powered by Claude AI</p>
      </footer>
    </div>
  );
}
