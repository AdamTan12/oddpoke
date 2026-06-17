import { useState } from 'react';
import { supabase } from '../lib/supabase';
import PokemonList, { type Pokemon } from './PokemonList';
import type { PuzzleChoice as PuzzleChoiceType } from '../types/puzzle';

interface Props {
  choice: PuzzleChoiceType;
  onSelect: (pokemon: Pokemon) => void;
  onRefresh: () => void;
}

export default function PuzzleChoice({ choice, onSelect, onRefresh }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleSelect(pokemon: Pokemon) {
    onSelect(pokemon);
    setPickerOpen(false);
  }

  async function handleIsAnswerChange(e: React.ChangeEvent<HTMLInputElement>) {
    await supabase.rpc('update_puzzle_choice', {
      p_id: choice.id,
      p_is_answer: e.target.checked,
    });
    onRefresh();
  }

  async function handleDelete() {
    await supabase.rpc('delete_puzzle_choice', { p_id: choice.id });
    onRefresh();
  }

  return (
    <div style={{ border: '2px solid var(--border)', borderRadius: 8, padding: 8, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', width: 250, height: 250, boxSizing: 'border-box', overflow: 'hidden' }}>
      {pickerOpen ? (
        <PokemonList onSelect={handleSelect} onCancel={() => setPickerOpen(false)} />
      ) : (
        <>
          <img src={choice.sprite_url} alt={choice.name} width={64} height={64} />
          <button onClick={() => setPickerOpen(true)}>{choice.name}</button>
          <label>
            <input
              type="checkbox"
              checked={choice.is_answer}
              onChange={handleIsAnswerChange}
            />
            Is Answer
          </label>
          <button onClick={handleDelete}>Delete</button>
        </>
      )}
    </div>
  );
}
