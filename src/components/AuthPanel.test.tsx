import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AuthPanel } from './AuthPanel';

describe('AuthPanel', () => {
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

  it('requires an email-like value for signup', async () => {
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

    await user.clear(screen.getByLabelText('이메일 또는 ID'));
    await user.type(screen.getByLabelText('이메일 또는 ID'), 'honge7694');
    await user.click(screen.getByRole('button', { name: '회원가입' }));

    expect(onSignup).not.toHaveBeenCalled();
    expect(screen.getByText('회원가입에는 이메일 형식의 계정이 필요합니다.')).toBeInTheDocument();
  });
});
