import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import PuzzleChoice from '../PuzzleChoice';
import PokemonList, { type Pokemon } from '../PokemonList';
import type { Puzzle } from '../../types/puzzle';

interface Props {
  puzzle: Puzzle;
  onRefresh: () => void;
}

export default function Choices({ puzzle, onRefresh }: Props) {
  const [addingOpen, setAddingOpen] = useState(false);

  async function handleUpdate(choiceId: string, pokemon: Pokemon) {
    await supabase.rpc('update_puzzle_choice', {
      p_id: choiceId,
      p_pokemon_id: pokemon.id,
    });
    onRefresh();
  }

  async function handleAdd(pokemon: Pokemon) {
    await supabase.rpc('create_puzzle_choice', {
      p_puzzle_id: puzzle.id,
      p_pokemon_id: pokemon.id,
    });
    setAddingOpen(false);
    onRefresh();
  }

  return (
    <div>
      <h2>Choices</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
      {puzzle.choices?.map(choice => (
        <PuzzleChoice
          key={choice.id}
          choice={choice}
          onSelect={pokemon => handleUpdate(choice.id, pokemon)}
          onRefresh={onRefresh}
        />
      ))}
      </div>
      <div style={{ border: '2px solid var(--border)', borderRadius: 8, padding: 8, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', width: 250, height: 250, boxSizing: 'border-box', overflow: 'hidden' }}>
        {addingOpen ? (
          <PokemonList onSelect={handleAdd} onCancel={() => setAddingOpen(false)} />
        ) : (
          <button onClick={() => setAddingOpen(true)}>Add Choice</button>
        )}
      </div>
    </div>
  );
}
