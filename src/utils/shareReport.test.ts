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
    expect(card.aiSummary).toEqual({
      title: '상승 흐름 속 단기 확인이 필요한 구간',
      summary: '추세, 모멘텀, 거래량, 변동성을 함께 보면 장기 흐름은 남아 있지만 단기 확인이 필요한 상태입니다.',
      keyTakeaways: [
        '추세는 장기 평균선과 단기 평균선의 위치를 함께 확인합니다.',
        '모멘텀은 RSI와 MACD가 같은 방향을 가리키는지 봅니다.',
        '거래량 증가는 관심 집중을 뜻할 수 있지만 방향성을 보장하지 않습니다.',
      ],
    });
    expect(card.disclaimer).toBe('교육용 분석이며 투자 조언이 아닙니다.');
  });
});
