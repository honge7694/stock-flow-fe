import type { ReportPayload, ReportResponse } from '../types/report';

type ShareMetric = {
  label: string;
  value: string;
};

export type ShareReportCard = {
  title: string;
  period: string;
  generatedAt: string;
  summary: string;
  metrics: ShareMetric[];
  disclaimer: string;
};

export type ShareReportResult = 'shared' | 'downloaded';

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;
const CARD_PADDING = 72;

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

  return {
    title: `${getInstrumentTitle(report)} 분석 리포트`,
    period: `${report.from} - ${report.to}`,
    generatedAt: formatGeneratedAt(report.generatedAt),
    summary: aiReport?.summary ?? '과거 가격 데이터와 기술 지표를 학습 목적으로 정리한 리포트입니다.',
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

  metricTop += 430;
  context.fillStyle = '#101816';
  context.strokeStyle = '#25332f';
  context.beginPath();
  context.roundRect(CARD_PADDING, metricTop, CARD_WIDTH - CARD_PADDING * 2, 310, 18);
  context.fill();
  context.stroke();

  context.fillStyle = '#00d992';
  context.font = '700 28px Arial, sans-serif';
  context.fillText('AI SUMMARY', CARD_PADDING + 34, metricTop + 56);
  context.fillStyle = '#dbe5e1';
  context.font = '400 34px Arial, sans-serif';
  drawWrappedText(context, card.summary, CARD_PADDING + 34, metricTop + 118, CARD_WIDTH - CARD_PADDING * 2 - 68, 50, 4);

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
