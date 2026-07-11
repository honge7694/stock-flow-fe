type LoadingOverlayProps = {
  title: string;
  description: string;
  subcopy?: string;
};

export function LoadingOverlay({
  title,
  description,
  subcopy = '응답을 받으면 화면을 자동으로 업데이트합니다.',
}: LoadingOverlayProps) {
  return (
    <div className="generation-overlay" role="status" aria-live="polite" aria-modal="true">
      <div className="generation-modal">
        <span className="loading-spinner generation-spinner" aria-hidden="true" />
        <h2>{title}</h2>
        <p>{description}</p>
        <p className="generation-subcopy">{subcopy}</p>
        <span className="generation-progress" aria-hidden="true" />
      </div>
    </div>
  );
}
