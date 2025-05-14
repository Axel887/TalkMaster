import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = () =>
    fetch(`${import.meta.env.VITE_API_HOST}/users/me`, {
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    fetch(`${import.meta.env.VITE_API_HOST}/users/logout`, {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      setUser(null);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        logout,
        refetchUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
