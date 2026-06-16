import Theme from './Theme';
import Choices from './Choices';
import CreatePuzzle from './CreatePuzzle';
import { supabase } from '../../lib/supabase';
import type { Puzzle } from '../../types/puzzle';

interface Props {
  puzzle: Puzzle | null;
  onPuzzleChange: (puzzle: Puzzle) => void;
  selectedDate: string;
}

export default function PuzzleMaker({ puzzle, onPuzzleChange, selectedDate }: Props) {
  if (!puzzle) return <CreatePuzzle onCreated={onPuzzleChange} publishDate={selectedDate} />;

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
