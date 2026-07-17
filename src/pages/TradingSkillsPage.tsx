import { useMemo, useState } from 'react';

type SkillCategory = 'price' | 'confirmation' | 'indicator' | 'risk';
type SkillVisualType =
  | 'trendPullback'
  | 'supportBreak'
  | 'volumeConfirm'
  | 'riskPlan'
  | 'multiTimeframe'
  | 'breakoutRetest'
  | 'divergence'
  | 'positionSize';

type TradingSkill = {
  title: string;
  category: SkillCategory;
  intent: string;
  example: string;
  checklist: string[];
  practice: string;
  visualType: SkillVisualType;
};

const categoryLabels: Record<SkillCategory | 'all', string> = {
  all: '전체',
  price: '가격 흐름',
  confirmation: '확인 절차',
  indicator: '지표 조합',
  risk: '위험 관리',
};

const tradingSkills: TradingSkill[] = [
  {
    title: '추세와 눌림 구분하기',
    category: 'price',
    intent: '가격이 계속 같은 방향으로 움직이는지, 잠깐 쉬어가는 구간인지 구분하는 연습입니다.',
    example:
      '가격이 SMA20 위에서 움직이다가 잠시 평균선 근처로 내려온 뒤 다시 회복하면, 장기 방향은 유지되면서 단기 조정이 나타난 장면으로 볼 수 있습니다.',
    checklist: ['가격이 SMA20, SMA50 위아래 어디에 있는지 확인합니다.', '평균선 기울기가 완만히 유지되는지 봅니다.', '조정 구간의 거래량이 과도하게 커졌는지 확인합니다.'],
    practice: '최근 캔들 10개 중 종가가 SMA20 아래에 머문 날이 몇 번인지 세어보세요.',
    visualType: 'trendPullback',
  },
  {
    title: '지지선 이탈 확인하기',
    category: 'confirmation',
    intent: '가격이 반복해서 반응하던 구간 아래로 내려갔는지 확인하는 연습입니다.',
    example:
      '50,000원 근처에서 여러 번 반등하던 종목이 큰 거래량과 함께 49,000원 아래에서 마감하면 지지 구간 이탈 가능성을 관찰할 수 있습니다.',
    checklist: ['한 번의 장중 하락이 아니라 종가 기준으로 확인합니다.', '이탈 이후 다시 같은 구간을 회복하는지 봅니다.', '거래량이 평균 대비 크게 늘었는지 함께 봅니다.'],
    practice: '차트에서 최근 2번 이상 반응한 가격 구간을 하나 표시하고, 그 아래에서 마감한 날이 있는지 찾아보세요.',
    visualType: 'supportBreak',
  },
  {
    title: '거래량으로 움직임 확인하기',
    category: 'confirmation',
    intent: '가격 변화가 얼마나 많은 거래와 함께 나타났는지 확인하는 연습입니다.',
    example:
      '가격이 저항 구간 위로 올라갔는데 거래량이 평균보다 낮다면, 움직임이 유지되는지 더 확인해야 합니다. 반대로 평균보다 큰 거래량이 동반되면 참여가 커진 장면으로 볼 수 있습니다.',
    checklist: ['가격 변화가 큰 날의 거래량을 평균 거래량과 비교합니다.', '상승일과 하락일 중 어느 쪽에서 거래량이 더 커지는지 봅니다.', '거래량 증가는 방향을 보장하지 않는다는 점을 기억합니다.'],
    practice: '최근 가장 거래량이 컸던 날의 캔들이 상승 캔들인지 하락 캔들인지 확인해보세요.',
    visualType: 'volumeConfirm',
  },
  {
    title: '변동성 구간에서 기준 세우기',
    category: 'risk',
    intent: '가격 흔들림이 커질 때 수치와 기준을 먼저 정리하는 연습입니다.',
    example:
      '최근 캔들의 고가와 저가 차이가 평소보다 커지고 RSI가 빠르게 움직이면, 해석을 서두르기보다 평균 단가, 현재가, 주요 평균선 위치를 먼저 정리합니다.',
    checklist: ['최근 캔들의 몸통과 꼬리가 길어졌는지 봅니다.', '평균 단가와 현재가의 거리를 확인합니다.', '하나의 지표보다 가격, 거래량, 평균선을 함께 봅니다.'],
    practice: '현재가가 평균 단가에서 몇 퍼센트 떨어져 있는지 계산하고, SMA20과 SMA50 위치를 함께 적어보세요.',
    visualType: 'riskPlan',
  },
  {
    title: '여러 시간 단위 함께 보기',
    category: 'price',
    intent: '주간 흐름과 일간 흐름처럼 서로 다른 시간 단위를 비교해 큰 방향과 짧은 흔들림을 구분하는 연습입니다.',
    example:
      '주간 차트의 SMA20은 우상향하지만 일간 차트가 SMA20 아래로 잠시 내려왔다면, 큰 흐름 안의 단기 조정인지 확인할 수 있습니다.',
    checklist: ['먼저 더 긴 시간 단위의 고점과 저점을 봅니다.', '짧은 시간 단위가 큰 흐름과 같은 방향인지 확인합니다.', '시간 단위마다 기준선을 따로 표시합니다.'],
    practice: '같은 종목의 주간 차트와 일간 차트에서 최근 고점·저점 방향을 각각 적어보세요.',
    visualType: 'multiTimeframe',
  },
  {
    title: '돌파 뒤 재확인 구간 보기',
    category: 'confirmation',
    intent: '기준선을 넘어선 뒤 다시 같은 가격대로 돌아왔을 때 지지 또는 저항 반응을 확인하는 연습입니다.',
    example:
      '60,000원 저항선을 넘어선 뒤 다시 그 부근까지 내려왔지만 종가가 60,000원 위에서 유지되면 돌파 구간을 재확인한 장면입니다.',
    checklist: ['돌파 전 여러 번 반응한 기준선인지 봅니다.', '재확인 구간의 종가 위치를 확인합니다.', '거래량이 돌파 때와 재확인 때 어떻게 달라졌는지 봅니다.'],
    practice: '최근 돌파 구간 하나를 찾고 돌파일과 재확인일의 거래량을 비교해보세요.',
    visualType: 'breakoutRetest',
  },
  {
    title: '가격과 지표의 엇갈림 관찰하기',
    category: 'indicator',
    intent: '가격 고점·저점과 RSI 또는 MACD 고점·저점이 다른 방향으로 움직이는지 확인하는 연습입니다.',
    example:
      '가격은 이전보다 높은 고점을 만들었지만 RSI 고점은 낮아졌다면 상승 속도가 둔해지는 장면인지 기준선과 함께 관찰합니다.',
    checklist: ['비교할 가격 고점 또는 저점 두 개를 정합니다.', '같은 시점의 지표 고점 또는 저점을 연결합니다.', '다이버전스만으로 방향 전환을 확정하지 않습니다.'],
    practice: '최근 가격 고점 두 개와 RSI 고점 두 개의 기울기가 같은 방향인지 비교해보세요.',
    visualType: 'divergence',
  },
  {
    title: '변동 폭으로 수량 비교하기',
    category: 'risk',
    intent: '가격과 수량, ATR을 함께 사용해 보유금액이 어느 정도 흔들릴 수 있었는지 비교하는 연습입니다.',
    example:
      'ATR이 1,500원인 종목 10주는 과거 변동 폭 기준 약 15,000원의 평가금액 움직임이 나타날 수 있었던 것으로 계산합니다.',
    checklist: ['ATR이 방향 예측값이 아니라 과거 변동 폭인지 확인합니다.', 'ATR에 수량을 곱해 금액 단위로 바꿉니다.', '전체 보유금액에서 차지하는 비중과 함께 봅니다.'],
    practice: '관심 종목 두 개의 ATR 비율과 같은 금액 보유 시 예상되는 수량 차이를 계산해보세요.',
    visualType: 'positionSize',
  },
];

