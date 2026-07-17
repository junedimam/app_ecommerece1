'use client';

import React, { useState } from 'react';
import { UserProfile } from '../page';

interface AuthProps {
  onAuthSuccess: (token: string, user: UserProfile) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Authentication failed');
      
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Connection error to Auth cluster microservice');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#141414' }}>
      <div style={{ background: '#181818', padding: '3rem', borderRadius: '8px', border: '1px solid #333', width: '100%', maxWidth: '420px' }}>
        <h1 style={{ color: '#E50914', textAlign: 'center', marginBottom: '2rem', fontSize: '2.2rem', fontWeight: 'bold' }}>FLIXSTORE</h1>
        <h2 style={{ color: '#FFF', marginBottom: '1.5rem', fontSize: '1.2rem' }}>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
        
        {error && <div style={{ color: '#E50914', background: 'rgba(229,9,20,0.1)', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isSignUp && (
            <>
              <input type="text" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.75rem', background: '#333', border: 'none', borderRadius: '4px', color: '#FFF' }} />
              <input type="tel" placeholder="Phone Number" required value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '0.75rem', background: '#333', border: 'none', borderRadius: '4px', color: '#FFF' }} />
            </>
          )}
          <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.75rem', background: '#333', border: 'none', borderRadius: '4px', color: '#FFF' }} />
          <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.75rem', background: '#333', border: 'none', borderRadius: '4px', color: '#FFF' }} />
          
          <button type="submit" style={{ background: '#E50914', color: '#FFF', padding: '0.85rem', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
            {isSignUp ? 'Register Platform' : 'Sign In'}
          </button>
        </form>

        <p onClick={() => setIsSignUp(!isSignUp)} style={{ color: '#AAA', textAlign: 'center', marginTop: '1.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
          {isSignUp ? 'Already have an account? Sign In' : 'New to FlixStore? Sign up now'}
        </p>
      </div>
    </div>
  );
}