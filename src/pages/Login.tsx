import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/');
    });
  }, []);

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/');
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 32 }}>oddpokdle</h1>
          <p style={{ margin: 0, color: '#6b6375' }}>Sign in to track your streak</p>
        </div>
        <button
          onClick={handleGoogle}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px', borderRadius: 8, border: '1.5px solid #e5e4e7', background: '#fff', color: '#111', fontSize: 15, fontWeight: 500, cursor: 'pointer', width: '100%' }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={18} height={18} />
          Continue with Google
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#e5e4e7' }} />
          <span style={{ fontSize: 13, color: '#9ca3af' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#e5e4e7' }} />
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="email" style={{ fontSize: 14, fontWeight: 600 }}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e5e4e7', fontSize: 15, outline: 'none', boxSizing: 'border-box', width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="password" style={{ fontSize: 14, fontWeight: 600 }}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e5e4e7', fontSize: 15, outline: 'none', boxSizing: 'border-box', width: '100%' }}
            />
          </div>
          {error && <p style={{ margin: 0, color: '#ef4444', fontSize: 14 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '12px', borderRadius: 8, border: 'none', background: `var(--accent)`, color: '#fff', fontSize: 16, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 14, color: '#6b6375' }}>
          Don't have an account? <Link to="/register" style={{ color: `var(--accent)`, fontWeight: 600 }}>Register</Link>
        </p>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 14 }}>
          <Link to="/" style={{ color: '#6b6375' }}>Just want to play? Continue without an account →</Link>
        </p>
      </div>
    </div>
  );
}
