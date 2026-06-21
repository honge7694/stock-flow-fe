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
