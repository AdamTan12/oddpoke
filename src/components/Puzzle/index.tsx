import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Option from './Option';
import Share from '../Share';
import type { Puzzle as PuzzleType } from '../../types/puzzle';

interface GuessResult {
  correct: boolean;
  answer_choice_id: string;
  guessed_choice_id: string;
  theme: string;
}

interface LocalGuess {
  choice_id: string;
  correct: boolean;
}

function getLocalGuesses(puzzleId: string): LocalGuess[] {
  try {
    return JSON.parse(localStorage.getItem(`puzzle_${puzzleId}`) ?? '[]');
  } catch {
    return [];
  }
}

function saveLocalGuess(puzzleId: string, guess: LocalGuess) {
  const existing = getLocalGuesses(puzzleId);
  localStorage.setItem(`puzzle_${puzzleId}`, JSON.stringify([...existing, guess]));
}

function checkLocalStreak() {
  const lastSolved = localStorage.getItem('last_solved_date');
  if (!lastSolved) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('en-CA');

  if (lastSolved !== yesterdayStr && lastSolved !== new Date().toLocaleDateString('en-CA')) {
    localStorage.setItem('streak', '0');
  }
}

function updateLocalStreak() {
  const today = new Date().toLocaleDateString('en-CA');
  const lastSolved = localStorage.getItem('last_solved_date');
  const streak = parseInt(localStorage.getItem('streak') ?? '0', 10);

  if (lastSolved === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('en-CA');

  const newStreak = lastSolved === yesterdayStr ? streak + 1 : 1;
  localStorage.setItem('streak', String(newStreak));
  localStorage.setItem('last_solved_date', today);
}

interface Props {
  onSolve?: () => void;
}

export default function Puzzle({ onSolve }: Props) {
  const [puzzle, setPuzzle] = useState<PuzzleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [theme, setTheme] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const authed = !!data.session;
      setLoggedIn(authed);

      supabase.rpc('get_today_puzzle').then(({ data: puzzleData, error }) => {
        if (error) { setError(error.message); setLoading(false); return; }
        if (!puzzleData) { setLoading(false); return; }
        setPuzzle(puzzleData);

        if (authed) {
          supabase.rpc('check_my_streak');
          supabase.rpc('get_my_attempts', { p_puzzle_id: puzzleData.id }).then(({ data: attempts }) => {
            if (attempts?.length) {
              setGuesses(attempts.map((a: { choice_id: string; correct: boolean }) => ({
                correct: a.correct,
                guessed_choice_id: a.choice_id,
                answer_choice_id: '',
                theme: '',
              })));

              const alreadySolved = attempts.some((a: { correct: boolean }) => a.correct);
              if (alreadySolved) {
                const today = new Date().toLocaleDateString('en-CA');
                supabase.rpc('get_puzzle_by_date', { p_date: today }).then(({ data: full }) => {
                  if (full?.theme) setTheme(full.theme);
                });
                supabase.rpc('get_my_streak').then(({ data: s }) => setStreak(s ?? 0));
              }
            }
            setLoading(false);
          });
        } else {
          checkLocalStreak();
          const local = getLocalGuesses(puzzleData.id);
          if (local.length) {
            setGuesses(local.map(g => ({
              correct: g.correct,
              guessed_choice_id: g.choice_id,
              answer_choice_id: '',
              theme: '',
            })));

            const alreadySolved = local.some(g => g.correct);
            if (alreadySolved) {
              const today = new Date().toLocaleDateString('en-CA');
              supabase.rpc('get_puzzle_by_date', { p_date: today }).then(({ data: full }) => {
                if (full?.theme) setTheme(full.theme);
              });
              setStreak(parseInt(localStorage.getItem('streak') ?? '0', 10));
            }
          }
          setLoading(false);
        }
      });
    });
  }, []);

  async function handleGuess(choiceId: string) {
    if (!puzzle) return;
    if (guesses.some(g => g.guessed_choice_id === choiceId)) return;

    const rpc = loggedIn ? 'submit_guess' : 'submit_guess_no_log';
    const { data, error } = await supabase.rpc(rpc, {
      p_puzzle_id: puzzle.id,
      p_choice_id: choiceId,
    });

    if (error) { setError(error.message); return; }

    if (!loggedIn) {
      saveLocalGuess(puzzle.id, { choice_id: choiceId, correct: data.correct });
      if (data.correct) updateLocalStreak();
    }

    setGuesses(prev => [...prev, { ...data, guessed_choice_id: choiceId }]);
    if (data.correct) {
      setTheme(data.theme);
      onSolve?.();
      if (loggedIn) {
        const { data: s } = await supabase.rpc('get_my_streak');
        setStreak(s ?? 0);
      } else {
        setStreak(parseInt(localStorage.getItem('streak') ?? '0', 10));
      }
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!puzzle) return <p>No puzzle today.</p>;

  const solved = guesses.some(g => g.correct);

  const cols = Math.min(puzzle.choices?.length ?? 0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, maxWidth: 900, width: '100%', padding: '0 24px', boxSizing: 'border-box' }}>
      <p style={{ margin: 0, fontSize: 18, color: '#6b6375' }}>Which Pokémon doesn't belong?</p>
      {theme && <h2 style={{ margin: 0 }}>{theme}</h2>}
      <div className={`puzzle-grid cols-${cols}`}>
        {puzzle.choices?.map(choice => (
          <Option
            key={choice.id}
            choice={choice}
            onGuess={handleGuess}
            result={guesses.find(g => g.guessed_choice_id === choice.id) ?? null}
            disabled={solved}
          />
        ))}
      </div>
      {solved && (
        <div style={{ marginTop: 8 }}>
          <Share guesses={guesses} streak={streak} />
        </div>
      )}
    </div>
  );
}
