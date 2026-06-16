import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Puzzle } from '../../types/puzzle';

interface Props {
  onCreated: (puzzle: Puzzle) => void;
  publishDate: string;
}

export default function CreatePuzzle({ onCreated, publishDate }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    setLoading(true);
    setError('');

    const { data: id, error } = await supabase.rpc('create_puzzle', {
      p_theme: '',
      p_publish_date: publishDate,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const { data: puzzle } = await supabase.rpc('get_puzzle_by_id', { p_id: id });
    if (puzzle) onCreated(puzzle);
    setLoading(false);
  }

  return (
    <div>
      <button onClick={handleCreate} disabled={loading}>
        {loading ? 'Creating...' : 'Create Puzzle'}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
