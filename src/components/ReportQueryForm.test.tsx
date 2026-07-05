import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReportQueryForm } from './ReportQueryForm';

describe('ReportQueryForm', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses today as the default end date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-04T09:00:00+09:00'));

    render(<ReportQueryForm isLoading={false} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('종료일')).toHaveValue('2026-07-04');
  });

  it('uses six months before today as the default start date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-04T09:00:00+09:00'));

    render(<ReportQueryForm isLoading={false} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('시작일')).toHaveValue('2026-01-04');
  });

  it('uses an initial ticker when provided', () => {
    render(<ReportQueryForm isLoading={false} initialTicker="AAPL" onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('종목')).toHaveValue('AAPL');
  });

  it('submits ticker, date range, and AI option', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ReportQueryForm isLoading={false} onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText('종목'));
    await user.type(screen.getByLabelText('종목'), '005930.KS');
    await user.clear(screen.getByLabelText('시작일'));
    await user.type(screen.getByLabelText('시작일'), '2026-05-01');
    await user.clear(screen.getByLabelText('종료일'));
    await user.type(screen.getByLabelText('종료일'), '2026-06-21');
    await user.click(screen.getByRole('button', { name: '리포트 생성' }));

    expect(onSubmit).toHaveBeenCalledWith({
      ticker: '005930.KS',
      from: '2026-05-01',
      to: '2026-06-21',
      ai: true,
    });
  });

  it('disables submit while loading', () => {
    render(<ReportQueryForm isLoading onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: '생성 중...' })).toBeDisabled();
  });
});
