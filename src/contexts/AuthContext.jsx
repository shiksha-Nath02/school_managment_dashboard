import { createContext, useContext, useState, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

// ⚡ Flip to false once your backend is ready
const DEV_MODE = true;

const MOCK_USERS = {
  admin:   { id: 1, name: 'Admin User',       role: 'admin' },
  teacher: { id: 2, name: 'Mrs. Priya Gupta', role: 'teacher' },
  student: { id: 3, name: 'Rahul Sharma',     role: 'student' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (role, credentials) => {
    setLoading(true);
    setError(null);
    try {
      // 👇 THIS BLOCK GOES HERE — inside login()
      if (DEV_MODE) {
        const mockUser = MOCK_USERS[role];
        localStorage.setItem('token', 'dev-token-123');
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        setLoading(false);
        return mockUser;
      }

      const data = await authService.login(role, credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;