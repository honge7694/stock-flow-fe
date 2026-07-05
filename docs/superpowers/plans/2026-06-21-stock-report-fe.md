# Stock Report FE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React + TypeScript web app that lets the user enter a ticker and date range, call a backend JSON report API, and view the stock analysis report as native React UI.

**Architecture:** Use Vite to scaffold a focused single-page React app. Keep backend access isolated in a small API client, report shapes in TypeScript types, and rendering split into form, status, summary, chart, and AI-analysis components. Style the app from `design.md`: dark `#101010` canvas, electric green `#00d992` accents, hairline borders, Inter/SF Mono typography, and compact developer-tool density.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, lightweight-charts, CSS modules/global CSS.

---

## File Structure

- Create: `package.json` - npm scripts and dependencies.
- Create: `index.html` - Vite document entry.
- Create: `tsconfig.json` - TypeScript project config.
- Create: `tsconfig.node.json` - TypeScript config for Vite/Vitest config files.
- Create: `vite.config.ts` - Vite React and Vitest setup.
- Create: `src/main.tsx` - React entrypoint.
- Create: `src/App.tsx` - Page composition and query state orchestration.
- Create: `src/App.test.tsx` - integration tests for the query and render flow.
- Create: `src/styles.css` - global design tokens and layout styling based on `design.md`.
- Create: `src/api/reportApi.ts` - API URL builder and fetch wrapper.
- Create: `src/api/reportApi.test.ts` - API client unit tests.
- Create: `src/types/report.ts` - report request/response TypeScript contracts.
- Create: `src/test/fixtures/report.ts` - stable fixture mirroring the backend JSON shape.
- Create: `src/components/ReportQueryForm.tsx` - ticker/date/AI form.
- Create: `src/components/ReportQueryForm.test.tsx` - form behavior tests.
- Create: `src/components/ReportState.tsx` - empty/loading/error display states.
- Create: `src/components/ReportSummary.tsx` - metadata and AI summary cards.
- Create: `src/components/ReportCharts.tsx` - chart rendering via `lightweight-charts`.
- Create: `src/components/AiAnalysisPanel.tsx` - beginner explanation, checklist, observations, next items, disclaimer.
- Create: `.gitignore` - ignore dependencies, build output, and coverage.

## Backend Contract

The frontend expects this endpoint:

```http
GET /api/reports?ticker=000660.KS&from=2026-04-01&to=2026-06-21&ai=true
```

The response matches the JSON currently embedded in the generated HTML report:

```ts
export type ReportResponse = {
  ticker: string;
  from: string;
  to: string;
  ai: boolean;
  generatedAt: string;
  candles: Candle[];
  indicators: Indicators;
  aiAnalysis?: AiAnalysis;
};
```

During local development, configure the backend base URL with `VITE_API_BASE_URL`. If it is empty, requests are sent to the same origin.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `.gitignore`

- [ ] **Step 1: Create package manifest**

Create `package.json`:

```json
{
  "name": "stock-flow-fe",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "lightweight-charts": "^4.2.3",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "typescript": "^5.8.3",
    "vite": "^7.0.0",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Create Vite HTML entry**

Create `index.html`:

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stock Flow Report</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create TypeScript configs**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create Vite config**

Create `vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] **Step 5: Create git ignore rules**

Create `.gitignore`:

```gitignore
node_modules
dist
coverage
.env
.env.local
.vite
```

- [ ] **Step 6: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and install exits with code 0.

- [ ] **Step 7: Commit scaffold**

```bash
git add package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts .gitignore
git commit -m "chore: scaffold react report app"
```

---

### Task 2: Report Types and API Client

**Files:**
- Create: `src/types/report.ts`
- Create: `src/api/reportApi.ts`
- Create: `src/api/reportApi.test.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Create test setup**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 2: Define report contracts**

Create `src/types/report.ts`:

```ts
export type ReportRequest = {
  ticker: string;
  from: string;
  to: string;
  ai: boolean;
};

