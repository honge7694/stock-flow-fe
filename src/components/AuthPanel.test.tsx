import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AuthPanel } from './AuthPanel';

describe('AuthPanel', () => {
  it('keeps the account field empty but logs in with the default id', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();

    render(
      <AuthPanel
        isLoading={false}
        user={null}
        onLogin={onLogin}
        onSignup={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('이메일 또는 ID')).toHaveValue('');

    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(onLogin).toHaveBeenCalledWith('honge7694@naver.com', 'password');
  });

  it('allows honge7694 to login without an email format', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();

    render(
      <AuthPanel
        isLoading={false}
        user={null}
        onLogin={onLogin}
        onSignup={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    await user.clear(screen.getByLabelText('이메일 또는 ID'));
    await user.type(screen.getByLabelText('이메일 또는 ID'), 'honge7694');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(onLogin).toHaveBeenCalledWith('honge7694', 'password');
  });

  it('keeps signup disabled for now', async () => {
    const user = userEvent.setup();
    const onSignup = vi.fn();

    render(
      <AuthPanel
        isLoading={false}
        user={null}
        onLogin={vi.fn()}
        onSignup={onSignup}
        onLogout={vi.fn()}
      />,
    );

    const signupButton = screen.getByRole('button', { name: '회원가입' });

    expect(signupButton).toBeDisabled();
    await user.click(signupButton);

    expect(onSignup).not.toHaveBeenCalled();
  });

  it('shows a clear login loading state and locks the form', () => {
    render(
      <AuthPanel
        isLoading
        user={null}
        onLogin={vi.fn()}
        onSignup={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    const loginButton = screen.getByRole('button', { name: '로그인 중...' });

    expect(loginButton).toBeDisabled();
    expect(loginButton).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByLabelText('이메일 또는 ID')).toBeDisabled();
    expect(screen.getByLabelText('비밀번호')).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('로그인 중...');
  });
});
