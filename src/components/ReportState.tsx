type ReportStateProps = {
  status: 'idle' | 'loading' | 'error';
  errorMessage?: string;
};

export function ReportState({ status, errorMessage }: ReportStateProps) {
  if (status === 'loading') {
    return <section className="state-panel">리포트를 불러오는 중입니다.</section>;
  }

  if (status === 'error') {
    return <section className="state-panel state-panel-error">{errorMessage ?? '리포트 조회에 실패했습니다.'}</section>;
  }

  return <section className="state-panel">종목과 기간을 입력하면 분석 리포트가 표시됩니다.</section>;
}
