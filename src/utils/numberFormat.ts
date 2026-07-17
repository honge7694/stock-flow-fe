type NumericValue = number | null | undefined;

export function formatNumber(value: NumericValue, maximumFractionDigits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return value.toLocaleString('ko-KR', {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });
}

export function formatInteger(value: NumericValue) {
  return formatNumber(value, 0);
}

export function formatPercent(value: NumericValue, showPositiveSign = false) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  const prefix = showPositiveSign && value > 0 ? '+' : '';
  return `${prefix}${formatNumber(value)}%`;
}

export function formatMoney(value: NumericValue, currency?: string | null) {
  const formatted = formatNumber(value);
  return currency && formatted !== '-' ? `${formatted} ${currency}` : formatted;
}
