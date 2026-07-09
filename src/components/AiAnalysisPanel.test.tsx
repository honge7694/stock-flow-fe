import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AiAnalysisPanel } from './AiAnalysisPanel';

describe('AiAnalysisPanel', () => {
  it('shows an unavailable state when requested AI analysis fails', () => {
    render(
      <AiAnalysisPanel
        aiAnalysis={{
          status: 'unavailable',
          errorMessage: 'AI provider request failed',
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'AI 분석을 생성하지 못했습니다' })).toBeInTheDocument();
    expect(screen.getByText('AI provider request failed')).toBeInTheDocument();
  });
});
