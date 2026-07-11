import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GlossaryText } from './GlossaryText';

describe('GlossaryText', () => {
  it('renders known chart terms as accessible glossary controls', () => {
    render(<GlossaryText text="MACD 데드 크로스가 나타나면 모멘텀 변화를 관찰합니다." />);

    const glossaryTerm = screen.getByRole('button', { name: 'MACD 데드 크로스' });

    expect(glossaryTerm).toBeInTheDocument();
    expect(screen.getByText(/MACD선이 signal선 아래로 교차해 내려가는 현상/)).toBeInTheDocument();
  });

  it('renders beginner-friendly finance terms with alternate spellings', () => {
    render(<GlossaryText text="데드크로스와 골든크로스, signal선, histogram, 히스토그램, 저항선을 함께 봅니다." />);

    expect(screen.getByRole('button', { name: '데드크로스' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '골든크로스' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'signal선' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'histogram' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '히스토그램' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저항선' })).toBeInTheDocument();
    expect(screen.getByText(/단기 이동평균선이나 단기 지표가 장기 이동평균선 또는 기준선 아래로 교차/)).toBeInTheDocument();
  });
});
