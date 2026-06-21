import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { sampleReport } from './test/fixtures/report';

vi.mock('./components/ReportCharts', () => ({
  ReportCharts: () => <section>차트 영역</section>,
}));

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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
