import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createPortfolioEducationAnalysis,
  deletePortfolioEducationAnalysis,
  fetchPortfolioEducationAnalyses,
  fetchPortfolioEducationAnalysisById,
  updatePortfolioEducationAnalysis,
} from './portfolioApi';

describe('portfolio education analysis API', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates a portfolio education analysis with authorization', async () => {
    const responseBody = { id: 'analysis-1', ticker: 'AAPL' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(responseBody),
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      createPortfolioEducationAnalysis(
        {
          ticker: ' aapl ',
          quantity: '10',
          averagePrice: '150',
          currency: ' usd ',
          from: '2026-01-01',
          to: '2026-07-11',
        },
        'jwt-token',
        'http://localhost:4000',
      ),
    ).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:4000/portfolio/education-analysis', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer jwt-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticker: 'AAPL',
        quantity: '10',
        averagePrice: '150',
        currency: 'USD',
        from: '2026-01-01',
        to: '2026-07-11',
      }),
    });
  });

  it('fetches a paged portfolio education analysis list', async () => {
    const responseBody = { items: [], page: 2, pageSize: 10, total: 0, totalPages: 0 };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(responseBody),
    });

    vi.stubGlobal('fetch', fetchMock);

    await fetchPortfolioEducationAnalyses('jwt-token', 'http://localhost:4000', {
      page: 2,
      pageSize: 10,
      ticker: ' aapl ',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/portfolio/education-analysis?page=2&pageSize=10&ticker=AAPL',
      {
        headers: { Authorization: 'Bearer jwt-token' },
      },
    );
  });

  it('fetches portfolio education analysis detail', async () => {
    const responseBody = { id: 'analysis-1', ticker: 'AAPL' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(responseBody),
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchPortfolioEducationAnalysisById('analysis-1', 'jwt-token', '')).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledWith('/portfolio/education-analysis/analysis-1', {
      headers: { Authorization: 'Bearer jwt-token' },
    });
  });

  it('updates a portfolio education analysis', async () => {
    const responseBody = { id: 'analysis-1', ticker: '005930.KS' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(responseBody),
    });

    vi.stubGlobal('fetch', fetchMock);

    await updatePortfolioEducationAnalysis(
      'analysis-1',
      { ticker: '005930.KS', quantity: 3, averagePrice: 72000 },
      'jwt-token',
      'http://localhost:4000',
    );

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:4000/portfolio/education-analysis/analysis-1', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer jwt-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticker: '005930.KS',
        quantity: 3,
        averagePrice: 72000,
      }),
    });
  });

  it('deletes a portfolio education analysis without parsing a body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });

    vi.stubGlobal('fetch', fetchMock);

    await deletePortfolioEducationAnalysis('analysis-1', 'jwt-token', 'http://localhost:4000');

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:4000/portfolio/education-analysis/analysis-1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer jwt-token' },
    });
  });
});
