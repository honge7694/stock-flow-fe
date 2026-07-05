type ReportStateProps = {
  status: 'idle' | 'loading' | 'error';
  errorMessage?: string;
};

export function ReportState({ status, errorMessage }: ReportStateProps) {
  if (status === 'loading') {
    return (
      <section className="state-panel loading-state-panel" role="status" aria-live="polite">
        <span className="loading-spinner" aria-hidden="true" />
        <div>
          <strong>리포트를 생성하는 중입니다.</strong>
          <p>과거 가격 데이터와 기술 지표를 정리하는 중입니다.</p>
        </div>
        <span className="loading-progress" aria-hidden="true" />
      </section>
    );
  }

  if (status === 'error') {
    return <section className="state-panel state-panel-error">{errorMessage ?? '리포트 생성에 실패했습니다.'}</section>;
  }

  return <section className="state-panel">종목과 기간을 입력하면 생성된 분석 리포트가 표시됩니다.</section>;
}
