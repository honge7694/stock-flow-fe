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

  it('marks only report generation active on the report generation route', () => {
    storeSession();
    window.history.pushState({}, '', '/reports/new');

    render(<App />);

    expect(screen.getByRole('link', { name: '리포트 생성' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '리포트 목록' })).not.toHaveAttribute('aria-current');
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

    await user.click(await screen.findByRole('link', { name: /000660.KS/ }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '000660.KS 분석 리포트' })).toBeInTheDocument();
    });
    expect(screen.getByText('차트 영역')).toBeInTheDocument();
  });
});
