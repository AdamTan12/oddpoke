import Theme from './Theme';
import Choices from './Choices';
import CreatePuzzle from './CreatePuzzle';
import { supabase } from '../../lib/supabase';
import type { Puzzle } from '../../types/puzzle';

interface Props {
  puzzle: Puzzle | null;
  onPuzzleChange: (puzzle: Puzzle) => void;
}

export default function PuzzleMaker({ puzzle, onPuzzleChange }: Props) {
  if (!puzzle) return <CreatePuzzle onCreated={onPuzzleChange} />;

  async function handleRefresh() {
    const { data } = await supabase.rpc('get_puzzle_by_id', { p_id: puzzle!.id });
    if (data) onPuzzleChange(data);
  }

  return (
    <div>
      <Theme puzzle={puzzle} />
      <Choices puzzle={puzzle} onRefresh={handleRefresh} />
    </div>
  );
}
