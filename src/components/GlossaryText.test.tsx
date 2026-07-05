import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GlossaryText } from './GlossaryText';

describe('GlossaryText', () => {
  it('renders known chart terms as accessible glossary controls', () => {
    render(<GlossaryText text="MACD 데드 크로스가 나타나면 모멘텀 변화를 관찰합니다." />);

    const glossaryTerm = screen.getByRole('button', { name: 'MACD 데드 크로스' });

    expect(glossaryTerm).toBeInTheDocument();
    expect(screen.getByText(/단독 판단 근거가 아닙니다/)).toBeInTheDocument();
  });
});
