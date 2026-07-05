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
    term: '골든 크로스',
    title: '골든 크로스',
    description:
      '짧은 기간의 평균선이나 지표가 긴 기간의 기준선 위로 올라가는 현상입니다. 추세 변화를 관찰할 때 참고합니다.',
  },
  {
    term: '이동평균선',
    title: '이동평균선',
    description:
      '일정 기간의 평균 가격을 선으로 이은 보조선입니다. 가격이 평균선 위아래에서 어떻게 움직이는지 관찰합니다.',
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
    term: '변동성',
    title: '변동성',
    description: '가격이 흔들리는 정도입니다. 변동성이 크면 같은 기간에도 고가와 저가의 차이가 크게 나타날 수 있습니다.',
  },
  {
    term: '지지',
    title: '지지',
    description: '가격이 하락하다가 멈추거나 반응할 수 있는 구간을 관찰하는 표현입니다. 고정된 가격 보장은 아닙니다.',
  },
  {
    term: '이탈',
    title: '이탈',
    description: '가격이나 지표가 관찰하던 기준선 또는 범위 밖으로 벗어나는 상황을 뜻합니다.',
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
