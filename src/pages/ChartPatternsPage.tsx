import { useMemo, useState } from 'react';

type ChartPatternCategory = 'reversal' | 'continuation' | 'channel' | 'compression';

type ChartPatternType =
  | 'doubleTop'
  | 'doubleBottom'
  | 'headShoulders'
  | 'inverseHeadShoulders'
  | 'ascendingTriangle'
  | 'descendingTriangle'
  | 'rectangleUp'
  | 'rectangleDown'
  | 'risingWedge'
  | 'fallingWedge'
  | 'risingChannelBreak'
  | 'fallingChannelBreak';

type ChartPattern = {
  title: string;
  category: ChartPatternCategory;
  summary: string;
  example: string;
  checkpoints: string[];
  practice: string;
  visualType: ChartPatternType;
};

const categoryLabels: Record<ChartPatternCategory | 'all', string> = {
  all: '전체',
  reversal: '전환 관찰',
  continuation: '횡보/지속',
  channel: '채널 이탈',
  compression: '수렴 구간',
};

const chartPatterns: ChartPattern[] = [
  {
    title: '이중 천장',
    category: 'reversal',
    summary: '비슷한 가격대에서 두 번 고점을 만들고 기준선 아래로 밀리는지 관찰하는 모양입니다.',
    example: '예를 들어 10만 원 부근에서 두 차례 막힌 뒤 중간 저점 아래로 마감하면, 상승 흐름이 약해졌는지 확인할 수 있습니다.',
    checkpoints: ['두 고점이 정확히 같을 필요는 없습니다.', '중간 저점 아래 종가가 나오는지 봅니다.', '두 번째 고점 부근의 거래량 변화를 함께 확인합니다.'],
    practice: '최근 고점 두 개와 그 사이 저점을 차트에 표시해보세요.',
    visualType: 'doubleTop',
  },
  {
    title: '이중 바닥',
    category: 'reversal',
    summary: '비슷한 가격대에서 두 번 저점을 만들고 기준선 위로 회복하는지 보는 모양입니다.',
    example: '8만 원 부근에서 두 번 반등한 뒤 중간 고점 위로 마감하면 하락 압력이 줄었는지 학습용으로 살펴볼 수 있습니다.',
    checkpoints: ['두 저점이 같은 구간에서 반응했는지 봅니다.', '중간 고점을 회복하는지 확인합니다.', '회복 구간의 거래량이 평균보다 커지는지 봅니다.'],
    practice: '최근 차트에서 같은 가격대 반등이 2번 이상 있었는지 찾아보세요.',
    visualType: 'doubleBottom',
  },
  {
    title: '헤드앤숄더',
    category: 'reversal',
    summary: '왼쪽 어깨, 머리, 오른쪽 어깨처럼 세 고점이 만들어진 뒤 목선 이탈 여부를 보는 모양입니다.',
    example: '가운데 고점만 더 높고 양쪽 고점이 낮아지면, 이전 상승 흐름의 힘이 줄었는지 관찰할 수 있습니다.',
    checkpoints: ['가운데 고점이 가장 높은지 확인합니다.', '목선 아래 종가가 나오는지 봅니다.', '오른쪽 어깨가 낮아지는지 살펴봅니다.'],
    practice: '세 고점과 목선을 직접 그어보고, 목선 부근에서 가격이 어떻게 반응했는지 적어보세요.',
    visualType: 'headShoulders',
  },
  {
    title: '역 헤드앤숄더',
    category: 'reversal',
    summary: '왼쪽 어깨, 머리, 오른쪽 어깨가 아래쪽으로 만들어지고 목선 회복을 관찰하는 모양입니다.',
    example: '가운데 저점이 가장 낮고 이후 저점이 높아지면, 하락 흐름이 완화되는 장면인지 확인할 수 있습니다.',
    checkpoints: ['가운데 저점이 가장 낮은지 봅니다.', '목선 위 종가가 나오는지 확인합니다.', '오른쪽 저점이 높아지는지 봅니다.'],
    practice: '최근 저점 3개를 표시하고, 마지막 저점이 이전보다 높아졌는지 확인해보세요.',
    visualType: 'inverseHeadShoulders',
  },
  {
    title: '상승 삼각형',
    category: 'compression',
    summary: '비슷한 저항 구간 아래에서 저점이 점점 높아지는지 보는 수렴 모양입니다.',
    example: '위쪽 가격은 계속 막히지만 아래쪽 반응 가격이 높아지면 매수와 매도 힘이 좁아지는 장면으로 볼 수 있습니다.',
    checkpoints: ['상단 저항선이 비교적 평평한지 봅니다.', '저점이 점점 높아지는지 확인합니다.', '상단 돌파 뒤 다시 그 구간을 지키는지 봅니다.'],
    practice: '저항 구간 하나와 높아지는 저점 2개 이상을 표시해보세요.',
    visualType: 'ascendingTriangle',
  },
  {
    title: '하락 삼각형',
    category: 'compression',
    summary: '비슷한 지지 구간 위에서 고점이 점점 낮아지는지 보는 수렴 모양입니다.',
    example: '아래쪽 가격은 계속 반응하지만 반등 고점이 낮아지면 압력이 아래로 모이는지 관찰할 수 있습니다.',
    checkpoints: ['하단 지지선이 비교적 평평한지 봅니다.', '고점이 점점 낮아지는지 확인합니다.', '하단 이탈 뒤 되돌림 여부를 봅니다.'],
    practice: '평평한 지지선과 낮아지는 고점을 차트에 그려보세요.',
    visualType: 'descendingTriangle',
  },
  {
    title: '상승 직사각형',
    category: 'continuation',
    summary: '상승 후 일정 가격 범위 안에서 쉬어가다가 상단을 회복하는지 보는 횡보 모양입니다.',
    example: '가격이 급히 오른 뒤 일정 박스 안에서 머물면, 다음 방향보다 먼저 박스 상단과 하단 반응을 관찰합니다.',
    checkpoints: ['상단과 하단이 여러 번 반응했는지 봅니다.', '박스 안 거래량이 줄어드는지 확인합니다.', '상단 돌파가 종가로 유지되는지 봅니다.'],
    practice: '최근 횡보 구간의 상단과 하단을 각각 하나씩 표시하세요.',
    visualType: 'rectangleUp',
  },
  {
    title: '하락 직사각형',
    category: 'continuation',
    summary: '하락 후 일정 가격 범위 안에서 머무르다가 하단 이탈 여부를 보는 횡보 모양입니다.',
    example: '하락 이후 박스권이 이어지면, 하단 지지 구간을 계속 지키는지 또는 종가로 이탈하는지 학습합니다.',
    checkpoints: ['하락 이후 박스권이 만들어졌는지 봅니다.', '하단에서 반복 반응이 있는지 확인합니다.', '하단 이탈 시 거래량 변화를 봅니다.'],
    practice: '박스권 하단을 기준으로 이탈한 날이 있는지 찾아보세요.',
    visualType: 'rectangleDown',
  },
  {
    title: '상승 쐐기',
    category: 'compression',
    summary: '가격은 올라가지만 고점과 저점의 폭이 점점 좁아지는지 보는 모양입니다.',
    example: '상승 각도가 유지되는 것처럼 보여도 폭이 좁아지고 힘이 둔해지면, 방향 확인을 서두르지 않고 이탈 여부를 봅니다.',
    checkpoints: ['고점과 저점이 모두 올라가는지 봅니다.', '두 추세선 간격이 좁아지는지 확인합니다.', '하단선 이탈 여부를 종가로 봅니다.'],
    practice: '고점 2개와 저점 2개를 이어 쐐기 폭이 줄어드는지 확인하세요.',
    visualType: 'risingWedge',
  },
  {
    title: '하락 쐐기',
    category: 'compression',
    summary: '가격은 내려가지만 고점과 저점의 폭이 점점 좁아지는지 보는 모양입니다.',
    example: '하락이 이어져도 진폭이 줄어들면 단기 압력이 약해지는지 상단선 회복 여부를 관찰할 수 있습니다.',
    checkpoints: ['고점과 저점이 모두 낮아지는지 봅니다.', '두 추세선 간격이 좁아지는지 확인합니다.', '상단선 회복이 유지되는지 봅니다.'],
    practice: '하락 중 최근 고점들이 낮아지는 속도와 저점들이 낮아지는 속도를 비교해보세요.',
    visualType: 'fallingWedge',
  },
  {
    title: '상승 채널 이탈',
    category: 'channel',
    summary: '우상향 채널 안에서 움직이던 가격이 하단선 아래로 벗어나는지 보는 모양입니다.',
    example: '저점과 고점이 함께 높아지다가 채널 하단을 종가로 이탈하면, 기존 상승 리듬이 깨졌는지 관찰합니다.',
    checkpoints: ['평행에 가까운 상단/하단선을 그립니다.', '하단선 아래 종가가 있는지 봅니다.', '이탈 후 채널 안으로 다시 들어오는지 확인합니다.'],
    practice: '채널 하단선에서 몇 번 반등했는지 세어보세요.',
    visualType: 'risingChannelBreak',
  },
  {
    title: '하락 채널 이탈',
    category: 'channel',
    summary: '우하향 채널 안에서 움직이던 가격이 상단선 위로 벗어나는지 보는 모양입니다.',
    example: '고점과 저점이 함께 낮아지다가 채널 상단 위로 마감하면 하락 리듬 변화 여부를 학습할 수 있습니다.',
    checkpoints: ['평행에 가까운 하락 채널을 그립니다.', '상단선 위 종가가 있는지 확인합니다.', '돌파 이후 다시 채널 안으로 들어오는지 봅니다.'],
    practice: '상단선 위로 올라선 뒤 다음 캔들이 어디에서 마감했는지 확인하세요.',
    visualType: 'fallingChannelBreak',
  },
];

