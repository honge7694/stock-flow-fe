import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

type GlossaryEntry = {
  term: string;
  title: string;
  description: string;
};

const glossaryEntries: GlossaryEntry[] = [
  {
    term: 'MACD 데드 크로스',
    title: 'MACD 데드 크로스',
    description:
      'MACD선이 signal선 아래로 내려가는 현상입니다. 단기 모멘텀이 약해졌는지 관찰할 때 쓰며, 단독 판단 근거가 아닙니다.',
  },
  {
    term: '데드 크로스',
    title: '데드 크로스',
    description:
      '짧은 기간의 평균선이나 지표가 긴 기간의 기준선 아래로 내려가는 현상입니다. 흐름 변화를 공부하기 위한 관찰 용어입니다.',
  },
  {
    term: '데드크로스',
    title: '데드크로스',
    description:
      '데드 크로스와 같은 표현입니다. 단기 흐름이 장기 기준보다 약해지는지 살펴볼 때 쓰는 교육용 관찰 용어입니다.',
  },
  {
    term: '골든 크로스',
    title: '골든 크로스',
    description:
      '짧은 기간의 평균선이나 지표가 긴 기간의 기준선 위로 올라가는 현상입니다. 추세 변화를 관찰할 때 참고합니다.',
  },
  {
    term: '골든크로스',
    title: '골든크로스',
    description:
      '골든 크로스와 같은 표현입니다. 단기 흐름이 장기 기준 위로 올라서는지 관찰할 때 참고합니다.',
  },
  {
    term: 'MACD',
    title: 'MACD',
    description:
      '단기 평균과 장기 평균의 차이를 이용해 흐름의 변화를 살펴보는 보조 지표입니다. signal선, histogram과 함께 봅니다.',
  },
  {
    term: 'signal선',
    title: 'Signal선',
    description:
      'MACD 값을 한 번 더 평균낸 기준선입니다. MACD선과의 위치 변화를 통해 모멘텀 변화를 관찰합니다.',
  },
  {
    term: 'histogram',
    title: 'Histogram',
    description:
      'MACD선과 signal선의 차이를 막대로 표현한 값입니다. 막대의 크기와 방향 변화를 학습용으로 확인합니다.',
  },
  {
    term: '이동평균선',
    title: '이동평균선',
    description:
      '일정 기간의 평균 가격을 선으로 이은 보조선입니다. 가격이 평균선 위아래에서 어떻게 움직이는지 관찰합니다.',
  },
  {
    term: '단순 이동평균',
    title: '단순 이동평균',
    description:
      '정해진 기간의 가격을 단순 평균한 값입니다. SMA라고도 부르며 가격 흐름을 부드럽게 보는 데 사용합니다.',
  },
  {
    term: 'SMA',
    title: 'SMA',
    description: 'Simple Moving Average의 약자로 단순 이동평균을 뜻합니다. 기간별 평균 가격 흐름을 보여줍니다.',
  },
  {
    term: 'SMA20',
    title: 'SMA20',
    description: '최근 20개 가격의 단순 이동평균입니다. 비교적 짧은 흐름을 관찰할 때 참고합니다.',
  },
  {
    term: 'SMA50',
    title: 'SMA50',
    description: '최근 50개 가격의 단순 이동평균입니다. SMA20보다 긴 흐름을 살펴볼 때 참고합니다.',
  },
  {
    term: 'RSI',
    title: 'RSI',
    description:
      '상승과 하락의 상대적 강도를 0부터 100까지 표현하는 보조 지표입니다. 극단 구간은 과거 흐름 학습용 참고 신호입니다.',
  },
  {
    term: 'RSI 14',
    title: 'RSI 14',
    description: '최근 14개 기간을 기준으로 계산한 RSI입니다. 단기 강도 변화를 볼 때 자주 쓰는 설정입니다.',
  },
  {
    term: 'RSI14',
    title: 'RSI14',
    description: 'RSI 14와 같은 표현입니다. 최근 14개 기간의 상대적 강도를 나타냅니다.',
  },
  {
    term: '과매수',
    title: '과매수',
    description:
      'RSI 등에서 상승 쪽 힘이 매우 강하게 나타난 구간을 뜻합니다. 이후 움직임을 보장하지 않는 관찰 표현입니다.',
  },
  {
    term: '과매도',
    title: '과매도',
    description:
      'RSI 등에서 하락 쪽 힘이 매우 강하게 나타난 구간을 뜻합니다. 이후 움직임을 보장하지 않는 관찰 표현입니다.',
  },
  {
    term: '거래량',
    title: '거래량',
    description: '해당 기간에 거래된 수량입니다. 가격 변화와 함께 보면 시장 참여 강도를 살펴볼 수 있습니다.',
  },
  {
    term: '모멘텀',
    title: '모멘텀',
    description: '가격 변화의 속도나 탄력을 관찰하는 개념입니다. 방향성 확정보다는 흐름의 강도 학습에 가깝습니다.',
  },
  {
    term: '상승 모멘텀',
    title: '상승 모멘텀',
    description:
      '가격이나 지표가 위쪽으로 움직이는 힘이 강해지는 모습을 뜻합니다. 흐름의 강도 학습을 위한 표현입니다.',
  },
  {
    term: '하락 모멘텀',
    title: '하락 모멘텀',
    description:
      '가격이나 지표가 아래쪽으로 움직이는 힘이 강해지는 모습을 뜻합니다. 이후 방향을 확정하는 표현은 아닙니다.',
  },
  {
    term: '변동성',
    title: '변동성',
    description: '가격이 흔들리는 정도입니다. 변동성이 크면 같은 기간에도 고가와 저가의 차이가 크게 나타날 수 있습니다.',
  },
  {
    term: '추세',
    title: '추세',
    description: '가격이나 지표가 일정 기간 동안 보여주는 큰 흐름입니다. 상승, 하락, 횡보 흐름을 구분해 관찰합니다.',
  },
  {
    term: '지지',
    title: '지지',
    description: '가격이 하락하다가 멈추거나 반응할 수 있는 구간을 관찰하는 표현입니다. 고정된 가격 보장은 아닙니다.',
  },
  {
    term: '지지선',
    title: '지지선',
    description:
      '가격이 내려오다가 반응할 수 있는 구간을 선으로 표현한 것입니다. 실제 가격을 보장하는 기준은 아닙니다.',
  },
  {
    term: '저항',
    title: '저항',
    description: '가격이 상승하다가 주춤하거나 되돌릴 수 있는 구간을 관찰하는 표현입니다.',
  },
  {
    term: '저항선',
    title: '저항선',
    description:
      '가격이 올라가다가 주춤할 수 있는 구간을 선으로 표현한 것입니다. 고정된 한계 가격을 뜻하지 않습니다.',
  },
  {
    term: '이탈',
    title: '이탈',
    description: '가격이나 지표가 관찰하던 기준선 또는 범위 밖으로 벗어나는 상황을 뜻합니다.',
  },
  {
    term: '돌파',
    title: '돌파',
    description:
      '가격이나 지표가 관찰하던 기준선 또는 범위를 넘어서는 상황입니다. 이후 흐름은 다른 지표와 함께 봅니다.',
  },
  {
    term: '과열',
    title: '과열',
    description:
      '짧은 기간에 가격이나 지표 움직임이 빠르게 강해진 상태를 뜻합니다. 속도 조절 여부를 함께 관찰합니다.',
  },
  {
    term: '조정',
    title: '조정',
    description:
      '상승 또는 하락 이후 가격이 쉬어가거나 되돌리는 흐름입니다. 추세가 끝났다는 뜻으로 단정하지 않습니다.',
  },
  {
    term: '반등',
    title: '반등',
    description: '하락하던 가격이 다시 올라오는 움직임입니다. 지속 여부는 추가 흐름을 함께 확인합니다.',
  },
];

