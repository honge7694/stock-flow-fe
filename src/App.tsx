import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { fetchMe, login, signup } from './api/authApi';
import { AuthPanel } from './components/AuthPanel';
import { DashboardPage } from './pages/DashboardPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { ReportGeneratePage } from './pages/ReportGeneratePage';
import { ReportsPage } from './pages/ReportsPage';
import { StocksPage } from './pages/StocksPage';
import type { User } from './types/report';

type AuthState = 'idle' | 'loading';

const navItems = [
  { to: '/dashboard', label: '대시보드', shortLabel: 'D', end: false },
  { to: '/stocks', label: '관심 종목', shortLabel: 'S', end: false },
  { to: '/reports/new', label: '리포트 생성', shortLabel: '+', end: false },
  { to: '/reports', label: '리포트 목록', shortLabel: 'R', end: true },
];

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

  if (!accessToken) {
    return (
      <BrowserRouter>
        <main className="page auth-page">
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
                <span aria-hidden="true">{isSidebarCollapsed ? '›' : '‹'}</span>
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
                  {item.shortLabel}
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
          </header>

          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/stocks" element={<StocksPage accessToken={accessToken} />} />
            <Route path="/reports/new" element={<ReportGeneratePage accessToken={accessToken} />} />
            <Route path="/reports" element={<ReportsPage accessToken={accessToken} />} />
            <Route path="/reports/:id" element={<ReportDetailPage accessToken={accessToken} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </section>
      </main>
    </BrowserRouter>
  );
}
