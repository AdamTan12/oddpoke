import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Puzzle } from '../../types/puzzle';

interface Props {
  puzzle: Puzzle;
}

export default function Theme({ puzzle }: Props) {
  const [theme, setTheme] = useState(puzzle.theme);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTheme(puzzle.theme);
  }, [puzzle.id]);

  async function handleSave() {
    setSaving(true);
    setError('');
    const { error } = await supabase.rpc('update_puzzle', {
      p_id: puzzle.id,
      p_theme: theme,
    });
    if (error) setError(error.message);
    setSaving(false);
  }

  return (
    <div>
      <h2>Theme</h2>
      <input
        type="text"
        value={theme}
        onChange={e => setTheme(e.target.value)}
      />
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