function SkillVisual({ type }: { type: SkillVisualType }) {
  if (type === 'trendPullback') {
    return (
      <svg className="skill-visual-svg" viewBox="0 0 280 150" role="img" aria-label="추세와 눌림 예시">
        <path className="skill-line-muted" d="M24 112 C74 98, 118 82, 256 42" />
        <path className="skill-line-accent" d="M24 106 C62 80, 88 64, 120 78 S176 92, 212 58 S238 42, 256 34" />
        <circle cx="142" cy="82" r="6" className="skill-point" />
        <text x="114" y="126">평균선 근처 눌림</text>
      </svg>
    );
  }

  if (type === 'supportBreak') {
    return (
      <svg className="skill-visual-svg" viewBox="0 0 280 150" role="img" aria-label="지지선 이탈 예시">
        <line className="skill-line-support" x1="24" y1="92" x2="256" y2="92" />
        <path className="skill-line-accent" d="M24 80 C54 54, 82 96, 112 72 S158 96, 184 76 S224 88, 256 118" />
        <circle cx="242" cy="112" r="6" className="skill-point-danger" />
        <text x="24" y="128">종가 기준 이탈 확인</text>
      </svg>
    );
  }

  if (type === 'volumeConfirm') {
    return (
      <svg className="skill-visual-svg" viewBox="0 0 280 150" role="img" aria-label="거래량 확인 예시">
        <path className="skill-line-accent" d="M24 96 C70 88, 100 92, 132 72 S190 44, 256 38" />
        {[34, 62, 90, 118, 146, 174, 202, 230].map((x, index) => (
          <rect
            className={index > 4 ? 'skill-volume-hot' : 'skill-volume'}
            height={[26, 34, 28, 38, 44, 72, 82, 68][index]}
            key={x}
            width="14"
            x={x}
            y={126 - [26, 34, 28, 38, 44, 72, 82, 68][index]}
          />
        ))}
      </svg>
    );
  }

  if (type === 'multiTimeframe') {
    return (
      <svg className="skill-visual-svg" viewBox="0 0 280 150" role="img" aria-label="여러 시간 단위 비교 예시">
        <path className="skill-line-muted" d="M24 110 C82 94, 142 70, 256 34" />
        <path className="skill-line-accent" d="M24 104 C54 76, 82 92, 112 64 S164 88, 194 54 S232 62, 256 40" />
        <line className="skill-line-support" x1="24" y1="118" x2="256" y2="118" />
        <text x="26" y="138">큰 흐름 안에서 짧은 움직임 비교</text>
      </svg>
    );
  }

  if (type === 'breakoutRetest') {
    return (
      <svg className="skill-visual-svg" viewBox="0 0 280 150" role="img" aria-label="돌파 뒤 재확인 예시">
        <line className="skill-line-support" x1="24" y1="82" x2="256" y2="82" />
        <path className="skill-line-accent" d="M24 110 C62 96, 90 102, 122 78 S168 38, 194 56 S216 84, 256 44" />
        <circle cx="210" cy="80" r="6" className="skill-point" />
        <text x="154" y="124">돌파 구간 재확인</text>
      </svg>
    );
  }

  if (type === 'divergence') {
    return (
      <svg className="skill-visual-svg" viewBox="0 0 280 150" role="img" aria-label="가격과 지표 다이버전스 예시">
        <path className="skill-line-accent" d="M24 88 C64 72, 92 82, 124 50 S190 60, 250 28" />
        <path className="skill-line-muted" d="M24 122 C70 104, 98 110, 130 86 S194 96, 250 102" />
        <line className="skill-line-support" x1="126" y1="50" x2="250" y2="28" />
        <line className="skill-line-support" x1="130" y1="86" x2="250" y2="102" />
      </svg>
    );
  }

  if (type === 'positionSize') {
    return (
      <svg className="skill-visual-svg" viewBox="0 0 280 150" role="img" aria-label="변동 폭과 수량 비교 예시">
        <rect className="skill-volume" x="42" y="42" width="54" height="76" />
        <rect className="skill-volume-hot" x="164" y="74" width="54" height="44" />
        <text x="48" y="34">큰 변동 폭</text>
        <text x="168" y="66">작은 수량</text>
        <line className="skill-line-support" x1="24" y1="118" x2="256" y2="118" />
      </svg>
    );
  }

  return (
    <svg className="skill-visual-svg" viewBox="0 0 280 150" role="img" aria-label="변동성 기준 예시">
      <path className="skill-line-muted" d="M24 74 C72 70, 104 76, 144 72 S210 78, 256 68" />
      <path className="skill-line-accent" d="M24 104 C52 34, 82 116, 112 42 S164 126, 196 36 S232 112, 256 58" />
      <line className="skill-line-support" x1="32" y1="118" x2="248" y2="118" />
      <text x="32" y="138">흔들림이 커질수록 기준 먼저 확인</text>
    </svg>
  );
}

