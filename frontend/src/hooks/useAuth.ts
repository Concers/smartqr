import { useState, useEffect, useCallback } from 'react';

type User = {
  id: string;
  email: string;
  name?: string;
  permissions?: any;
  type?: 'user' | 'subuser';
  parentUserId?: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
};

function getAuthState(): AuthState {
  try {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

function setAuthState(state: AuthState) {
  if (state.token) localStorage.setItem('token', state.token);
  else localStorage.removeItem('token');
  if (state.user) localStorage.setItem('user', JSON.stringify(state.user));
  else localStorage.removeItem('user');
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(getAuthState);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        setState(getAuthState());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (token: string, user: User) => {
    const newState = { token, user };
    setAuthState(newState);
    setState(newState);
  };

  const logout = () => {
    const newState = { token: null, user: null };
    setAuthState(newState);
    setState(newState);
  };

  return { 
    ...state, 
    login, 
    logout, 
    isAuthenticated: !!state.token,
    isSubUser: state.user?.type === 'subuser',
    hasPermission: useCallback((permission: string) => {
      if (!state.user?.permissions) return false;
      return state.user.permissions[permission] === true;
    }, [state.user?.permissions]),
    canManageSubUsers: useCallback(() => {
      // Normal users can always manage sub-users
      if (state.user?.type !== 'subuser') return true;
      // Sub-users need subuser_manage permission
      return state.user?.permissions?.subuser_manage === true;
    }, [state.user?.type, state.user?.permissions])
  };
}
