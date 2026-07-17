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

  it('applies distinct status classes to neutral, caution, and negative checks', () => {
    const createCheck = (status: 'neutral' | 'caution' | 'negative', title: string) => ({
      status,
      title,
      summary: `${title} 설명`,
    });

    render(
      <AiAnalysisPanel
        aiAnalysis={{
          status: 'available',
          analysis: {
            beginnerExplanation: {
              summary: '요약',
              sma: '',
              rsi: '',
              macd: '',
              volume: '',
            },
            checklist: {
              trend: createCheck('neutral', '추세 분석'),
              momentum: createCheck('caution', '모멘텀 분석'),
              volume: createCheck('neutral', '거래량 분석'),
              risk: createCheck('negative', '위험 분석'),
            },
            report: {
              headline: '현재 흐름',
              summary: '종합 요약',
              observations: [],
              nextThingsToWatch: [],
              disclaimer: '교육용 분석입니다.',
            },
          },
        }}
      />,
    );

    expect(screen.getByText('추세 분석').closest('article')).toHaveClass('status-neutral');
    expect(screen.getByText('모멘텀 분석').closest('article')).toHaveClass('status-caution');
    expect(screen.getByText('위험 분석').closest('article')).toHaveClass('status-negative');
    expect(screen.getByText('확인 필요')).toBeInTheDocument();
    expect(screen.getAllByText('중립')).toHaveLength(2);
  });
});
