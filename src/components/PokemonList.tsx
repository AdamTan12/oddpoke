import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Pokemon {
  id: number;
  name: string;
  sprite_url: string;
  types: string[];
}

interface Props {
  onSelect?: (pokemon: Pokemon) => void;
  onCancel?: () => void;
}

export default function PokemonList({ onSelect, onCancel }: Props) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.rpc('list_pokemon').then(({ data, error }) => {
      if (error) setError(error.message);
      else setPokemon(data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = pokemon.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
        {onCancel && <button onClick={onCancel}>✕</button>}
      </div>
      <ul style={{ flex: 1, width: '100%', overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none' }}>
        {filtered.map(p => (
          <li key={p.id}>
            {onSelect ? (
              <button onClick={() => onSelect(p)}>{p.name}</button>
            ) : (
              p.name
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
