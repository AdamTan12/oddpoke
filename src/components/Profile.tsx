import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Stats {
  streak: number;
}

interface Props {
  streak?: number;
}

export default function Profile({ streak: streakProp }: Props) {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  async function handleOpen() {
    setOpen(o => !o);
    if (loggedIn && !stats) {
      const { data: streak } = await supabase.rpc('get_my_streak');
      setStats({ streak: streak ?? 0 });
    } else if (!loggedIn && !stats) {
      const streak = parseInt(localStorage.getItem('streak') ?? '0', 10);
      setStats({ streak });
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={handleOpen} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 1 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, zIndex: 10, borderRadius: 12, padding: '24px 20px', width: 140, background: '#1e1e2e', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {loggedIn && (
            stats || streakProp !== undefined ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 32 }}>🔥</span>
                <span style={{ fontSize: 24, fontWeight: 700 }}>{streakProp ?? stats?.streak}</span>
              </div>
            ) : (
              <p style={{ margin: 0, color: '#aaa' }}>Loading...</p>
            )
          )}
          {loggedIn ? (
            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #444', color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 14 }}>Logout</button>
          ) : (
            <button onClick={() => navigate('/login')} style={{ background: `var(--accent)`, border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 14 }}>Login</button>
          )}
        </div>
      )}
    </div>
  );
}
