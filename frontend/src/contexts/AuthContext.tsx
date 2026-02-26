import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, AuthUser } from '../services/api';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  registerFaceId: () => Promise<void>;
  loginWithFaceId: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.auth.me()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const { token, user: u } = await api.auth.login(username, password);
    localStorage.setItem('auth_token', token);
    setUser(u);
  };

  const loginAsDemo = () => login('demo', 'demo');

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    window.location.href = '/login';
  };

  const registerFaceId = async () => {
    const { startRegistration } = await import('@simplewebauthn/browser');
    const options = await api.auth.webAuthnRegistrationOptions();
    const credential = await startRegistration({ optionsJSON: options });
    const result = await api.auth.webAuthnRegistrationVerify(credential);
    if (!result.verified) throw new Error('Registration failed');
  };

  const loginWithFaceId = async () => {
    const { startAuthentication } = await import('@simplewebauthn/browser');
    const options = await api.auth.webAuthnAuthOptions('owner');
    const response = await startAuthentication({ optionsJSON: options });
    const { token, user: u } = await api.auth.webAuthnAuthVerify('owner', response);
    localStorage.setItem('auth_token', token);
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginAsDemo, logout, registerFaceId, loginWithFaceId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