function PatternVisual({ type }: { type: ChartPatternType }) {
  const isRectangle = type === 'rectangleUp' || type === 'rectangleDown';
  const isDown = ['doubleTop', 'headShoulders', 'descendingTriangle', 'rectangleDown', 'risingWedge', 'risingChannelBreak'].includes(type);

  const mainPath: Record<ChartPatternType, string> = {
    doubleTop: 'M24 112 L54 46 L84 92 L116 44 L152 112',
    doubleBottom: 'M24 38 L56 104 L86 58 L118 106 L154 38',
    headShoulders: 'M24 108 L48 58 L72 92 L108 32 L144 92 L172 58 L202 108',
    inverseHeadShoulders: 'M24 42 L50 94 L78 58 L112 116 L148 58 L176 94 L204 42',
    ascendingTriangle: 'M24 112 L56 78 L84 96 L112 62 L142 82 L174 44 L206 56',
    descendingTriangle: 'M24 38 L56 74 L84 52 L116 86 L146 68 L178 100 L210 88',
    rectangleUp: 'M24 112 L46 42 L74 92 L104 44 L132 92 L164 44 L196 92 L224 36',
    rectangleDown: 'M24 38 L46 104 L76 56 L106 102 L136 56 L166 102 L196 58 L224 112',
    risingWedge: 'M24 116 L58 70 L88 96 L120 58 L148 80 L184 48 L216 62',
    fallingWedge: 'M24 36 L58 92 L88 58 L122 102 L152 76 L184 110 L216 94',
    risingChannelBreak: 'M24 110 L56 74 L84 96 L116 60 L146 82 L176 50 L216 104',
    fallingChannelBreak: 'M24 42 L58 80 L88 56 L120 94 L150 72 L180 104 L218 34',
  };

  return (
    <svg className="pattern-visual-svg" viewBox="0 0 240 150" role="img" aria-label={`${type} 차트 흐름 예시`}>
      {type === 'doubleTop' || type === 'doubleBottom' ? <line className="pattern-guide" x1="18" y1={type === 'doubleTop' ? '88' : '62'} x2="170" y2={type === 'doubleTop' ? '88' : '62'} /> : null}
      {type === 'headShoulders' || type === 'inverseHeadShoulders' ? <line className="pattern-guide" x1="28" y1={type === 'headShoulders' ? '94' : '56'} x2="198" y2={type === 'headShoulders' ? '94' : '56'} /> : null}
      {type === 'ascendingTriangle' ? (
        <>
          <line className="pattern-guide" x1="48" y1="48" x2="210" y2="48" />
          <line className="pattern-guide-accent" x1="30" y1="116" x2="210" y2="48" />
        </>
      ) : null}
      {type === 'descendingTriangle' ? (
        <>
          <line className="pattern-guide" x1="30" y1="102" x2="212" y2="102" />
          <line className="pattern-guide-accent" x1="30" y1="38" x2="212" y2="102" />
        </>
      ) : null}
      {isRectangle ? (
        <>
          <line className="pattern-guide" x1="38" y1={type === 'rectangleUp' ? '46' : '56'} x2="204" y2={type === 'rectangleUp' ? '46' : '56'} />
          <line className="pattern-guide" x1="38" y1={type === 'rectangleUp' ? '94' : '104'} x2="204" y2={type === 'rectangleUp' ? '94' : '104'} />
        </>
      ) : null}
      {type === 'risingWedge' ? (
        <>
          <line className="pattern-guide" x1="26" y1="118" x2="220" y2="42" />
          <line className="pattern-guide-accent" x1="26" y1="70" x2="220" y2="58" />
        </>
      ) : null}
      {type === 'fallingWedge' ? (
        <>
          <line className="pattern-guide" x1="26" y1="34" x2="220" y2="96" />
          <line className="pattern-guide-accent" x1="26" y1="98" x2="220" y2="90" />
        </>
      ) : null}
      {type === 'risingChannelBreak' ? (
        <>
          <line className="pattern-guide" x1="26" y1="112" x2="208" y2="48" />
          <line className="pattern-guide" x1="26" y1="76" x2="208" y2="20" />
        </>
      ) : null}
      {type === 'fallingChannelBreak' ? (
        <>
          <line className="pattern-guide" x1="26" y1="36" x2="208" y2="104" />
          <line className="pattern-guide" x1="26" y1="72" x2="208" y2="132" />
        </>
      ) : null}
      <path className={isDown ? 'pattern-price-line pattern-price-caution' : 'pattern-price-line'} d={mainPath[type]} />
      <circle className="pattern-focus-point" cx="204" cy={isDown ? '98' : '42'} r="5" />
    </svg>
  );
}

