import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: {
    logout: vi.fn(),
  },
}));

describe('AuthContext', () => {
  let userLogoutListener;

  beforeEach(() => {
    vi.clearAllMocks();
    authService.logout.mockResolvedValue(undefined);
    window.localStorage.removeItem.mockClear();
    window.localStorage.setItem('token', 'token');
    window.localStorage.setItem('user', JSON.stringify({ _id: '1', email: 'a@b.com' }));
    userLogoutListener = vi.fn();
    window.addEventListener('userLogout', userLogoutListener);
  });

  afterEach(() => {
    window.removeEventListener('userLogout', userLogoutListener);
  });

  it('logout clears user state', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logout removes token and user from localStorage', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('cart');
  });

  it('logout dispatches userLogout event', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(userLogoutListener).toHaveBeenCalled();
  });
});
