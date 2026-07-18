'use client';

import { useEffect, useState } from 'react';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function AppShell() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (jwt: string, profile: UserProfile) => {
    localStorage.setItem('auth_token', jwt);
    localStorage.setItem('auth_user', JSON.stringify(profile));
    setToken(jwt);
    setUser(profile);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return <AuthScreen onAuthSuccess={handleLoginSuccess} />;
  }

  return <Dashboard user={user} token={token} onLogout={handleLogout} />;
}