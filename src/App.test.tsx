import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { sampleReport } from './test/fixtures/report';

vi.mock('./components/ReportCharts', () => ({
  ReportCharts: () => <section>차트 영역</section>,
}));

function storeSession() {
  localStorage.setItem('stock-flow-token', 'jwt-token');
  localStorage.setItem('stock-flow-user', JSON.stringify({ id: 'user-uuid', email: 'user@example.com' }));
}

describe('App routing', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('shows only the auth screen before login', () => {
    window.history.pushState({}, '', '/stocks');

    render(<App />);

    expect(screen.getByRole('heading', { name: '계정 연결' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '교육용 주식 차트 분석' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '관심 종목' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '관심 종목' })).not.toBeInTheDocument();
  });

  it('creates a report and navigates to its detail route', async () => {
    const user = userEvent.setup();
    storeSession();
    window.history.pushState({}, '', '/reports/new');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(sampleReport),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    await user.click(screen.getByRole('button', { name: '리포트 생성' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '000660.KS 분석 리포트' })).toBeInTheDocument();
    });
    expect(screen.getByText('차트 영역')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/reports/report-uuid');
  });

  it('keeps the report list menu active on the report generation route', () => {
    storeSession();
    window.history.pushState({}, '', '/reports/new');

    render(<App />);

    expect(screen.queryByRole('link', { name: '리포트 생성' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '리포트 목록' })).toHaveAttribute('aria-current', 'page');
  });

  it('toggles and persists the sidebar collapsed state', async () => {
    const user = userEvent.setup();
    storeSession();
    window.history.pushState({}, '', '/dashboard');

    render(<App />);

    await user.click(screen.getByRole('button', { name: '사이드바 접기' }));

    expect(screen.getByRole('button', { name: '사이드바 펼치기' })).toBeInTheDocument();
    expect(localStorage.getItem('stock-flow-sidebar-collapsed')).toBe('true');
    expect(screen.getByRole('link', { name: '대시보드' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows the glossary route for stock terms', () => {
    storeSession();
    window.history.pushState({}, '', '/glossary');

    render(<App />);

    expect(screen.getByRole('heading', { name: '주식 용어집' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '보조 지표' })).toBeInTheDocument();
    expect(screen.getByText(/20일 이동평균선이 50일 이동평균선 아래에 있다가 위로 올라서면/)).toBeInTheDocument();
  });

  it('shows the trading skills learning route', () => {
    storeSession();
    window.history.pushState({}, '', '/trading-skills');

    render(<App />);

    expect(screen.getByRole('heading', { name: '트레이딩 스킬 학습' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '스킬 학습' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('추세와 눌림 구분하기')).toBeInTheDocument();
    expect(screen.getByText('지지선 이탈 확인하기')).toBeInTheDocument();
  });

  it('shows the chart pattern map route', () => {
    storeSession();
    window.history.pushState({}, '', '/chart-patterns');

    render(<App />);

    expect(screen.getByRole('heading', { name: '차트 흐름도' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '차트 흐름도' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('이중 천장')).toBeInTheDocument();
    expect(screen.getByText('상승 삼각형')).toBeInTheDocument();
  });

  it('shows stocks from the watchlist route', async () => {
    storeSession();
    window.history.pushState({}, '', '/stocks');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 'stock-1',
              userId: 'user-uuid',
              ticker: 'AAPL',
              name: 'Apple',
              scheduleEnabled: true,
              scheduleTime: '08:00',
              scheduleTimezone: 'Asia/Seoul',
              reportPeriod: '6m',
              includeAi: false,
              lastScheduledRunAt: null,
              createdAt: '2026-07-04T05:34:26.000Z',
              updatedAt: '2026-07-04T05:34:26.000Z',
            },
          ]),
      }),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('logs out and returns to the auth screen when an authenticated request gets 401', async () => {
    storeSession();
    window.history.pushState({}, '', '/stocks');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('expired token'),
      }),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '계정 연결' })).toBeInTheDocument();
    });
    expect(localStorage.getItem('stock-flow-token')).toBeNull();
    expect(localStorage.getItem('stock-flow-user')).toBeNull();
  });

  it('prefills report generation from a watchlist row action', async () => {
    const user = userEvent.setup();
    storeSession();
    window.history.pushState({}, '', '/stocks');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 'stock-1',
              userId: 'user-uuid',
              ticker: 'AAPL',
              name: 'Apple',
              scheduleEnabled: true,
              scheduleTime: '08:00',
              scheduleTimezone: 'Asia/Seoul',
              reportPeriod: '6m',
              includeAi: false,
              lastScheduledRunAt: null,
              createdAt: '2026-07-04T05:34:26.000Z',
              updatedAt: '2026-07-04T05:34:26.000Z',
            },
          ]),
      }),
    );

    render(<App />);

    await user.click(await screen.findByRole('link', { name: '리포트 생성 Apple' }));

    expect(window.location.pathname).toBe('/reports/new');
    expect(window.location.search).toBe('?ticker=AAPL');
    expect(screen.getByLabelText('종목')).toHaveValue('AAPL');
  });

  it('opens report detail from the report list', async () => {
    const user = userEvent.setup();
    storeSession();
    window.history.pushState({}, '', '/reports');
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            url.includes('/reports/report-uuid')
              ? sampleReport
              : { items: [sampleReport], page: 1, pageSize: 10, total: 1, totalPages: 1 },
          ),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    expect(await screen.findByText('AI 분석 완료')).toBeInTheDocument();
    await user.click(await screen.findByRole('link', { name: /000660.KS/ }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '000660.KS 분석 리포트' })).toBeInTheDocument();
    });
    expect(screen.getByText('차트 영역')).toBeInTheDocument();
  });

  it('deletes a report from the report list and reloads the current query', async () => {
    const user = userEvent.setup();
    storeSession();
    window.history.pushState({}, '', '/reports');
    const listWithReport = { items: [sampleReport], page: 1, pageSize: 10, total: 1, totalPages: 1 };
    const emptyList = { items: [], page: 1, pageSize: 10, total: 0, totalPages: 0 };
    let resolveDelete: (value: { ok: true; status: 204 }) => void = () => {};
    const deletePromise = new Promise<{ ok: true; status: 204 }>((resolve) => {
      resolveDelete = resolve;
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(listWithReport),
      })
      .mockReturnValueOnce(deletePromise)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(emptyList),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    await user.click(await screen.findByRole('button', { name: '리포트 삭제 확인 000660.KS' }));

    expect(screen.getByText('이 리포트를 삭제하면 다시 복구할 수 없습니다.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: '삭제 확정 000660.KS' }));

    expect(screen.getByText('삭제 중')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삭제 확정 000660.KS' })).toBeDisabled();

    resolveDelete({ ok: true, status: 204 });

    await waitFor(() => {
      expect(screen.getByText('리포트를 삭제했습니다.')).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/reports/report-uuid', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer jwt-token' },
    });
    expect(screen.getByText('아직 생성된 리포트가 없습니다.')).toBeInTheDocument();
  });

  it('keeps report filters collapsed until the user opens them', async () => {
    const user = userEvent.setup();
    storeSession();
    window.history.pushState({}, '', '/reports');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [sampleReport], page: 1, pageSize: 10, total: 1, totalPages: 1 }),
      }),
    );

    render(<App />);

    expect(await screen.findByRole('button', { name: '필터 열기' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '필터 적용' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '필터 열기' }));

    expect(screen.getByRole('button', { name: '필터 적용' })).toBeInTheDocument();
  });
});
