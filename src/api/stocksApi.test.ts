import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStock, deleteStock, fetchStocks, updateStock } from './stocksApi';

describe('stocksApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches stocks with authorization', async () => {
    const stocks = [{ id: 'stock-1', ticker: 'AAPL' }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(stocks),
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchStocks('jwt-token', 'http://localhost:3000')).resolves.toEqual(stocks);

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/stocks', {
      headers: { Authorization: 'Bearer jwt-token' },
    });
  });

  it('creates a stock with JSON body', async () => {
    const stock = { id: 'stock-1', ticker: 'AAPL' };
    const request = {
      ticker: ' AAPL ',
      name: 'Apple',
      scheduleEnabled: true,
      scheduleTime: '08:00',
      scheduleTimezone: 'Asia/Seoul',
      reportPeriod: '6m' as const,
      includeAi: false,
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(stock),
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(createStock(request, 'jwt-token', '')).resolves.toEqual(stock);

    expect(fetchMock).toHaveBeenCalledWith('/stocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer jwt-token',
      },
      body: JSON.stringify({ ...request, ticker: 'AAPL' }),
    });
  });

  it('updates a stock with changed fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'stock-1', ticker: 'AAPL', includeAi: true }),
    });

    vi.stubGlobal('fetch', fetchMock);

    await updateStock('stock-1', { includeAi: true, reportPeriod: '3m' }, 'jwt-token', '');

    expect(fetchMock).toHaveBeenCalledWith('/stocks/stock-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer jwt-token',
      },
      body: JSON.stringify({ includeAi: true, reportPeriod: '3m' }),
    });
  });

  it('deletes a stock', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });

    vi.stubGlobal('fetch', fetchMock);

    await deleteStock('stock-1', 'jwt-token', '');

    expect(fetchMock).toHaveBeenCalledWith('/stocks/stock-1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer jwt-token' },
    });
  });
});
