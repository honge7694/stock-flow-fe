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
