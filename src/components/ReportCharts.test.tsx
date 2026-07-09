import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { sampleReport } from '../test/fixtures/report';
import { ReportCharts } from './ReportCharts';

vi.mock('lightweight-charts', () => ({
  createChart: vi.fn(() => ({
    addCandlestickSeries: () => ({ setData: vi.fn() }),
    addLineSeries: () => ({ setData: vi.fn() }),
    addHistogramSeries: () => ({ setData: vi.fn() }),
    timeScale: () => ({ fitContent: vi.fn() }),
    remove: vi.fn(),
  })),
}));

describe('ReportCharts', () => {
  it('keeps the price report collapsed until the user expands it', async () => {
    const user = userEvent.setup();

    render(<ReportCharts payload={sampleReport.payload!} />);

    expect(screen.getByRole('button', { name: '펼치기' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('heading', { name: '가격 / 이동평균선' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '펼치기' }));

    expect(screen.getByRole('button', { name: '접기' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('heading', { name: '가격 / 이동평균선' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '접기' }));

    expect(screen.queryByRole('heading', { name: '가격 / 이동평균선' })).not.toBeInTheDocument();
  });
});
