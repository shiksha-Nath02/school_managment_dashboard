import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USERS = {
  admin:   { id: 1, name: 'Admin User',   email: 'admin@school.com',   role: 'admin' },
  teacher: { id: 2, name: 'Test Teacher', email: 'teacher@school.com', role: 'teacher' },
  student: { id: 3, name: 'Aarav Sharma', email: 'aarav@school.com',   role: 'student' },
};

export function AuthProvider({ children }) {
  // Default to admin — change this to 'teacher' or 'student' to test other portals
  const [user, setUser] = useState(DEFAULT_USERS.admin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (role, credentials) => {
    setUser(DEFAULT_USERS[role] || DEFAULT_USERS.admin);
    return DEFAULT_USERS[role];
  }, []);

  const logout = useCallback(() => {
    setUser(DEFAULT_USERS.admin);
  }, []);

  const switchRole = useCallback((role) => {
    setUser(DEFAULT_USERS[role]);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, switchRole, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export default AuthContext;
