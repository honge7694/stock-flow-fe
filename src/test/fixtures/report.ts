import type { ReportResponse } from '../../types/report';

export const sampleReport: ReportResponse = {
  ticker: '000660.KS',
  from: '2026-04-01',
  to: '2026-06-21',
  ai: true,
  generatedAt: '2026-06-21T08:59:44.592Z',
  candles: [
    { time: '2026-06-18', open: 2556000, high: 2738000, low: 2556000, close: 2685000, volume: 5808765 },
    { time: '2026-06-19', open: 2824000, high: 2891000, low: 2688000, close: 2764000, volume: 7478195 },
  ],
  indicators: {
    sma20: [{ time: '2026-06-19', value: 2247700 }],
    sma50: [{ time: '2026-06-19', value: 1738380 }],
    rsi14: [{ time: '2026-06-19', value: 73.715861 }],
    macd: [{ time: '2026-06-19', macd: 234738.331499, signal: 207516.808941, histogram: 27221.522558 }],
    volume: [{ time: '2026-06-19', value: 7478195 }],
  },
  aiAnalysis: {
    status: 'available',
    analysis: {
      beginnerExplanation: {
        summary: '최근 약 2.5개월 동안 주가가 급격히 상승한 흐름을 보이고 있습니다.',
        sma: '현재 주가는 20일선과 50일선보다 위에 위치해 상승 배열을 보여줍니다.',
        rsi: 'RSI는 과매수 구간으로 분류되는 70을 초과했습니다.',
        macd: 'MACD는 상승 모멘텀이 유지되고 있음을 보여줍니다.',
        volume: '거래량이 평균보다 증가하며 상승 흐름을 지지합니다.',
      },
      checklist: {
        trend: { status: 'positive', title: '강한 상승 추세 지속', explanation: '단기/중기적으로 우상향 흐름입니다.' },
        momentum: { status: 'caution', title: '과매수 신호', explanation: '단기 조정 가능성에 대비해야 합니다.' },
        volume: { status: 'positive', title: '평균 대비 높은 거래량', explanation: '거래량이 상승 흐름을 지지합니다.' },
        risk: { status: 'caution', title: '높은 변동성', explanation: '급격한 가격 변동 위험이 있습니다.' },
      },
      report: {
        headline: '단기 급등세 속 과열 신호 감지',
        summary: '강한 상승 추세와 과매수 신호가 동시에 관찰됩니다.',
        observations: ['주가가 분석 기간 동안 크게 상승했습니다.', 'RSI가 70을 상회합니다.'],
        nextThingsToWatch: ['20일 이동평균선 지지 여부', '거래량 유지 여부'],
        disclaimer: '본 분석은 교육용 자료이며 투자 권유가 아닙니다.',
      },
    },
  },
};
