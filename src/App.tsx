import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { fetchMe, login, signup } from './api/authApi';
import { AUTH_EXPIRED_EVENT } from './api/authEvents';
import { AuthPanel } from './components/AuthPanel';
import { ThemeToggle } from './components/ThemeToggle';
import { ChartPatternsPage } from './pages/ChartPatternsPage';
import { DashboardPage } from './pages/DashboardPage';
import { GlossaryPage } from './pages/GlossaryPage';
import { PortfolioEducationCreatePage } from './pages/PortfolioEducationCreatePage';
import { PortfolioEducationDetailPage } from './pages/PortfolioEducationDetailPage';
import { PortfolioEducationPage } from './pages/PortfolioEducationPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { ReportGeneratePage } from './pages/ReportGeneratePage';
import { ReportsPage } from './pages/ReportsPage';
import { StocksPage } from './pages/StocksPage';
import { TradingSkillsPage } from './pages/TradingSkillsPage';
import { applyTheme, getInitialTheme, THEME_STORAGE_KEY } from './theme';
import type { User } from './types/report';

type AuthState = 'idle' | 'loading';
type NavIconName = 'dashboard' | 'stocks' | 'portfolio' | 'reports' | 'tradingSkills' | 'chartPatterns' | 'glossary';

const navItems = [
  { to: '/dashboard', label: '대시보드', icon: 'dashboard', end: false },
  { to: '/stocks', label: '관심 종목', icon: 'stocks', end: false },
  { to: '/portfolio-analyses', label: '보유 분석', icon: 'portfolio', end: false },
  { to: '/reports', label: '리포트 목록', icon: 'reports', end: false },
  { to: '/trading-skills', label: '스킬 학습', icon: 'tradingSkills', end: true },
  { to: '/chart-patterns', label: '차트 흐름도', icon: 'chartPatterns', end: true },
  { to: '/glossary', label: '용어집', icon: 'glossary', end: true },
] satisfies Array<{ to: string; label: string; icon: NavIconName; end: boolean }>;

const navIconPaths: Record<NavIconName, string[]> = {
  dashboard: ['M4 5h6v6H4z', 'M14 5h6v4h-6z', 'M14 13h6v6h-6z', 'M4 15h6v4H4z'],
  stocks: ['M4 17l4.5-4.5 3 3L18 9', 'M15 9h3v3'],
  portfolio: ['M4 7h16v12H4z', 'M8 7V5h8v2', 'M8 13h8', 'M8 16h5'],
  reports: ['M7 4h10v16H7z', 'M10 8h4', 'M10 12h4', 'M10 16h3', 'M5 7h2', 'M17 7h2'],
  tradingSkills: ['M4 17l5-5 4 3 7-8', 'M15 7h5v5', 'M5 6h5', 'M5 10h3', 'M5 20h14'],
  chartPatterns: ['M4 17 L8 7 L12 14 L16 6 L20 13', 'M4 20h16', 'M6 4h12', 'M12 14h8'],
  glossary: ['M5 5h10a4 4 0 0 1 4 4v10H9a4 4 0 0 0-4-4z', 'M5 5v14', 'M9 9h6', 'M9 13h5'],
};

