import { useState } from 'react';
import Puzzle from '../components/Puzzle';
import Profile from '../components/Profile';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [streak, setStreak] = useState<number | undefined>(undefined);

  async function handleSolve() {
    const session = await supabase.auth.getSession();
    if (session.data.session) {
      const { data } = await supabase.rpc('get_my_streak');
      setStreak(data ?? 0);
    } else {
      setStreak(parseInt(localStorage.getItem('streak') ?? '0', 10));
    }
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 16, left: 24, fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>
        oddpokdle
      </div>
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <Profile streak={streak} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Puzzle onSolve={handleSolve} />
      </div>
      <footer style={{ textAlign: 'center', padding: '16px 24px', fontSize: 12, color: '#9ca3af' }}>
        oddpokdle is an unofficial fan project and is not affiliated with, endorsed by, or connected to Nintendo, Game Freak, or The Pokémon Company. Pokémon and all related names are trademarks of Nintendo/Game Freak.
      </footer>
    </div>
  );
}
