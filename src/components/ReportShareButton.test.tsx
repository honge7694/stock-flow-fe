import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { sampleReport } from '../test/fixtures/report';
import { shareReport } from '../utils/shareReport';
import { ReportShareButton } from './ReportShareButton';

vi.mock('../utils/shareReport', () => ({
  shareReport: vi.fn(),
}));

describe('ReportShareButton', () => {
  it('creates a share image from the current report', async () => {
    const user = userEvent.setup();
    vi.mocked(shareReport).mockResolvedValue('downloaded');
    const captureTarget = document.createElement('div');
    const captureTargetRef = { current: captureTarget };

    render(<ReportShareButton report={sampleReport} payload={sampleReport.payload!} captureTargetRef={captureTargetRef} />);

    await user.click(screen.getByRole('button', { name: '요약 이미지 공유' }));

    expect(shareReport).toHaveBeenCalledWith(sampleReport, sampleReport.payload!, captureTarget);
    await waitFor(() => {
      expect(screen.getByText('공유 이미지를 다운로드했습니다.')).toBeInTheDocument();
    });
  });
});
