import { useMemo, useState } from 'react';

type GlossaryCategory = 'chart' | 'indicator' | 'pattern' | 'risk';

type GlossaryVisualType =
  | 'candles'
  | 'goldenCross'
  | 'deadCross'
  | 'rsi'
  | 'macd'
  | 'volume'
  | 'supportResistance'
  | 'volatility';

type GlossaryItem = {
  term: string;
  category: GlossaryCategory;
  plainDefinition: string;
  example: string;
  watchPoints: string[];
  visualType: GlossaryVisualType;
};

const categoryLabels: Record<GlossaryCategory | 'all', string> = {
  all: '전체',
  chart: '차트 기본',
  indicator: '보조 지표',
  pattern: '흐름 표현',
  risk: '변동성',
};

const glossaryItems: GlossaryItem[] = [
  {
    term: '캔들',
    category: 'chart',
    plainDefinition:
      '하루 또는 한 기간의 시가, 고가, 저가, 종가를 한 번에 보여주는 차트 표시입니다. 몸통은 시가와 종가의 차이, 위아래 꼬리는 움직인 가격 범위를 나타냅니다.',
    example:
      '예를 들어 아침에 100으로 시작해 장중 108까지 올랐다가 98까지 내려갔고, 마지막에 105로 끝났다면 캔들은 100, 108, 98, 105를 한 막대 안에 담습니다.',
    watchPoints: ['몸통이 길면 시작가와 끝가격 차이가 컸다는 뜻입니다.', '꼬리가 길면 장중 가격 흔들림이 컸다는 뜻입니다.'],
    visualType: 'candles',
  },
  {
    term: '이동평균선',
    category: 'indicator',
    plainDefinition:
      '정해진 기간의 평균 가격을 선으로 이은 것입니다. 가격의 하루하루 흔들림을 줄이고 큰 흐름을 보기 쉽게 만듭니다.',
    example:
      'SMA20은 최근 20개 기간의 평균 가격입니다. 가격이 SMA20 위에 오래 머무르면 최근 가격이 20기간 평균보다 높게 형성되고 있다는 뜻입니다.',
    watchPoints: ['짧은 평균선은 빠르게 반응하고, 긴 평균선은 천천히 반응합니다.', '가격과 평균선의 거리도 흐름의 속도를 보는 단서가 됩니다.'],
    visualType: 'goldenCross',
  },
  {
    term: '골든 크로스',
    category: 'pattern',
    plainDefinition:
      '단기 이동평균선이나 단기 지표가 장기 이동평균선 또는 기준선 위로 교차해 올라가는 현상입니다. 보통 단기 흐름이 장기 흐름보다 강해졌다는 의미로 해석됩니다.',
    example:
      '20일 이동평균선이 50일 이동평균선 아래에 있다가 위로 올라서면 골든 크로스라고 부릅니다. 단기 가격 평균이 장기 평균보다 빠르게 개선된 장면입니다.',
    watchPoints: ['교차 직후보다 교차 이후 흐름이 유지되는지 함께 봅니다.', '거래량 증가가 동반되면 시장 참여가 커졌는지 확인할 수 있습니다.'],
    visualType: 'goldenCross',
  },
  {
    term: '데드 크로스',
    category: 'pattern',
    plainDefinition:
      '단기 이동평균선이나 단기 지표가 장기 이동평균선 또는 기준선 아래로 교차해 내려가는 현상입니다. 보통 단기 흐름이 장기 흐름보다 약해졌다는 의미로 해석됩니다.',
    example:
      '20일 이동평균선이 50일 이동평균선 위에 있다가 아래로 내려서면 데드 크로스라고 부릅니다. 최근 평균 가격이 장기 평균보다 약해진 장면입니다.',
    watchPoints: ['일시적인 교차인지, 며칠 동안 유지되는지 확인합니다.', '가격이 주요 지지선 근처인지 함께 보면 흐름을 더 입체적으로 볼 수 있습니다.'],
    visualType: 'deadCross',
  },
  {
    term: 'RSI',
    category: 'indicator',
    plainDefinition:
      '최근 상승폭과 하락폭을 비교해 가격 움직임의 상대적 강도를 0부터 100까지 나타내는 지표입니다.',
    example:
      'RSI가 75라면 최근 기간 동안 상승 움직임이 하락 움직임보다 강했다는 뜻입니다. RSI가 25라면 반대로 하락 움직임이 강했다는 뜻입니다.',
    watchPoints: ['70 이상은 과매수, 30 이하는 과매도로 보는 경우가 많습니다.', '강한 추세에서는 RSI가 오래 높은 구간 또는 낮은 구간에 머물 수 있습니다.'],
    visualType: 'rsi',
  },
  {
    term: 'MACD',
    category: 'indicator',
    plainDefinition:
      '단기 지수이동평균과 장기 지수이동평균의 차이를 이용해 가격 흐름의 방향과 힘 변화를 보는 보조 지표입니다.',
    example:
      'MACD선이 signal선 위로 올라가면 단기 흐름이 개선되는 장면으로, 아래로 내려가면 단기 흐름이 약해지는 장면으로 해석할 수 있습니다.',
    watchPoints: ['MACD선, signal선, histogram을 함께 봅니다.', '0선 위아래 위치는 전체 흐름의 강약을 이해하는 데 도움이 됩니다.'],
    visualType: 'macd',
  },
  {
    term: '히스토그램',
    category: 'indicator',
    plainDefinition:
      'MACD선과 signal선의 차이를 막대로 표현한 값입니다. 0보다 크면 MACD선이 signal선 위에 있고, 0보다 작으면 아래에 있다는 뜻입니다.',
    example:
      '히스토그램 막대가 음수에서 점점 0에 가까워지면 하락 쪽 힘이 줄어드는 장면일 수 있습니다. 반대로 양수 막대가 커지면 상승 쪽 힘이 강해지는 장면일 수 있습니다.',
    watchPoints: ['막대의 방향 전환은 흐름 변화의 초기 신호가 될 수 있습니다.', '막대 크기가 줄어드는지 커지는지 연속적으로 확인합니다.'],
    visualType: 'macd',
  },
  {
    term: '거래량',
    category: 'chart',
    plainDefinition:
      '해당 기간에 실제로 거래된 주식 수입니다. 가격 움직임과 함께 보면 그 움직임에 얼마나 많은 참여가 있었는지 이해할 수 있습니다.',
    example:
      '가격이 오르는데 거래량도 평소보다 크게 늘었다면 많은 참여자가 그 움직임에 들어온 장면입니다. 가격은 올랐지만 거래량이 적다면 움직임의 힘을 다시 확인해야 합니다.',
    watchPoints: ['평균 거래량보다 얼마나 많은지 비교합니다.', '큰 가격 변화가 있던 날의 거래량을 함께 확인합니다.'],
    visualType: 'volume',
  },
  {
    term: '지지선과 저항선',
    category: 'chart',
    plainDefinition:
      '지지선은 가격이 내려오다가 반응할 수 있는 구간이고, 저항선은 가격이 올라가다가 주춤할 수 있는 구간입니다. 둘 다 고정된 가격이 아니라 관찰 구간입니다.',
    example:
      '주가가 50,000원 근처에서 여러 번 멈추고 다시 올라갔다면 그 부근을 지지 구간으로 볼 수 있습니다. 60,000원 근처에서 여러 번 막혔다면 저항 구간으로 볼 수 있습니다.',
    watchPoints: ['정확한 한 가격보다 구간으로 보는 편이 자연스럽습니다.', '지지선이 깨지거나 저항선을 넘은 뒤 다시 그 구간을 확인하는 경우가 많습니다.'],
    visualType: 'supportResistance',
  },
  {
    term: '변동성',
    category: 'risk',
    plainDefinition:
      '가격이 흔들리는 정도입니다. 변동성이 크면 같은 기간 안에서도 고가와 저가의 차이가 크게 벌어질 수 있습니다.',
    example:
      '어떤 종목이 하루에 1% 정도 움직이다가 갑자기 8%씩 움직인다면 변동성이 커진 상태입니다. 이때는 차트 해석도 더 조심스럽게 해야 합니다.',
    watchPoints: ['최근 캔들의 길이와 꼬리가 길어졌는지 봅니다.', '변동성이 커지면 손익 범위도 함께 커질 수 있습니다.'],
    visualType: 'volatility',
  },
  {
    term: '과매수와 과매도',
    category: 'risk',
    plainDefinition:
      '과매수는 가격이나 지표가 단기간에 많이 올라 상승 압력이 과도하게 커진 상태이고, 과매도는 단기간에 많이 내려 하락 압력이 과도하게 커진 상태입니다.',
    example:
      'RSI가 75라면 과매수 구간으로 보는 경우가 많고, RSI가 25라면 과매도 구간으로 보는 경우가 많습니다. 다만 강한 추세에서는 해당 구간이 오래 유지될 수 있습니다.',
    watchPoints: ['과매수는 바로 하락한다는 뜻이 아닙니다.', '과매도는 바로 상승한다는 뜻이 아닙니다. 가격 흐름과 함께 확인합니다.'],
    visualType: 'rsi',
  },
  {
    term: '돌파와 이탈',
    category: 'pattern',
    plainDefinition:
      '돌파는 가격이 관찰하던 저항선이나 기준선 위로 올라서는 상황이고, 이탈은 가격이 지지선이나 기준선 아래로 내려가는 상황입니다.',
    example:
      '60,000원 근처에서 여러 번 막히던 가격이 거래량과 함께 62,000원으로 올라서면 저항선 돌파로 볼 수 있습니다. 반대로 50,000원 지지 구간 아래로 내려가면 지지선 이탈로 볼 수 있습니다.',
    watchPoints: ['돌파나 이탈 뒤에 다시 기준 구간으로 돌아오는지 확인합니다.', '거래량이 함께 늘었는지 보면 움직임의 강도를 이해하는 데 도움이 됩니다.'],
    visualType: 'supportResistance',
  },
  {
    term: 'ATR',
    category: 'risk',
    plainDefinition:
      'ATR은 일정 기간의 실제 가격 변동 범위를 평균한 지표입니다. 방향을 알려주는 값이 아니라 최근 가격이 얼마나 크게 흔들렸는지 보여줍니다.',
    example:
      '현재가가 50,000원이고 ATR(14)이 1,500원이라면 최근 14기간의 하루 변동 범위가 평균적으로 약 1,500원이었다는 뜻입니다.',
    watchPoints: ['ATR이 커지면 최근 가격 흔들림이 확대된 상태입니다.', '종목별 가격 단위가 다르므로 ATR 비율도 함께 비교합니다.'],
    visualType: 'volatility',
  },
  {
    term: '최대 낙폭(MDD)',
    category: 'risk',
    plainDefinition:
      '선택 기간의 고점에서 이후 저점까지 가장 크게 내려간 비율입니다. 수익률과 별도로 과거에 경험한 하락 깊이를 이해하는 지표입니다.',
    example:
      '기간 중 100,000원까지 올랐다가 75,000원까지 내려갔다면 해당 구간의 낙폭은 -25%입니다.',
    watchPoints: ['계산을 시작한 기간에 따라 값이 달라집니다.', '현재 낙폭과 최대 낙폭을 구분해 봅니다.'],
    visualType: 'volatility',
  },
  {
    term: '연율화 변동성',
    category: 'risk',
    plainDefinition:
      '일별 수익률의 흔들림을 1년 기준으로 환산한 값입니다. 값이 높을수록 과거 수익률 변화 폭이 컸다는 뜻입니다.',
    example:
      '20일 연율화 변동성이 35%라면 최근 20거래일의 흔들림을 연간 단위로 환산했을 때 변동성이 크게 나타난 상태입니다.',
    watchPoints: ['예상 수익률이 아니라 과거 흔들림의 크기입니다.', '계산 기간이 달라지면 값도 달라질 수 있습니다.'],
    visualType: 'volatility',
  },
  {
    term: '다이버전스',
    category: 'indicator',
    plainDefinition:
      '가격의 고점이나 저점 방향과 RSI·MACD 같은 지표의 방향이 서로 다르게 움직이는 현상입니다.',
    example:
      '가격은 이전보다 높은 고점을 만들었지만 RSI 고점은 낮아졌다면 상승 속도가 둔해지는지 추가로 관찰하는 장면입니다.',
    watchPoints: ['다이버전스만으로 방향 전환이 확정되지는 않습니다.', '가격 기준선과 거래량 변화를 함께 확인합니다.'],
    visualType: 'macd',
  },
  {
    term: '갭',
    category: 'chart',
    plainDefinition:
      '이전 기간의 가격 범위와 다음 기간의 가격 범위 사이에 거래 흔적이 비어 있는 구간입니다.',
    example:
      '전날 고가가 50,000원이었는데 다음 날 저가가 52,000원에서 시작하면 50,000원과 52,000원 사이에 상승 갭이 생긴 것입니다.',
    watchPoints: ['실적 발표나 시장 뉴스 뒤에 나타날 수 있습니다.', '갭이 유지되는지 다시 채워지는지 시간 흐름으로 관찰합니다.'],
    visualType: 'candles',
  },
  {
    term: '리테스트',
    category: 'pattern',
    plainDefinition:
      '가격이 기준선을 돌파하거나 이탈한 뒤 다시 같은 구간으로 돌아와 지지 또는 저항 반응을 확인하는 과정입니다.',
    example:
      '60,000원 저항선을 넘어선 뒤 다시 60,000원 근처로 내려왔지만 종가가 그 위에서 유지되면 돌파 구간을 재확인한 장면으로 볼 수 있습니다.',
    watchPoints: ['기준선을 정확한 한 가격보다 구간으로 봅니다.', '재확인 뒤 종가와 거래량이 어떻게 변하는지 확인합니다.'],
    visualType: 'supportResistance',
  },
  {
    term: '손익비',
    category: 'risk',
    plainDefinition:
      '관찰 시나리오에서 감수할 수 있는 하락 범위와 확인하려는 상승 범위를 비교한 비율입니다.',
    example:
      '하락 관찰 범위를 1,000원, 상승 관찰 범위를 2,000원으로 정했다면 손실 범위 대비 상승 범위는 1대 2입니다.',
    watchPoints: ['실제 결과를 보장하는 비율이 아닙니다.', '변동성이 커지면 기준 가격 사이의 간격도 다시 검토합니다.'],
    visualType: 'supportResistance',
  },
  {
    term: '포지션 사이징',
    category: 'risk',
    plainDefinition:
      '전체 자금과 감수 가능한 변동 범위를 고려해 한 종목에 배정할 수량을 계산하는 과정입니다.',
    example:
      '같은 금액을 사용하더라도 하루 변동 폭이 큰 종목은 작은 종목보다 수량을 줄여 전체 평가금액의 흔들림을 조절할 수 있습니다.',
    watchPoints: ['종목 가격뿐 아니라 수량과 변동 폭을 함께 계산합니다.', 'ATR은 과거 변동 폭 참고값이며 미래 손실 한도가 아닙니다.'],
    visualType: 'volume',
  },
];