export type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type LinePoint = {
  time: string;
  value: number | null;
};

export type MacdPoint = {
  time: string;
  macd: number | null;
  signal: number | null;
  histogram: number | null;
};

export type Indicators = {
  sma20: LinePoint[];
  sma50: LinePoint[];
  rsi14: LinePoint[];
  macd: MacdPoint[];
  volume: LinePoint[];
};

export type ChecklistItem = {
  status: 'positive' | 'caution' | 'negative' | 'neutral';
  title: string;
  explanation: string;
};

export type AiAnalysis = {
  status: 'available' | 'unavailable';
  analysis?: {
    beginnerExplanation: {
      summary: string;
      sma: string;
      rsi: string;
      macd: string;
      volume: string;
    };
    checklist: {
      trend: ChecklistItem;
      momentum: ChecklistItem;
      volume: ChecklistItem;
      risk: ChecklistItem;
    };
    report: {
      headline: string;
      summary: string;
      observations: string[];
      nextThingsToWatch: string[];
      disclaimer: string;
    };
  };
};

export type ReportResponse = {
  ticker: string;
  from: string;
  to: string;
  ai: boolean;
  generatedAt: string;
  candles: Candle[];
  indicators: Indicators;
  aiAnalysis?: AiAnalysis;
};
```

- [ ] **Step 3: Write failing API tests**

Create `src/api/reportApi.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchReport, toReportQueryString } from './reportApi';

describe('toReportQueryString', () => {
  it('serializes report query parameters', () => {
    expect(
      toReportQueryString({
        ticker: '000660.KS',
        from: '2026-04-01',
        to: '2026-06-21',
        ai: true,
      }),
    ).toBe('ticker=000660.KS&from=2026-04-01&to=2026-06-21&ai=true');
  });
});

describe('fetchReport', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches a report from the configured API base URL', async () => {
    const responseBody = {
      ticker: '000660.KS',
      from: '2026-04-01',
      to: '2026-06-21',
      ai: true,
      generatedAt: '2026-06-21T08:59:44.592Z',
      candles: [],
      indicators: { sma20: [], sma50: [], rsi14: [], macd: [], volume: [] },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(responseBody),
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchReport(
        { ticker: '000660.KS', from: '2026-04-01', to: '2026-06-21', ai: true },
        'http://localhost:3000',
      ),
    ).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/reports?ticker=000660.KS&from=2026-04-01&to=2026-06-21&ai=true',
    );
  });

  it('throws a useful message when the backend returns an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('report generation failed'),
      }),
    );

    await expect(
      fetchReport({ ticker: '000660.KS', from: '2026-04-01', to: '2026-06-21', ai: true }, ''),
    ).rejects.toThrow('리포트 조회 실패: report generation failed');
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run:

```bash
npm test -- src/api/reportApi.test.ts
```

Expected: FAIL because `src/api/reportApi.ts` does not exist.

- [ ] **Step 5: Implement API client**

Create `src/api/reportApi.ts`:

```ts
import type { ReportRequest, ReportResponse } from '../types/report';

export function toReportQueryString(request: ReportRequest): string {
  const params = new URLSearchParams({
    ticker: request.ticker.trim(),
    from: request.from,
    to: request.to,
    ai: String(request.ai),
  });

  return params.toString();
}

export async function fetchReport(
  request: ReportRequest,
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '',
): Promise<ReportResponse> {
  const baseUrl = apiBaseUrl.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/api/reports?${toReportQueryString(request)}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`리포트 조회 실패: ${message || response.status}`);
  }

  return response.json() as Promise<ReportResponse>;
}
```

- [ ] **Step 6: Run API tests**

Run:

