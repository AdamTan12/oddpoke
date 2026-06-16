import type { PuzzleChoice } from '../../types/puzzle';

interface GuessResult {
  correct: boolean;
  answer_choice_id: string;
  guessed_choice_id: string;
}

interface Props {
  choice: PuzzleChoice;
  onGuess: (choiceId: string) => void;
  result: GuessResult | null;
  disabled: boolean;
}

export default function Option({ choice, onGuess, result, disabled }: Props) {
  let bg = 'transparent';
  let borderColor = '#e5e4e7';
  if (result) {
    bg = result.correct ? '#dcfce7' : '#fee2e2';
    borderColor = result.correct ? '#22c55e' : '#ef4444';
  }

  return (
    <div
      onClick={() => !disabled && onGuess(choice.id)}
      onMouseEnter={e => { if (!disabled && !result) (e.currentTarget as HTMLDivElement).style.borderColor = `var(--accent)`; }}
      onMouseLeave={e => { if (!disabled && !result) (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e4e7'; }}
      className="option-box"
      style={{
        background: bg,
        cursor: disabled ? 'default' : 'pointer',
        borderRadius: 12,
        border: `2px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxSizing: 'border-box',
        transition: 'border-color 0.15s, background 0.15s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <img src={choice.sprite_url} alt={choice.name} style={{ width: '55%', height: '55%', objectFit: 'contain' }} />
      <p style={{ margin: 0, fontWeight: 600, textTransform: 'capitalize', fontSize: 16 }}>{choice.name}</p>
    </div>
  );
}
