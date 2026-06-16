import { useState } from 'react';
import PuzzleMaker from '../components/PuzzleMaker';
import PuzzleCalendar from '../components/PuzzleCalendar';
import type { Puzzle } from '../types/puzzle';

export default function Admin() {
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);

  return (
    <div>
      <h1>Admin</h1>
      <PuzzleCalendar onPuzzleSelect={setSelectedPuzzle} />
      <PuzzleMaker puzzle={selectedPuzzle} onPuzzleChange={setSelectedPuzzle} />
    </div>
  );
}
