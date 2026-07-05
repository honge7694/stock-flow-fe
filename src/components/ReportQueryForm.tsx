import { type FormEvent, useState } from 'react';
import type { ReportRequest } from '../types/report';

type ReportQueryFormProps = {
  isLoading: boolean;
  initialTicker?: string;
  onSubmit: (request: ReportRequest) => void;
};

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function monthsBeforeToday(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return toDateInputValue(date);
}

export function ReportQueryForm({ isLoading, initialTicker = '000660.KS', onSubmit }: ReportQueryFormProps) {
  const [ticker, setTicker] = useState(initialTicker);
  const [from, setFrom] = useState(() => monthsBeforeToday(6));
  const [to, setTo] = useState(() => toDateInputValue(new Date()));
  const [ai, setAi] = useState(true);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ ticker: ticker.trim(), from, to, ai });
  }

  return (
    <form className="query-form" onSubmit={handleSubmit}>
      <div className="field-block ticker-field">
        <label htmlFor="report-ticker">종목</label>
        <input
          id="report-ticker"
          value={ticker}
          onChange={(event) => setTicker(event.target.value)}
          placeholder="예: Apple, AAPL, 005930.KS"
          aria-describedby="report-ticker-help"
          required
        />
        <small id="report-ticker-help">관심 종목에서 선택하거나 종목 코드를 직접 입력합니다.</small>
      </div>
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
        <span>AI 학습 요약 포함</span>
      </label>
      <button type="submit" disabled={isLoading}>
        {isLoading ? (
          <span className="button-loading-label">
            <span className="loading-spinner loading-spinner-button" aria-hidden="true" />
            생성 중...
          </span>
        ) : (
          '리포트 생성'
        )}
      </button>
    </form>
  );
}
