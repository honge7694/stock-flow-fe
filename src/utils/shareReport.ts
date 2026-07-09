import type { ReportPayload, ReportResponse } from '../types/report';

type ShareMetric = {
  label: string;
  value: string;
};

type ShareAiCheck = {
  label: string;
  title: string;
  status: string;
  summary: string;
};

export type ShareReportCard = {
  title: string;
  period: string;
  generatedAt: string;
  summary: string;
  aiSummary?: {
    title: string;
    summary: string;
    keyTakeaways: string[];
  };
  aiChecks?: ShareAiCheck[];
  notes?: {
    observations: string[];
    nextThingsToWatch: string[];
  };
  metrics: ShareMetric[];
  disclaimer: string;
};

export type ShareReportResult = 'shared' | 'downloaded';

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 2200;
const CARD_PADDING = 72;

const aiCheckLabels = ['추세', '모멘텀', '거래량', '변동성'];
const aiStatusLabels: Record<string, string> = {
  positive: '강화',
  caution: '확인 필요',
  neutral: '중립',
  negative: '약화',
  insufficient_data: '자료 부족',
};

function formatNumber(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString('ko-KR', { maximumFractionDigits: digits });
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return '-';
  return `${value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

function formatGeneratedAt(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getInstrumentTitle(report: ReportResponse) {
  return report.instrument?.name ? `${report.instrument.name} (${report.ticker})` : report.ticker;
}

export function buildShareReportCard(report: ReportResponse, payload: ReportPayload): ShareReportCard {
  const metrics = payload.summary?.metrics;
  const latestCandle = payload.candles.at(-1);
  const latestClose = metrics?.latestClose ?? latestCandle?.close;
  const latestVolume = metrics?.latestVolume ?? latestCandle?.volume;
  const aiReport = payload.aiAnalysis?.analysis?.report;
  const indicatorSummary = payload.aiAnalysis?.analysis?.indicatorSummary;
  const aiSummary = indicatorSummary
    ? {
        title: indicatorSummary.title,
        summary: indicatorSummary.summary,
        keyTakeaways: indicatorSummary.keyTakeaways.slice(0, 3),
      }
    : aiReport
      ? {
          title: aiReport.headline,
          summary: aiReport.summary,
          keyTakeaways: aiReport.observations.slice(0, 3),
        }
      : undefined;
  const checklist = payload.aiAnalysis?.analysis?.checklist;
  const checklistItems = checklist ? Object.values(checklist) : [];
  const aiChecks = checklistItems.length
    ? checklistItems.slice(0, 4).map((item, index) => ({
        label: aiCheckLabels[index] ?? '지표',
        title: item.title,
        status: aiStatusLabels[item.status] ?? item.status,
        summary: item.summary ?? item.explanation ?? '',
      }))
    : undefined;
  const notes = aiReport
    ? {
        observations: aiReport.observations.slice(0, 3),
        nextThingsToWatch: aiReport.nextThingsToWatch.slice(0, 3),
      }
    : undefined;

  return {
    title: `${getInstrumentTitle(report)} 분석 리포트`,
    period: `${report.from} - ${report.to}`,
    generatedAt: formatGeneratedAt(report.generatedAt),
    summary: aiReport?.summary ?? '과거 가격 데이터와 기술 지표를 학습 목적으로 정리한 리포트입니다.',
    aiSummary,
    aiChecks,
    notes,
    metrics: [
      { label: '최근 종가', value: formatNumber(latestClose) },
      { label: '거래량', value: formatNumber(latestVolume) },
      { label: '기간 변화율', value: formatPercent(metrics?.periodChangePercent) },
      { label: 'RSI 14', value: formatNumber(metrics?.latestRsi14, 2) },
    ],
    disclaimer: '교육용 분석이며 투자 조언이 아닙니다.',
  };
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) lines.push(currentLine);
    currentLine = word;
    if (lines.length === maxLines) break;
  }

  if (currentLine && lines.length < maxLines) lines.push(currentLine);

  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });

  return y + lines.length * lineHeight;
}

function createReportCanvas(card: ShareReportCard) {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('공유 이미지를 생성할 수 없습니다.');

  context.fillStyle = '#07100d';
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  context.fillStyle = '#00d992';
  context.font = '700 30px Arial, sans-serif';
  context.fillText('STOCK FLOW', CARD_PADDING, CARD_PADDING + 8);

  context.fillStyle = '#f8fafc';
  context.font = '700 64px Arial, sans-serif';
  const titleEndY = drawWrappedText(context, card.title, CARD_PADDING, 180, CARD_WIDTH - CARD_PADDING * 2, 78, 2);

  context.fillStyle = '#b7c3bf';
  context.font = '400 30px Arial, sans-serif';
  context.fillText(card.period, CARD_PADDING, titleEndY + 36);
  context.fillText(`생성 ${card.generatedAt}`, CARD_PADDING, titleEndY + 82);

  let metricTop = titleEndY + 150;
  card.metrics.forEach((metric, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = CARD_PADDING + column * 468;
    const y = metricTop + row * 190;

    context.fillStyle = '#101816';
    context.strokeStyle = '#25332f';
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(x, y, 420, 140, 18);
    context.fill();
    context.stroke();

    context.fillStyle = '#b7c3bf';
    context.font = '400 30px Arial, sans-serif';
    context.fillText(metric.label, x + 32, y + 48);
    context.fillStyle = '#f8fafc';
    context.font = '700 44px Arial, sans-serif';
    context.fillText(metric.value, x + 32, y + 102);
  });

  metricTop += 420;
  context.fillStyle = '#101816';
  context.strokeStyle = '#25332f';
  context.beginPath();
  context.roundRect(CARD_PADDING, metricTop, CARD_WIDTH - CARD_PADDING * 2, 560, 18);
  context.fill();
  context.stroke();

  context.fillStyle = '#00d992';
  context.font = '700 28px Arial, sans-serif';
  context.fillText('AI SUMMARY', CARD_PADDING + 34, metricTop + 54);

  context.fillStyle = '#f8fafc';
  context.font = '700 42px Arial, sans-serif';
  const aiTitle = card.aiSummary?.title ?? '교육용 AI 요약';
  const titleBottom = drawWrappedText(context, aiTitle, CARD_PADDING + 34, metricTop + 112, CARD_WIDTH - CARD_PADDING * 2 - 68, 52, 2);

  context.fillStyle = '#dbe5e1';
  context.font = '400 31px Arial, sans-serif';
  const summaryBottom = drawWrappedText(
    context,
    card.aiSummary?.summary ?? card.summary,
    CARD_PADDING + 34,
    titleBottom + 34,
    CARD_WIDTH - CARD_PADDING * 2 - 68,
    44,
    3,
  );

  const takeaways = card.aiSummary?.keyTakeaways ?? [];
  context.fillStyle = '#b7c3bf';
  context.font = '400 27px Arial, sans-serif';
  takeaways.slice(0, 3).forEach((item, index) => {
    const y = summaryBottom + 44 + index * 42;
    context.fillStyle = '#00d992';
    context.beginPath();
    context.arc(CARD_PADDING + 42, y - 8, 5, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#b7c3bf';
    drawWrappedText(context, item, CARD_PADDING + 62, y, CARD_WIDTH - CARD_PADDING * 2 - 96, 34, 1);
  });

  let currentY = metricTop + 630;
  if (card.aiChecks?.length) {
    context.fillStyle = '#00d992';
    context.font = '700 28px Arial, sans-serif';
    context.fillText('AI CHECKLIST', CARD_PADDING, currentY);

    card.aiChecks.slice(0, 4).forEach((check, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const cardWidth = 452;
      const cardHeight = 178;
      const x = CARD_PADDING + column * 484;
      const y = currentY + 34 + row * 208;

      context.fillStyle = '#101816';
      context.strokeStyle = '#25332f';
      context.beginPath();
      context.roundRect(x, y, cardWidth, cardHeight, 18);
      context.fill();
      context.stroke();

      context.fillStyle = '#00d992';
      context.font = '700 22px Arial, sans-serif';
      context.fillText(check.label.toUpperCase(), x + 26, y + 38);

      context.fillStyle = '#b7c3bf';
      context.font = '400 22px Arial, sans-serif';
      context.fillText(check.status, x + cardWidth - 110, y + 38);

      context.fillStyle = '#f8fafc';
      context.font = '700 28px Arial, sans-serif';
      drawWrappedText(context, check.title, x + 26, y + 82, cardWidth - 52, 34, 1);

      context.fillStyle = '#b7c3bf';
      context.font = '400 24px Arial, sans-serif';
      drawWrappedText(context, check.summary, x + 26, y + 126, cardWidth - 52, 32, 2);
    });

    currentY += 490;
  }

  if (card.notes) {
    const noteCardWidth = 452;
    const noteCardHeight = 330;
    const noteGroups = [
      { title: '관찰 포인트', items: card.notes.observations },
      { title: '다음 확인 기준', items: card.notes.nextThingsToWatch },
    ];

    noteGroups.forEach((group, index) => {
      const x = CARD_PADDING + index * 484;

      context.fillStyle = '#101816';
      context.strokeStyle = '#25332f';
      context.beginPath();
      context.roundRect(x, currentY, noteCardWidth, noteCardHeight, 18);
      context.fill();
      context.stroke();

      context.fillStyle = '#f8fafc';
      context.font = '700 30px Arial, sans-serif';
      context.fillText(group.title, x + 26, currentY + 48);

      context.fillStyle = '#b7c3bf';
      context.font = '400 24px Arial, sans-serif';
      group.items.slice(0, 3).forEach((item, itemIndex) => {
        const y = currentY + 98 + itemIndex * 72;
        context.fillStyle = '#00d992';
        context.beginPath();
        context.arc(x + 34, y - 8, 5, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#b7c3bf';
        drawWrappedText(context, item, x + 52, y, noteCardWidth - 78, 30, 2);
      });
    });
  }

  context.fillStyle = '#8ea19a';
  context.font = '400 28px Arial, sans-serif';
  drawWrappedText(context, card.disclaimer, CARD_PADDING, CARD_HEIGHT - 100, CARD_WIDTH - CARD_PADDING * 2, 38, 2);

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error('공유 이미지를 생성하지 못했습니다.'));
    }, 'image/png');
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function shareReport(report: ReportResponse, payload: ReportPayload): Promise<ShareReportResult> {
  const card = buildShareReportCard(report, payload);
  const blob = await canvasToBlob(createReportCanvas(card));
  const filename = `stock-flow-${report.ticker}-${report.id}.png`;
  const file = new File([blob], filename, { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: card.title,
      text: card.disclaimer,
      files: [file],
    });
    return 'shared';
  }

  downloadBlob(blob, filename);
  return 'downloaded';
}