function GlossaryVisual({ type }: { type: GlossaryVisualType }) {
  if (type === 'candles') {
    return (
      <svg className="glossary-visual-svg" viewBox="0 0 240 132" role="img" aria-label="캔들 예시 이미지">
        <line x1="30" y1="22" x2="30" y2="108" />
        <rect x="20" y="46" width="20" height="42" className="visual-up" />
        <line x1="82" y1="18" x2="82" y2="96" />
        <rect x="72" y="34" width="20" height="38" className="visual-down" />
        <line x1="134" y1="34" x2="134" y2="116" />
        <rect x="124" y="56" width="20" height="36" className="visual-up" />
        <line x1="186" y1="24" x2="186" y2="100" />
        <rect x="176" y="44" width="20" height="26" className="visual-up" />
      </svg>
    );
  }

  if (type === 'goldenCross' || type === 'deadCross') {
    const isGolden = type === 'goldenCross';
    return (
      <svg className="glossary-visual-svg" viewBox="0 0 240 132" role="img" aria-label={`${isGolden ? '골든 크로스' : '데드 크로스'} 예시 이미지`}>
        <path className="visual-long-line" d={isGolden ? 'M16 88 C72 78, 120 70, 224 44' : 'M16 44 C72 54, 120 62, 224 88'} />
        <path className="visual-short-line" d={isGolden ? 'M16 104 C76 98, 112 76, 224 26' : 'M16 26 C76 34, 112 58, 224 106'} />
        <circle className="visual-cross-point" cx="118" cy="66" r="5" />
        <text x="18" y="120">단기선</text>
        <text x="166" y="120">장기선</text>
      </svg>
    );
  }

  if (type === 'rsi') {
    return (
      <svg className="glossary-visual-svg" viewBox="0 0 240 132" role="img" aria-label="RSI 예시 이미지">
        <line className="visual-guide" x1="16" y1="32" x2="224" y2="32" />
        <line className="visual-guide" x1="16" y1="96" x2="224" y2="96" />
        <path className="visual-short-line" d="M18 88 C42 70, 58 68, 76 42 S116 24, 132 54 S172 102, 220 58" />
        <text x="18" y="26">70</text>
        <text x="18" y="112">30</text>
      </svg>
    );
  }

  if (type === 'macd') {
    return (
      <svg className="glossary-visual-svg" viewBox="0 0 240 132" role="img" aria-label="MACD 예시 이미지">
        <line className="visual-guide" x1="16" y1="68" x2="224" y2="68" />
        {[32, 58, 84, 110, 136, 162, 188].map((x, index) => (
          <rect
            className={index < 3 ? 'visual-down' : 'visual-up'}
            height={index < 3 ? 18 + index * 6 : 36 - index * 3}
            key={x}
            width="12"
            x={x}
            y={index < 3 ? 68 : 68 - (36 - index * 3)}
          />
        ))}
        <path className="visual-short-line" d="M20 82 C62 92, 92 78, 126 54 S184 38, 222 48" />
        <path className="visual-long-line" d="M20 76 C64 80, 96 72, 128 62 S184 48, 222 54" />
      </svg>
    );
  }

  if (type === 'volume') {
    return (
      <svg className="glossary-visual-svg" viewBox="0 0 240 132" role="img" aria-label="거래량 예시 이미지">
        {[22, 48, 74, 100, 126, 152, 178, 204].map((x, index) => (
          <rect className="visual-volume" height={[30, 38, 28, 72, 46, 82, 44, 64][index]} key={x} width="16" x={x} y={106 - [30, 38, 28, 72, 46, 82, 44, 64][index]} />
        ))}
        <path className="visual-short-line" d="M18 72 C54 64, 82 76, 112 54 S178 36, 222 44" />
      </svg>
    );
  }

  if (type === 'supportResistance') {
    return (
      <svg className="glossary-visual-svg" viewBox="0 0 240 132" role="img" aria-label="지지선과 저항선 예시 이미지">
        <line className="visual-resistance" x1="16" y1="34" x2="224" y2="34" />
        <line className="visual-support" x1="16" y1="98" x2="224" y2="98" />
        <path className="visual-short-line" d="M18 92 C48 62, 76 44, 102 72 S156 112, 184 84 S204 42, 224 36" />
        <text x="156" y="28">저항</text>
        <text x="160" y="116">지지</text>
      </svg>
    );
  }

  return (
    <svg className="glossary-visual-svg" viewBox="0 0 240 132" role="img" aria-label="변동성 예시 이미지">
      <path className="visual-muted-line" d="M18 72 C52 68, 80 76, 112 70 S172 74, 222 66" />
      <path className="visual-short-line" d="M18 96 C42 22, 68 118, 94 34 S146 110, 172 24 S206 116, 224 54" />
      <text x="18" y="120">작은 흔들림</text>
      <text x="136" y="120">큰 흔들림</text>
    </svg>
  );
}

