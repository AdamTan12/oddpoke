import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Puzzle {
  id: string;
  theme: string;
  publish_date: string;
}

export default function PuzzleList() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.rpc('list_puzzles').then(({ data, error }) => {
      if (error) setError(error.message);
      else setPuzzles(data ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (puzzles.length === 0) return <p>No puzzles yet.</p>;

  return (
    <ul>
      {puzzles.map(puzzle => (
        <li key={puzzle.id}>
          {new Date(puzzle.publish_date).toLocaleDateString()}
        </li>
      ))}
    </ul>
  );
}