export function TradingSkillsPage() {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredSkills = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return tradingSkills.filter((skill) => {
      const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
      const matchesKeyword =
        !keyword ||
        skill.title.toLowerCase().includes(keyword) ||
        skill.intent.toLowerCase().includes(keyword) ||
        skill.example.toLowerCase().includes(keyword) ||
        skill.practice.toLowerCase().includes(keyword) ||
        skill.checklist.some((item) => item.toLowerCase().includes(keyword));
      return matchesCategory && matchesKeyword;
    });
  }, [searchKeyword, selectedCategory]);

  return (
    <section className="content-section trading-skills-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">TRADING SKILLS</p>
          <h1>트레이딩 스킬 학습</h1>
          <p>차트를 볼 때 자주 쓰는 관찰 방법을 예시와 체크리스트로 연습합니다.</p>
        </div>
      </div>

      <section className="skill-learning-panel">
        <div>
          <span className="card-label">LEARNING FLOW</span>
          <h2>매매 판단이 아니라 차트 읽기 연습입니다</h2>
          <p>각 스킬은 과거 데이터에서 무엇을 보고, 어떤 질문을 던질지 정리한 교육용 가이드입니다.</p>
        </div>
        <div className="skill-flow-steps" aria-label="학습 순서">
          <span>상황 보기</span>
          <span>지표 확인</span>
          <span>예시 비교</span>
          <span>질문 기록</span>
        </div>
      </section>

      <div className="glossary-controls">
        <label className="glossary-search">
          <span>스킬 검색</span>
          <input
            type="search"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="예: 다이버전스, 거래량, 변동 폭"
          />
        </label>
        <div className="glossary-category-tabs" aria-label="트레이딩 스킬 카테고리">
          {(['all', 'price', 'confirmation', 'indicator', 'risk'] as const).map((category) => (
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

      <div className="trading-skill-grid">
        {filteredSkills.map((skill) => (
          <article className="trading-skill-card" key={skill.title}>
            <div className="trading-skill-visual">
              <SkillVisual type={skill.visualType} />
            </div>
            <div className="trading-skill-body">
              <span className="pill pill-accent">{categoryLabels[skill.category]}</span>
              <h2>{skill.title}</h2>
              <p>{skill.intent}</p>
              <div className="skill-example-box">
                <strong>예시</strong>
                <p>{skill.example}</p>
              </div>
              <div className="skill-checklist">
                <strong>확인 순서</strong>
                <ul>
                  {skill.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="skill-practice">
                <strong>연습 질문</strong>
                <p>{skill.practice}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredSkills.length === 0 ? (
        <div className="state-panel">
          <h2>검색 결과가 없습니다.</h2>
          <p>다른 스킬명이나 카테고리로 다시 찾아보세요.</p>
        </div>
      ) : null}
    </section>
  );
}