function SidebarNavIcon({ name }: { name: NavIconName }) {
  return (
    <svg className="nav-icon-svg" viewBox="0 0 24 24" focusable="false">
      {navIconPaths[name].map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}

function SidebarToggleIcon({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <svg className="sidebar-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 5v14" />
      <path d="M9 6h11v12H9z" />
      <path d={isCollapsed ? 'M14 9l3 3-3 3' : 'M16 9l-3 3 3 3'} />
    </svg>
  );
}

function readStoredUser() {
  const storedUser = localStorage.getItem('stock-flow-user');
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem('stock-flow-user');
    return null;
  }
}

export default function App() {
  const [authStatus, setAuthStatus] = useState<AuthState>('idle');
  const [authErrorMessage, setAuthErrorMessage] = useState<string>();
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('stock-flow-token') ?? '');
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem('stock-flow-sidebar-collapsed') === 'true',
  );
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, handleLogout);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleLogout);
    };
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    async function verifySession() {
      try {
        const nextUser = await fetchMe(accessToken);
        setUser(nextUser);
        localStorage.setItem('stock-flow-user', JSON.stringify(nextUser));
      } catch {
        handleLogout();
      }
    }

    if (!user) {
      void verifySession();
    }
  }, [accessToken, user]);

  async function handleAuth(mode: 'login' | 'signup', email: string, password: string) {
    setAuthStatus('loading');
    setAuthErrorMessage(undefined);

    try {
      const auth = mode === 'login' ? await login({ email, password }) : await signup({ email, password });
      setAccessToken(auth.accessToken);
      setUser(auth.user);
      localStorage.setItem('stock-flow-token', auth.accessToken);
      localStorage.setItem('stock-flow-user', JSON.stringify(auth.user));
    } catch (error) {
      setAuthErrorMessage(error instanceof Error ? error.message : '인증 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      setAuthStatus('idle');
    }
  }

  function handleLogout() {
    setAccessToken('');
    setUser(null);
    localStorage.removeItem('stock-flow-token');
    localStorage.removeItem('stock-flow-user');
  }

  function toggleSidebar() {
    setIsSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem('stock-flow-sidebar-collapsed', String(next));
      return next;
    });
  }

  function toggleTheme() {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }

  if (!accessToken) {
    return (
      <BrowserRouter>
        <main className="page auth-page">
          <div className="auth-theme-actions">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
          <AuthPanel
            isLoading={authStatus === 'loading'}
            user={user}
            errorMessage={authErrorMessage}
            onLogin={(email, password) => handleAuth('login', email, password)}
            onSignup={(email, password) => handleAuth('signup', email, password)}
            onLogout={handleLogout}
          />
        </main>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <main className="app-shell">
        <aside className={isSidebarCollapsed ? 'app-sidebar app-sidebar-collapsed' : 'app-sidebar'}>
          <div className="brand-block">
            <div className="brand-header">
              <div className="brand-copy">
                <p className="eyebrow">STOCK FLOW</p>
                <span className="brand-mark" aria-hidden="true">
                  SF
                </span>
                <strong>교육용 차트 리포트</strong>
                <span>과거 데이터 기반 학습 도구</span>
              </div>
              <button
                type="button"
                className="sidebar-toggle-button"
                aria-label={isSidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
                aria-expanded={!isSidebarCollapsed}
                onClick={toggleSidebar}
              >
                <SidebarToggleIcon isCollapsed={isSidebarCollapsed} />
              </button>
              <div className="mobile-account-shell">
                <AuthPanel
                  isLoading={authStatus === 'loading'}
                  user={user}
                  errorMessage={authErrorMessage}
                  onLogin={(email, password) => handleAuth('login', email, password)}
                  onSignup={(email, password) => handleAuth('signup', email, password)}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
          <nav className="nav-tabs" aria-label="주요 화면">
            {navItems.map((item) => (
              <NavLink to={item.to} end={item.end} aria-label={item.label} title={item.label} key={item.to}>
                <span className="nav-icon" aria-hidden="true">
                  <SidebarNavIcon name={item.icon} />
                </span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <p className="shell-disclaimer">투자 조언이나 매매 추천을 제공하지 않습니다.</p>
        </aside>

        <section className="workspace">
          <header className="workspace-topbar">
            <div>
              <span className="workspace-kicker">교육용 분석</span>
              <p>관심 종목과 리포트를 한 곳에서 정리합니다.</p>
            </div>
            <div className="workspace-actions">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <div className="desktop-account-shell">
                <AuthPanel
                  isLoading={authStatus === 'loading'}
                  user={user}
                  errorMessage={authErrorMessage}
                  onLogin={(email, password) => handleAuth('login', email, password)}
                  onSignup={(email, password) => handleAuth('signup', email, password)}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/stocks" element={<StocksPage accessToken={accessToken} />} />
            <Route path="/portfolio-analyses" element={<PortfolioEducationPage accessToken={accessToken} />} />
            <Route path="/portfolio-analyses/new" element={<PortfolioEducationCreatePage accessToken={accessToken} />} />
            <Route path="/portfolio-analyses/:id" element={<PortfolioEducationDetailPage accessToken={accessToken} />} />
            <Route path="/reports/new" element={<ReportGeneratePage accessToken={accessToken} />} />
            <Route path="/reports" element={<ReportsPage accessToken={accessToken} />} />
            <Route path="/reports/:id" element={<ReportDetailPage accessToken={accessToken} />} />
            <Route path="/trading-skills" element={<TradingSkillsPage />} />
            <Route path="/chart-patterns" element={<ChartPatternsPage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </section>
      </main>
    </BrowserRouter>
  );
}
