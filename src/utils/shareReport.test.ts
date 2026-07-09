import { describe, expect, it } from 'vitest';
import { sampleReport } from '../test/fixtures/report';
import { buildShareReportCard } from './shareReport';

describe('buildShareReportCard', () => {
  it('builds a compact educational report card model', () => {
    const card = buildShareReportCard(sampleReport, sampleReport.payload!);

    expect(card.title).toBe('000660.KS 분석 리포트');
    expect(card.period).toBe('2026-04-01 - 2026-06-21');
    expect(card.metrics).toEqual(
      expect.arrayContaining([
        { label: '최근 종가', value: '2,764,000' },
        { label: '기간 변화율', value: '2.94%' },
        { label: 'RSI 14', value: '73.72' },
      ]),
    );
    expect(card.disclaimer).toBe('교육용 분석이며 투자 조언이 아닙니다.');
  });
});
