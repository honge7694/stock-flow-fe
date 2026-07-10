import { type FormEvent, useState } from 'react';
import type { User } from '../types/report';

type AuthPanelProps = {
  isLoading: boolean;
  user: User | null;
  errorMessage?: string;
  onLogin: (email: string, password: string) => void;
  onSignup: (email: string, password: string) => void;
  onLogout: () => void;
};

const DEFAULT_LOGIN_ID = 'honge7694';

export function AuthPanel({ isLoading, user, errorMessage, onLogin, onSignup, onLogout }: AuthPanelProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [signupErrorMessage, setSignupErrorMessage] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignupErrorMessage(undefined);
    onLogin(email.trim() || DEFAULT_LOGIN_ID, password);
  }

  function handleSignup() {
    setSignupErrorMessage(undefined);

    if (!email.includes('@')) {
      setSignupErrorMessage('회원가입에는 이메일 형식의 계정이 필요합니다.');
      return;
    }

    onSignup(email, password);
  }

  return (
    <section className={user ? 'auth-panel account-panel' : 'auth-panel auth-panel-login'}>
      {user ? (
        <>
          <div className="account-summary">
            <span className="account-avatar" aria-hidden="true">
              {user.email.slice(0, 1).toUpperCase()}
            </span>
            <strong>{user.email}</strong>
          </div>
          <button type="button" className="secondary-button" onClick={onLogout}>
            로그아웃
          </button>
        </>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>계정 연결</h2>
          <label>
            <span>이메일 또는 ID</span>
            <input type="text" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <div className="button-row">
            <button type="submit" disabled={isLoading}>
              {isLoading ? '처리 중...' : '로그인'}
            </button>
            <button
              type="button"
              className="secondary-button"
              disabled
              onClick={handleSignup}
            >
              회원가입
            </button>
          </div>
          {signupErrorMessage || errorMessage ? <p className="form-error">{signupErrorMessage ?? errorMessage}</p> : null}
        </form>
      )}
    </section>
  );
}
