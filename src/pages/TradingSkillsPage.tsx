type SkillVisualType = 'trendPullback' | 'supportBreak' | 'volumeConfirm' | 'riskPlan';

type TradingSkill = {
  title: string;
  category: string;
  intent: string;
  example: string;
  checklist: string[];
  practice: string;
  visualType: SkillVisualType;
};

const tradingSkills: TradingSkill[] = [
  {
    title: '추세와 눌림 구분하기',
    category: '가격 흐름',
    intent: '가격이 계속 같은 방향으로 움직이는지, 잠깐 쉬어가는 구간인지 구분하는 연습입니다.',
    example:
      '가격이 SMA20 위에서 움직이다가 잠시 평균선 근처로 내려온 뒤 다시 회복하면, 장기 방향은 유지되면서 단기 조정이 나타난 장면으로 볼 수 있습니다.',
    checklist: ['가격이 SMA20, SMA50 위아래 어디에 있는지 확인합니다.', '평균선 기울기가 완만히 유지되는지 봅니다.', '조정 구간의 거래량이 과도하게 커졌는지 확인합니다.'],
    practice: '최근 캔들 10개 중 종가가 SMA20 아래에 머문 날이 몇 번인지 세어보세요.',
    visualType: 'trendPullback',
  },
  {
    title: '지지선 이탈 확인하기',
    category: '구간 관찰',
    intent: '가격이 반복해서 반응하던 구간 아래로 내려갔는지 확인하는 연습입니다.',
    example:
      '50,000원 근처에서 여러 번 반등하던 종목이 큰 거래량과 함께 49,000원 아래에서 마감하면 지지 구간 이탈 가능성을 관찰할 수 있습니다.',
    checklist: ['한 번의 장중 하락이 아니라 종가 기준으로 확인합니다.', '이탈 이후 다시 같은 구간을 회복하는지 봅니다.', '거래량이 평균 대비 크게 늘었는지 함께 봅니다.'],
    practice: '차트에서 최근 2번 이상 반응한 가격 구간을 하나 표시하고, 그 아래에서 마감한 날이 있는지 찾아보세요.',
    visualType: 'supportBreak',
  },
  {
    title: '거래량으로 움직임 확인하기',
    category: '참여 강도',
    intent: '가격 변화가 얼마나 많은 거래와 함께 나타났는지 확인하는 연습입니다.',
    example:
      '가격이 저항 구간 위로 올라갔는데 거래량이 평균보다 낮다면, 움직임이 유지되는지 더 확인해야 합니다. 반대로 평균보다 큰 거래량이 동반되면 참여가 커진 장면으로 볼 수 있습니다.',
    checklist: ['가격 변화가 큰 날의 거래량을 평균 거래량과 비교합니다.', '상승일과 하락일 중 어느 쪽에서 거래량이 더 커지는지 봅니다.', '거래량 증가는 방향을 보장하지 않는다는 점을 기억합니다.'],
    practice: '최근 가장 거래량이 컸던 날의 캔들이 상승 캔들인지 하락 캔들인지 확인해보세요.',
    visualType: 'volumeConfirm',
  },
  {
    title: '변동성 구간에서 기준 세우기',
    category: '위험 관리',
    intent: '가격 흔들림이 커질 때 수치와 기준을 먼저 정리하는 연습입니다.',
    example:
      '최근 캔들의 고가와 저가 차이가 평소보다 커지고 RSI가 빠르게 움직이면, 해석을 서두르기보다 평균 단가, 현재가, 주요 평균선 위치를 먼저 정리합니다.',
    checklist: ['최근 캔들의 몸통과 꼬리가 길어졌는지 봅니다.', '평균 단가와 현재가의 거리를 확인합니다.', '하나의 지표보다 가격, 거래량, 평균선을 함께 봅니다.'],
    practice: '현재가가 평균 단가에서 몇 퍼센트 떨어져 있는지 계산하고, SMA20과 SMA50 위치를 함께 적어보세요.',
    visualType: 'riskPlan',
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

      <div className="trading-skill-grid">
        {tradingSkills.map((skill) => (
          <article className="trading-skill-card" key={skill.title}>
            <div className="trading-skill-visual">
              <SkillVisual type={skill.visualType} />
            </div>
            <div className="trading-skill-body">
              <span className="pill pill-accent">{skill.category}</span>
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
    </section>
  );
}