export function GlossaryPage() {
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredItems = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return glossaryItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesKeyword =
        !keyword ||
        item.term.toLowerCase().includes(keyword) ||
        item.plainDefinition.toLowerCase().includes(keyword) ||
        item.example.toLowerCase().includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [searchKeyword, selectedCategory]);

  return (
    <section className="glossary-page">
      <div className="page-title-row glossary-title-row">
        <div>
          <p className="eyebrow">STOCK TERMS</p>
          <h1>주식 용어집</h1>
          <p>리포트에서 자주 보이는 차트 용어를 그림과 예시로 확인합니다.</p>
        </div>
      </div>

      <div className="glossary-learning-panel">
        <div>
          <span className="card-label">읽는 방법</span>
          <h2>용어를 실제 차트 장면으로 연결하세요</h2>
          <p>
            용어는 외우는 것보다 “차트에서 어떤 모양인지”, “어떤 숫자가 변했는지”를 같이 보는 편이 이해하기 쉽습니다.
            각 카드는 정의, 예시, 확인 포인트 순서로 구성했습니다.
          </p>
        </div>
        <div className="glossary-mini-guide" aria-label="용어집 사용 안내">
          <span>1. 용어 검색</span>
          <span>2. 예시 그림 확인</span>
          <span>3. 리포트 문장에 적용</span>
        </div>
      </div>

      <div className="glossary-controls">
        <label className="glossary-search">
          <span>용어 검색</span>
          <input
            type="search"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="예: 골든 크로스, RSI, 거래량"
          />
        </label>
        <div className="glossary-category-tabs" aria-label="용어 카테고리">
          {(['all', 'chart', 'indicator', 'pattern', 'risk'] as const).map((category) => (
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

      <div className="glossary-grid">
        {filteredItems.map((item) => (
          <article className="glossary-card" key={item.term}>
            <div className="glossary-card-visual">
              <GlossaryVisual type={item.visualType} />
            </div>
            <div className="glossary-card-body">
              <span className="pill">{categoryLabels[item.category]}</span>
              <h2>{item.term}</h2>
              <p>{item.plainDefinition}</p>
              <div className="glossary-example-box">
                <strong>예시</strong>
                <p>{item.example}</p>
              </div>
              <div className="glossary-watch-list">
                <strong>확인 포인트</strong>
                <ul>
                  {item.watchPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="state-panel">
          <h2>검색 결과가 없습니다.</h2>
          <p>다른 용어나 카테고리로 다시 찾아보세요.</p>
        </div>
      ) : null}
    </section>
  );
}