const sortedEntries = [...glossaryEntries].sort((a, b) => b.term.length - a.term.length);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const glossaryPattern = new RegExp(sortedEntries.map((entry) => escapeRegExp(entry.term)).join('|'), 'gi');

function findEntry(value: string) {
  return sortedEntries.find((entry) => entry.term.toLowerCase() === value.toLowerCase());
}

function GlossaryTerm({ entry, children }: { entry: GlossaryEntry; children: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<CSSProperties>();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const tooltipId = useId();

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current || !tooltipRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const maxWidth = Math.min(320, window.innerWidth - 32);
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const preferredLeft = buttonRect.left + buttonRect.width / 2 - maxWidth / 2;
    const left = Math.max(16, Math.min(preferredLeft, window.innerWidth - maxWidth - 16));
    const preferredTop = buttonRect.top - tooltipRect.height - 10;
    const top = preferredTop < 12 ? buttonRect.bottom + 10 : preferredTop;

    setTooltipStyle({
      left,
      maxWidth,
      top,
    });
  }, [isOpen]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape') {
      setIsOpen(false);
      event.currentTarget.blur();
    }
  }

  return (
    <span className="glossary-term-wrap">
      <button
        ref={buttonRef}
        type="button"
        className="glossary-term"
        aria-label={children}
        aria-describedby={tooltipId}
        aria-expanded={isOpen}
        data-open={isOpen ? 'true' : undefined}
        onClick={() => setIsOpen((current) => !current)}
        onBlur={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
        <span ref={tooltipRef} className="glossary-tooltip" id={tooltipId} role="tooltip" style={tooltipStyle}>
          <strong>{entry.title}</strong>
          <span>{entry.description}</span>
        </span>
      </button>
    </span>
  );
}

export function GlossaryText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const usedTerms = new Set<string>();
  let lastIndex = 0;

  for (const match of text.matchAll(glossaryPattern)) {
    const matchedText = match[0];
    const entry = findEntry(matchedText);
    const index = match.index ?? 0;

    if (!entry) continue;

    const normalizedTerm = entry.term.toLowerCase();
    if (usedTerms.has(normalizedTerm)) continue;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(
      <GlossaryTerm entry={entry} key={`${entry.term}-${index}`}>
        {matchedText}
      </GlossaryTerm>,
    );

    usedTerms.add(normalizedTerm);
    lastIndex = index + matchedText.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts.length ? parts : text}</>;
}
