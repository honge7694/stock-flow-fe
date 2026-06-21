import { type FormEvent, useState } from 'react';
import type { ReportRequest } from '../types/report';

type ReportQueryFormProps = {
  isLoading: boolean;
  onSubmit: (request: ReportRequest) => void;
};

export function ReportQueryForm({ isLoading, onSubmit }: ReportQueryFormProps) {
  const [ticker, setTicker] = useState('000660.KS');
  const [from, setFrom] = useState('2026-04-01');
  const [to, setTo] = useState('2026-06-21');
  const [ai, setAi] = useState(true);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ ticker: ticker.trim(), from, to, ai });
  }

  return (
    <form className="query-form" onSubmit={handleSubmit}>
      <label>
        <span>종목 코드</span>
        <input value={ticker} onChange={(event) => setTicker(event.target.value)} required />
      </label>
      <label>
        <span>시작일</span>
        <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} required />
      </label>
      <label>
        <span>종료일</span>
        <input type="date" value={to} onChange={(event) => setTo(event.target.value)} required />
      </label>
      <label className="checkbox-field">
        <input type="checkbox" checked={ai} onChange={(event) => setAi(event.target.checked)} />
        <span>AI 분석 포함</span>
      </label>
      <button type="submit" disabled={isLoading}>
        {isLoading ? '조회 중...' : '리포트 조회'}
      </button>
    </form>
  );
}
