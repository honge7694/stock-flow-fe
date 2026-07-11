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
      'MACD선이 signal선 아래로 교차해 내려가는 현상입니다. 단기 가격 흐름의 힘이 이전보다 약해지고 있음을 나타낼 때 쓰는 용어입니다.',
  },
  {
    term: 'MACD 골든 크로스',
    title: 'MACD 골든 크로스',
    description:
      'MACD선이 signal선 위로 교차해 올라가는 현상입니다. 단기 가격 흐름의 힘이 이전보다 강해지고 있음을 나타낼 때 쓰는 용어입니다.',
  },
  {
    term: '데드 크로스',
    title: '데드 크로스',
    description:
      '단기 이동평균선이나 단기 지표가 장기 이동평균선 또는 기준선 아래로 교차해 내려가는 현상입니다. 보통 단기 흐름이 장기 흐름보다 약해졌다는 의미로 해석됩니다.',
  },
  {
    term: '데드크로스',
    title: '데드크로스',
    description:
      '단기 이동평균선이나 단기 지표가 장기 이동평균선 또는 기준선 아래로 교차해 내려가는 현상입니다. 보통 단기 흐름이 장기 흐름보다 약해졌다는 의미로 해석됩니다.',
  },
  {
    term: '골든 크로스',
    title: '골든 크로스',
    description:
      '단기 이동평균선이나 단기 지표가 장기 이동평균선 또는 기준선 위로 교차해 올라가는 현상입니다. 보통 단기 흐름이 장기 흐름보다 강해졌다는 의미로 해석됩니다.',
  },
  {
    term: '골든크로스',
    title: '골든크로스',
    description:
      '단기 이동평균선이나 단기 지표가 장기 이동평균선 또는 기준선 위로 교차해 올라가는 현상입니다. 보통 단기 흐름이 장기 흐름보다 강해졌다는 의미로 해석됩니다.',
  },
  {
    term: 'MACD',
    title: 'MACD',
    description:
      'Moving Average Convergence Divergence의 약자입니다. 단기 지수이동평균과 장기 지수이동평균의 차이를 이용해 가격 흐름의 방향과 힘 변화를 나타내는 보조 지표입니다.',
  },
  {
    term: 'signal선',
    title: 'Signal선',
    description:
      'MACD 값을 다시 이동평균한 기준선입니다. MACD선이 signal선 위에 있으면 단기 흐름이 상대적으로 강하고, 아래에 있으면 상대적으로 약하다고 해석합니다.',
  },
  {
    term: 'histogram',
    title: 'Histogram',
    description:
      'MACD선과 signal선의 차이를 막대 형태로 나타낸 값입니다. 0보다 크면 MACD선이 signal선 위에 있고, 0보다 작으면 아래에 있다는 뜻입니다.',
  },
  {
    term: '히스토그램',
    title: '히스토그램',
    description:
      'MACD선과 signal선의 차이를 막대 형태로 나타낸 값입니다. 0보다 크면 MACD선이 signal선 위에 있고, 0보다 작으면 아래에 있다는 뜻입니다.',
  },
  {
    term: '이동평균선',
    title: '이동평균선',
    description:
      '정해진 기간의 평균 가격을 날짜별로 이어 만든 선입니다. 하루하루의 가격 변동을 부드럽게 보여주어 큰 흐름을 보기 쉽게 만듭니다.',
  },
  {
    term: '단순 이동평균',
    title: '단순 이동평균',
    description:
      '정해진 기간의 가격을 모두 더한 뒤 기간 수로 나눈 평균값입니다. SMA라고도 하며, 모든 날짜에 같은 가중치를 적용합니다.',
  },
  {
    term: 'SMA',
    title: 'SMA',
    description: 'Simple Moving Average의 약자로 단순 이동평균을 뜻합니다. 정해진 기간의 가격을 같은 비중으로 평균낸 값입니다.',
  },
  {
    term: 'SMA20',
    title: 'SMA20',
    description: '최근 20개 기간의 가격을 단순 평균한 값입니다. 일봉 기준으로는 최근 20거래일의 평균 가격을 의미합니다.',
  },
  {
    term: 'SMA50',
    title: 'SMA50',
    description: '최근 50개 기간의 가격을 단순 평균한 값입니다. SMA20보다 더 긴 기간의 평균 흐름을 나타냅니다.',
  },
  {
    term: 'RSI',
    title: 'RSI',
    description:
      'Relative Strength Index의 약자입니다. 최근 상승폭과 하락폭을 비교해 가격 움직임의 상대적 강도를 0부터 100 사이의 값으로 나타내는 지표입니다.',
  },
  {
    term: 'RSI 14',
    title: 'RSI 14',
    description: '최근 14개 기간을 기준으로 계산한 RSI입니다. 14는 RSI를 계산할 때 사용하는 기간 수를 의미합니다.',
  },
  {
    term: 'RSI14',
    title: 'RSI14',
    description: '최근 14개 기간을 기준으로 계산한 RSI입니다. 14는 RSI를 계산할 때 사용하는 기간 수를 의미합니다.',
  },
  {
    term: '과매수',
    title: '과매수',
    description:
      '가격이나 지표가 단기간에 많이 올라 상승 압력이 과도하게 커진 상태를 뜻합니다. RSI에서는 보통 70 이상 구간을 과매수로 보는 경우가 많습니다.',
  },
  {
    term: '과매도',
    title: '과매도',
    description:
      '가격이나 지표가 단기간에 많이 내려 하락 압력이 과도하게 커진 상태를 뜻합니다. RSI에서는 보통 30 이하 구간을 과매도로 보는 경우가 많습니다.',
  },
  {
    term: '거래량',
    title: '거래량',
    description: '해당 기간에 거래된 수량입니다. 가격 변화와 함께 보면 시장 참여 강도를 살펴볼 수 있습니다.',
  },
  {
    term: '모멘텀',
    title: '모멘텀',
    description: '가격이나 지표가 한 방향으로 움직이려는 속도와 힘을 뜻합니다. 같은 상승이라도 모멘텀이 강하면 상승 속도가 빠르고, 약하면 속도가 둔해집니다.',
  },
  {
    term: '상승 모멘텀',
    title: '상승 모멘텀',
    description:
      '가격이나 지표가 위쪽으로 움직이는 힘이 강해지는 상태입니다. 상승 폭이 커지거나 상승 속도가 빨라질 때 이런 표현을 씁니다.',
  },
  {
    term: '하락 모멘텀',
    title: '하락 모멘텀',
    description:
      '가격이나 지표가 아래쪽으로 움직이는 힘이 강해지는 상태입니다. 하락 폭이 커지거나 하락 속도가 빨라질 때 이런 표현을 씁니다.',
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
