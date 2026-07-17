import type { ThemeMode } from '../theme';

type ThemeToggleProps = {
  theme: ThemeMode;
  onToggle: () => void;
};

function ThemeIcon({ theme }: { theme: ThemeMode }) {
  return theme === 'dark' ? (
    <svg className="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.42 1.42" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ) : (
    <svg className="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.4 15.4A8.5 8.5 0 0 1 8.6 3.6 8.5 8.5 0 1 0 20.4 15.4Z" />
    </svg>
  );
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const nextThemeLabel = theme === 'dark' ? '밝은 테마' : '어두운 테마';

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`${nextThemeLabel}로 전환`}
      title={`${nextThemeLabel}로 전환`}
      onClick={onToggle}
    >
      <ThemeIcon theme={theme} />
      <span>{theme === 'dark' ? '밝게 보기' : '어둡게 보기'}</span>
    </button>
  );
}
