import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchReport, fetchReportById, fetchReports } from './reportApi';

describe('fetchReport', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches a report from the configured API base URL', async () => {
    const responseBody = {
      id: 'report-uuid',
      ticker: '000660.KS',
      from: '2026-04-01',
      to: '2026-06-21',
      generatedAt: '2026-06-21T08:59:44.592Z',
      source: 'manual',
      status: 'completed',
      includeAi: true,
      reportPeriod: null,
      payload: {
        ticker: '000660.KS',
        from: '2026-04-01',
        to: '2026-06-21',
        generatedAt: '2026-06-21T08:59:44.592Z',
        candles: [],
        indicators: { sma20: [], sma50: [], rsi14: [], macd: [], volume: [] },
      },
      errorMessage: null,
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
      'http://localhost:3000/reports/generate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker: '000660.KS',
          from: '2026-04-01',
          to: '2026-06-21',
          ai: true,
        }),
      },
    );
  });

  it('adds an authorization header when an access token is provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'report-uuid',
          ticker: 'AAPL',
          from: '2025-01-01',
          to: '2025-01-31',
          generatedAt: '2026-07-04T05:34:26.000Z',
          source: 'manual',
          status: 'completed',
          includeAi: false,
          reportPeriod: null,
          payload: null,
          errorMessage: null,
        }),
    });

    vi.stubGlobal('fetch', fetchMock);

    await fetchReport({ ticker: ' AAPL ', from: '2025-01-01', to: '2025-01-31', ai: false }, '', 'jwt-token');

    expect(fetchMock).toHaveBeenCalledWith(
      '/reports/generate',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt-token',
        },
        body: JSON.stringify({
          ticker: 'AAPL',
          from: '2025-01-01',
          to: '2025-01-31',
          ai: false,
        }),
      }),
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
    ).rejects.toThrow('리포트 생성 실패: report generation failed');
  });
});

describe('report list and detail', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches reports with authorization', async () => {
    const reports = [{ id: 'report-1', ticker: 'AAPL' }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(reports),
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchReports('jwt-token', 'http://localhost:3000')).resolves.toEqual(reports);

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/reports', {
      headers: { Authorization: 'Bearer jwt-token' },
    });
  });

  it('fetches reports with query filters', async () => {
    const reports = [{ id: 'report-1', ticker: 'AAPL' }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(reports),
    });

    vi.stubGlobal('fetch', fetchMock);

    await fetchReports('jwt-token', 'http://localhost:3000', {
      ticker: ' aapl ',
      status: 'completed',
      source: 'manual',
      includeAi: true,
      from: '2025-01-01',
      to: '2025-12-31',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/reports?ticker=AAPL&status=completed&source=manual&includeAi=true&from=2025-01-01&to=2025-12-31',
      {
        headers: { Authorization: 'Bearer jwt-token' },
      },
    );
  });

  it('fetches report detail with authorization', async () => {
    const report = { id: 'report-1', ticker: 'AAPL' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(report),
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchReportById('report-1', 'jwt-token', '')).resolves.toEqual(report);

    expect(fetchMock).toHaveBeenCalledWith('/reports/report-1', {
      headers: { Authorization: 'Bearer jwt-token' },
    });
  });
});