export function ChartPatternsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ChartPatternCategory | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredPatterns = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return chartPatterns.filter((pattern) => {
      const matchesCategory = selectedCategory === 'all' || pattern.category === selectedCategory;
      const matchesKeyword =
        !keyword ||
        pattern.title.toLowerCase().includes(keyword) ||
        pattern.summary.toLowerCase().includes(keyword) ||
        pattern.example.toLowerCase().includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [searchKeyword, selectedCategory]);

  return (
    <section className="content-section pattern-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">CHART PATTERN MAP</p>
          <h1>차트 흐름도</h1>
          <p>자주 보이는 차트 모양을 그림, 예시, 확인 순서로 정리합니다.</p>
        </div>
      </div>

      <section className="pattern-learning-panel">
        <div>
          <span className="card-label">PATTERN READING</span>
          <h2>모양보다 확인 순서가 먼저입니다</h2>
          <p>
            차트 패턴은 미래를 맞히는 공식이 아니라, 과거 가격이 어떤 구간에서 반복적으로 반응했는지 학습하는 방법입니다.
            각 카드는 기준선, 이탈/회복, 거래량 확인 순서로 읽어보세요.
          </p>
        </div>
        <div className="pattern-flow-steps" aria-label="차트 흐름도 학습 순서">
          <span>모양 찾기</span>
          <span>기준선 표시</span>
          <span>종가 확인</span>
          <span>거래량 비교</span>
        </div>
      </section>

      <div className="glossary-controls">
        <label className="glossary-search">
          <span>패턴 검색</span>
          <input
            type="search"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="예: 이중 천장, 삼각형, 채널"
          />
        </label>
        <div className="glossary-category-tabs" aria-label="차트 패턴 카테고리">
          {(['all', 'reversal', 'continuation', 'channel', 'compression'] as const).map((category) => (
            <button
              type="button"
              className={selectedCategory === category ? 'active' : undefined}
              onClick={() => setSelectedCategory(category)}
              key={category}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>

      <div className="pattern-grid">
        {filteredPatterns.map((pattern) => (
          <article className="pattern-card" key={pattern.title}>
            <div className="pattern-card-visual">
              <PatternVisual type={pattern.visualType} />
            </div>
            <div className="pattern-card-body">
              <span className="pill pill-accent">{categoryLabels[pattern.category]}</span>
              <h2>{pattern.title}</h2>
              <p>{pattern.summary}</p>
              <div className="pattern-example-box">
                <strong>예시</strong>
                <p>{pattern.example}</p>
              </div>
              <div className="pattern-checklist">
                <strong>확인 순서</strong>
                <ul>
                  {pattern.checkpoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
              <div className="pattern-practice">
                <strong>연습 질문</strong>
                <p>{pattern.practice}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredPatterns.length === 0 ? (
        <div className="state-panel">
          <h2>검색 결과가 없습니다.</h2>
          <p>다른 패턴명이나 카테고리로 다시 찾아보세요.</p>
        </div>
      ) : null}
    </section>
  );
}