```bash
npm test -- src/api/reportApi.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit API layer**

```bash
git add src/types/report.ts src/api/reportApi.ts src/api/reportApi.test.ts src/test/setup.ts
git commit -m "feat: add report api client"
```

---

### Task 3: Query Form

**Files:**
- Create: `src/components/ReportQueryForm.tsx`
- Create: `src/components/ReportQueryForm.test.tsx`

- [ ] **Step 1: Write failing form tests**

Create `src/components/ReportQueryForm.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReportQueryForm } from './ReportQueryForm';

describe('ReportQueryForm', () => {
  it('submits ticker, date range, and AI option', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ReportQueryForm isLoading={false} onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText('종목 코드'));
    await user.type(screen.getByLabelText('종목 코드'), '005930.KS');
    await user.clear(screen.getByLabelText('시작일'));
    await user.type(screen.getByLabelText('시작일'), '2026-05-01');
    await user.clear(screen.getByLabelText('종료일'));
    await user.type(screen.getByLabelText('종료일'), '2026-06-21');
    await user.click(screen.getByRole('button', { name: '리포트 조회' }));

    expect(onSubmit).toHaveBeenCalledWith({
      ticker: '005930.KS',
      from: '2026-05-01',
      to: '2026-06-21',
      ai: true,
    });
  });

  it('disables submit while loading', () => {
    render(<ReportQueryForm isLoading onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: '조회 중...' })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/ReportQueryForm.test.tsx
```

Expected: FAIL because `ReportQueryForm` does not exist.

- [ ] **Step 3: Implement form component**

Create `src/components/ReportQueryForm.tsx`:

```tsx
import { FormEvent, useState } from 'react';
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
```

- [ ] **Step 4: Run form tests**

Run:

```bash
npm test -- src/components/ReportQueryForm.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit form**

```bash
git add src/components/ReportQueryForm.tsx src/components/ReportQueryForm.test.tsx
git commit -m "feat: add report query form"
```

---

### Task 4: Report Rendering Components

**Files:**
- Create: `src/test/fixtures/report.ts`
- Create: `src/components/ReportState.tsx`
- Create: `src/components/ReportSummary.tsx`
- Create: `src/components/AiAnalysisPanel.tsx`

- [ ] **Step 1: Create report fixture**

Create `src/test/fixtures/report.ts`:

```ts
import type { ReportResponse } from '../../types/report';

export const sampleReport: ReportResponse = {
  ticker: '000660.KS',
  from: '2026-04-01',
  to: '2026-06-21',
  ai: true,
  generatedAt: '2026-06-21T08:59:44.592Z',
  candles: [
    { time: '2026-06-18', open: 2556000, high: 2738000, low: 2556000, close: 2685000, volume: 5808765 },
    { time: '2026-06-19', open: 2824000, high: 2891000, low: 2688000, close: 2764000, volume: 7478195 },
  ],
  indicators: {
    sma20: [{ time: '2026-06-19', value: 2247700 }],
    sma50: [{ time: '2026-06-19', value: 1738380 }],
    rsi14: [{ time: '2026-06-19', value: 73.715861 }],
    macd: [{ time: '2026-06-19', macd: 234738.331499, signal: 207516.808941, histogram: 27221.522558 }],
    volume: [{ time: '2026-06-19', value: 7478195 }],
  },
  aiAnalysis: {
    status: 'available',
    analysis: {
      beginnerExplanation: {
        summary: '최근 약 2.5개월 동안 주가가 급격히 상승한 흐름을 보이고 있습니다.',
        sma: '현재 주가는 20일선과 50일선보다 위에 위치해 상승 배열을 보여줍니다.',
        rsi: 'RSI는 과매수 구간으로 분류되는 70을 초과했습니다.',
        macd: 'MACD는 상승 모멘텀이 유지되고 있음을 보여줍니다.',
        volume: '거래량이 평균보다 증가하며 상승 흐름을 지지합니다.',
      },
      checklist: {
        trend: { status: 'positive', title: '강한 상승 추세 지속', explanation: '단기/중기적으로 우상향 흐름입니다.' },
        momentum: { status: 'caution', title: '과매수 신호', explanation: '단기 조정 가능성에 대비해야 합니다.' },
        volume: { status: 'positive', title: '평균 대비 높은 거래량', explanation: '거래량이 상승 흐름을 지지합니다.' },
        risk: { status: 'caution', title: '높은 변동성', explanation: '급격한 가격 변동 위험이 있습니다.' },
      },
      report: {
        headline: '단기 급등세 속 과열 신호 감지',
        summary: '강한 상승 추세와 과매수 신호가 동시에 관찰됩니다.',
        observations: ['주가가 분석 기간 동안 크게 상승했습니다.', 'RSI가 70을 상회합니다.'],
        nextThingsToWatch: ['20일 이동평균선 지지 여부', '거래량 유지 여부'],
        disclaimer: '본 분석은 교육용 자료이며 투자 권유가 아닙니다.',
      },
    },
  },
};
```

- [ ] **Step 2: Implement state component**

Create `src/components/ReportState.tsx`:

```tsx
type ReportStateProps = {
  status: 'idle' | 'loading' | 'error';
  errorMessage?: string;
};

export function ReportState({ status, errorMessage }: ReportStateProps) {
  if (status === 'loading') {
    return <section className="state-panel">리포트를 불러오는 중입니다.</section>;
  }

  if (status === 'error') {
    return <section className="state-panel state-panel-error">{errorMessage ?? '리포트 조회에 실패했습니다.'}</section>;
  }

  return <section className="state-panel">종목과 기간을 입력하면 분석 리포트가 표시됩니다.</section>;
}
```

- [ ] **Step 3: Implement summary component**

Create `src/components/ReportSummary.tsx`:

```tsx
import type { ReportResponse } from '../types/report';

type ReportSummaryProps = {
  report: ReportResponse;
};

export function ReportSummary({ report }: ReportSummaryProps) {
  const latestCandle = report.candles.at(-1);
  const generatedAt = new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(report.generatedAt));

  return (
    <section className="hero">
      <p className="eyebrow">STOCK FLOW REPORT</p>
      <h1>{report.ticker} 분석 리포트</h1>
      <div className="meta">
        <span className="pill">{report.from} - {report.to}</span>
        <span className="pill">{report.candles.length} candles</span>
        <span className="pill">Generated {generatedAt}</span>
      </div>
      {latestCandle ? (
        <div className="metric-grid">
          <article className="metric-card">
            <span>Latest close</span>
            <strong>{latestCandle.close.toLocaleString('ko-KR')}</strong>
          </article>
          <article className="metric-card">
            <span>Volume</span>
            <strong>{latestCandle.volume.toLocaleString('ko-KR')}</strong>
          </article>
        </div>
      ) : null}
      {report.aiAnalysis?.analysis ? <p className="ai-summary">{report.aiAnalysis.analysis.report.summary}</p> : null}
    </section>
  );
}
```

- [ ] **Step 4: Implement AI analysis component**

Create `src/components/AiAnalysisPanel.tsx`:

```tsx
import type { AiAnalysis } from '../types/report';

type AiAnalysisPanelProps = {
  aiAnalysis?: AiAnalysis;
};

export function AiAnalysisPanel({ aiAnalysis }: AiAnalysisPanelProps) {
  if (!aiAnalysis?.analysis) {
    return <section className="content-section">AI 분석 결과가 없습니다.</section>;
  }

  const { beginnerExplanation, checklist, report } = aiAnalysis.analysis;
  const checklistItems = Object.values(checklist);

  return (
    <section className="content-section">
      <p className="eyebrow">AI ANALYSIS</p>
      <h2>{report.headline}</h2>
      <p>{beginnerExplanation.summary}</p>

      <div className="card-grid">
        {checklistItems.map((item) => (
          <article className={`feature-card status-${item.status}`} key={item.title}>
            <span className="pill">{item.status}</span>
            <h3>{item.title}</h3>
            <p>{item.explanation}</p>
          </article>
        ))}
      </div>

      <div className="two-column">
        <article>
          <h3>관찰 포인트</h3>
          <ul>
            {report.observations.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article>
          <h3>다음에 볼 것</h3>
          <ul>
            {report.nextThingsToWatch.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </div>

      <p className="disclaimer">{report.disclaimer}</p>
    </section>
  );
}
```

- [ ] **Step 5: Run typecheck**

Run:

```bash
npm run build
```

Expected: build succeeds or fails only because `src/main.tsx` and `src/App.tsx` are not created yet. If it fails for missing entry files, continue to Task 5.

- [ ] **Step 6: Commit rendering components**

```bash
git add src/test/fixtures/report.ts src/components/ReportState.tsx src/components/ReportSummary.tsx src/components/AiAnalysisPanel.tsx
git commit -m "feat: add report content components"
```

---

### Task 5: Chart Component

**Files:**
- Create: `src/components/ReportCharts.tsx`

- [ ] **Step 1: Implement chart component**

Create `src/components/ReportCharts.tsx`:

```tsx
import { createChart, type IChartApi } from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import type { LinePoint, ReportResponse } from '../types/report';

type ReportChartsProps = {
  report: ReportResponse;
};

function cleanLine(points: LinePoint[]) {
  return points
    .filter((point): point is { time: string; value: number } => point.value !== null)
    .map((point) => ({ time: point.time, value: point.value }));
}

function useChart(render: (chart: IChartApi) => void) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height: 300,
      layout: { background: { color: '#1a1a1a' }, textColor: '#bdbdbd' },
      grid: {
        vertLines: { color: '#2a2a2a' },
        horzLines: { color: '#2a2a2a' },
      },
      rightPriceScale: { borderColor: '#3d3a39' },
      timeScale: { borderColor: '#3d3a39' },
    });

    render(chart);
    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [render]);

  return containerRef;
}

export function ReportCharts({ report }: ReportChartsProps) {
  const priceRef = useChart((chart) => {
    chart.addCandlestickSeries().setData(report.candles);
    chart.addLineSeries({ color: '#00d992', lineWidth: 2 }).setData(cleanLine(report.indicators.sma20));
    chart.addLineSeries({ color: '#8b949e', lineWidth: 2 }).setData(cleanLine(report.indicators.sma50));
  });

  const rsiRef = useChart((chart) => {
    chart.addLineSeries({ color: '#00d992', lineWidth: 2 }).setData(cleanLine(report.indicators.rsi14));
  });

  const macdRef = useChart((chart) => {
    chart.addLineSeries({ color: '#00d992', lineWidth: 2 }).setData(
      report.indicators.macd
        .filter((point) => point.macd !== null)
        .map((point) => ({ time: point.time, value: point.macd as number })),
    );
    chart.addLineSeries({ color: '#8b949e', lineWidth: 2 }).setData(
      report.indicators.macd
        .filter((point) => point.signal !== null)
        .map((point) => ({ time: point.time, value: point.signal as number })),
    );
    chart.addHistogramSeries({ color: '#10b981' }).setData(
      report.indicators.macd
        .filter((point) => point.histogram !== null)
        .map((point) => ({ time: point.time, value: point.histogram as number })),
    );
  });

  const volumeRef = useChart((chart) => {
    chart.addHistogramSeries({ color: '#00d992' }).setData(cleanLine(report.indicators.volume));
  });

  return (
    <section className="content-section">
      <p className="eyebrow">TECHNICAL CHARTS</p>
      <h2>가격과 지표</h2>
      <div className="chart-stack">
        <article className="chart-card"><h3>Price / SMA</h3><div ref={priceRef} /></article>
        <article className="chart-card"><h3>RSI 14</h3><div ref={rsiRef} /></article>
        <article className="chart-card"><h3>MACD</h3><div ref={macdRef} /></article>
        <article className="chart-card"><h3>Volume</h3><div ref={volumeRef} /></article>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run build
```

Expected: build succeeds or fails only because `src/main.tsx` and `src/App.tsx` are not created yet. If it fails for missing entry files, continue to Task 6.

- [ ] **Step 3: Commit charts**

```bash
git add src/components/ReportCharts.tsx
git commit -m "feat: add report charts"
```

---

### Task 6: App Composition and Styling

**Files:**
- Create: `src/App.tsx`
- Create: `src/main.tsx`
- Create: `src/styles.css`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write failing app integration test**

Create `src/App.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { sampleReport } from './test/fixtures/report';

vi.mock('./components/ReportCharts', () => ({
  ReportCharts: () => <section>차트 영역</section>,
}));

describe('App', () => {
  it('fetches and displays a report', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleReport),
      }),
    );

    render(<App />);

    await user.click(screen.getByRole('button', { name: '리포트 조회' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '000660.KS 분석 리포트' })).toBeInTheDocument();
    });
    expect(screen.getByText('단기 급등세 속 과열 신호 감지')).toBeInTheDocument();
    expect(screen.getByText('차트 영역')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because `src/App.tsx` does not exist.

- [ ] **Step 3: Implement app component**

Create `src/App.tsx`:

```tsx
import { useState } from 'react';
import { fetchReport } from './api/reportApi';
import { AiAnalysisPanel } from './components/AiAnalysisPanel';
import { ReportCharts } from './components/ReportCharts';
import { ReportQueryForm } from './components/ReportQueryForm';
import { ReportState } from './components/ReportState';
import { ReportSummary } from './components/ReportSummary';
import type { ReportRequest, ReportResponse } from './types/report';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

export default function App() {
  const [status, setStatus] = useState<LoadState>('idle');
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();

  async function handleSubmit(request: ReportRequest) {
    setStatus('loading');
    setErrorMessage(undefined);

    try {
      const nextReport = await fetchReport(request);
      setReport(nextReport);
      setStatus('success');
    } catch (error) {
      setReport(null);
      setErrorMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      setStatus('error');
    }
  }

  return (
    <main className="page">
      <section className="app-header">
        <div>
          <p className="eyebrow">STOCK FLOW</p>
          <h1>리포트 조회</h1>
          <p>종목 코드와 기간을 지정해 백엔드 분석 리포트를 확인합니다.</p>
        </div>
        <ReportQueryForm isLoading={status === 'loading'} onSubmit={handleSubmit} />
      </section>

      {report && status === 'success' ? (
        <>
          <ReportSummary report={report} />
          <ReportCharts report={report} />
          <AiAnalysisPanel aiAnalysis={report.aiAnalysis} />
        </>
      ) : (
        <ReportState status={status === 'success' ? 'idle' : status} errorMessage={errorMessage} />
      )}
    </main>
  );
}
```

- [ ] **Step 4: Implement React entrypoint**

Create `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 5: Implement global styles**

Create `src/styles.css`:

```css
:root {
  color-scheme: dark;
  --canvas: #101010;
  --canvas-soft: #1a1a1a;
  --primary: #00d992;
  --primary-deep: #10b981;
  --hairline: #3d3a39;
  --ink: #f2f2f2;
  --ink-strong: #ffffff;
  --body: #bdbdbd;
  --mute: #8b949e;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--canvas);
  color: var(--ink);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--canvas);
  line-height: 1.65;
}

button,
input {
  font: inherit;
}

.page {
  width: min(1280px, calc(100% - 48px));
  margin: 0 auto;
  padding: 48px 0 64px;
}

.app-header,
.hero,
.content-section,
.state-panel {
  border-bottom: 1px dashed rgba(79, 93, 117, 0.4);
  padding: 40px 0;
}

.app-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 520px);
  gap: 32px;
  align-items: start;
}

.eyebrow {
  margin: 0 0 12px;
  color: var(--primary);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2.52px;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 16px;
  color: var(--ink-strong);
  font-size: clamp(32px, 6vw, 60px);
  font-weight: 400;
  line-height: 1;
}

h2 {
  color: var(--ink-strong);
  font-size: 36px;
  font-weight: 400;
  line-height: 1.15;
}

h3 {
  color: var(--ink-strong);
  font-size: 20px;
}

p,
li {
  color: var(--body);
}

.query-form,
.feature-card,
.metric-card,
.chart-card,
.state-panel {
  border: 1px solid var(--hairline);
  border-radius: 8px;
  background: var(--canvas);
}

.query-form {
  display: grid;
  gap: 16px;
  padding: 24px;
}

.query-form label {
  display: grid;
  gap: 8px;
  color: var(--body);
  font-size: 14px;
}

.query-form input {
  min-height: 44px;
  border: 1px solid var(--hairline);
  border-radius: 6px;
  background: var(--canvas-soft);
  color: var(--ink);
  padding: 10px 12px;
}

.checkbox-field {
  grid-template-columns: auto 1fr;
  align-items: center;
}

.checkbox-field input {
  min-height: auto;
}

button {
  min-height: 44px;
  border: 0;
  border-radius: 6px;
  background: var(--primary);
  color: #101010;
  cursor: pointer;
  font-weight: 600;
  padding: 12px 16px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.meta,
.metric-grid,
.card-grid,
.chart-stack,
.two-column {
  display: grid;
  gap: 16px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.pill {
  display: inline-flex;
  width: fit-content;
  border: 1px solid var(--hairline);
  border-radius: 9999px;
  color: var(--ink);
  font-size: 14px;
  padding: 4px 12px;
}

.metric-grid,
.card-grid,
.two-column {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.metric-card,
.feature-card,
.chart-card,
.state-panel {
  padding: 24px;
}

.metric-card strong {
  display: block;
  color: var(--ink-strong);
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 28px;
}

.ai-summary,
.disclaimer {
  margin-top: 24px;
}

.chart-stack {
  grid-template-columns: 1fr;
}

.chart-card > div {
  min-height: 300px;
}

.status-positive {
  border-color: var(--primary-deep);
}

.status-caution {
  border-color: #8b949e;
}

.state-panel-error {
  border-color: #f87171;
  color: #fecaca;
}

@media (max-width: 900px) {
  .page {
    width: min(100% - 32px, 1280px);
    padding-top: 24px;
  }

  .app-header,
  .metric-grid,
  .card-grid,
  .two-column {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Run app test**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit app composition**

```bash
git add src/App.tsx src/main.tsx src/styles.css src/App.test.tsx
git commit -m "feat: compose report viewer app"
```

---

### Task 7: Verification

**Files:**
- Modify only if verification finds a defect in files created by earlier tasks.

- [ ] **Step 1: Run full test suite**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: TypeScript build and Vite production build pass.

- [ ] **Step 3: Start dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 4: Verify in browser**

Open the local URL and verify:

- The first screen is the report query tool, not a marketing page.
- The dark canvas, green CTA, hairline cards, and compact spacing match `design.md`.
- The form is usable on desktop and mobile widths.
- Submitting with a mocked or running backend shows the report summary, charts, and AI analysis.
- Backend errors show the Korean error panel.

- [ ] **Step 5: Commit final fixes**

If changes were needed:

```bash
git add src package.json package-lock.json
git commit -m "fix: polish report viewer verification issues"
```

If no changes were needed, do not create an empty commit.

---

## Self-Review

- Spec coverage: The plan covers React + TypeScript setup, JSON report API consumption, ticker/date/AI query controls, native React rendering, charts, AI analysis sections, loading and error states, and the visual language from `design.md`.
- Placeholder scan: No unfinished placeholder markers are present. Each implementation task names exact files and includes concrete code or commands.
- Type consistency: `ReportRequest`, `ReportResponse`, `AiAnalysis`, and component props are defined before use and reused consistently across API, components, fixtures, and tests.
