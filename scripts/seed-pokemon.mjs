import { createClient } from '@supabase/supabase-js';

import 'dotenv/config';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = 'sprites';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function uploadSprite(id, spriteUrl) {
  const res = await fetch(spriteUrl);
  if (!res.ok) throw new Error(`Failed to fetch sprite for #${id}`);
  const buffer = await res.arrayBuffer();
  const path = `${id}.png`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: 'image/png', upsert: true });

  if (error) throw new Error(`Storage upload failed for #${id}: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function seedPokemon() {
  console.log('Fetching full Pokémon list...');
  const list = await fetchJSON('https://pokeapi.co/api/v2/pokemon?limit=10000');
  const total = list.results.length;
  console.log(`Found ${total} Pokémon. Starting seed...`);

  for (let i = 0; i < list.results.length; i++) {
    const entry = list.results[i];
    try {
      const pokemon = await fetchJSON(entry.url);
      const id = pokemon.id;
      const name = pokemon.name;
      const types = pokemon.types.map(t => t.type.name);
      const rawSprite =
        pokemon.sprites.other?.['official-artwork']?.front_default ||
        pokemon.sprites.front_default;

      if (!rawSprite) {
        console.warn(`[${i + 1}/${total}] #${id} ${name}: no sprite, skipping`);
        continue;
      }

      // Check if DB record already exists
      const { data: existing } = await supabase
        .from('pokemon')
        .select('id, sprite_url')
        .eq('id', id)
        .maybeSingle();

      // Check if sprite already exists in storage
      const { data: existingFile } = await supabase.storage
        .from(BUCKET)
        .list('', { search: `${id}.png` });

      const spriteExists = existingFile?.some(f => f.name === `${id}.png`);
      const spriteUrl = spriteExists
        ? supabase.storage.from(BUCKET).getPublicUrl(`${id}.png`).data.publicUrl
        : await uploadSprite(id, rawSprite);

      if (existing) {
        if (!spriteExists) {
          // Record exists but sprite was missing — update the sprite_url
          const { error } = await supabase
            .from('pokemon')
            .update({ sprite_url: spriteUrl })
            .eq('id', id);
          if (error) throw new Error(error.message);
          console.log(`[${i + 1}/${total}] #${id} ${name}: sprite was missing, uploaded and updated ✓`);
        } else {
          console.log(`[${i + 1}/${total}] #${id} ${name}: already complete, skipping`);
        }
        continue;
      }

      const { error } = await supabase.rpc('create_pokemon', {
        p_id: id,
        p_name: name,
        p_sprite_url: spriteUrl,
        p_types: types,
      });

      if (error) throw new Error(error.message);

      console.log(`[${i + 1}/${total}] #${id} ${name} (${types.join(', ')}) ✓`);
    } catch (err) {
      console.error(`[${i + 1}/${total}] ${entry.name}: FAILED — ${err.message}`);
    }
  }

  console.log('Done!');
}

seedPokemon();
