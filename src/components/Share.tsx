import { useState } from 'react';

interface Guess {
  correct: boolean;
}

interface Props {
  guesses: Guess[];
  streak: number;
}

export default function Share({ guesses, streak }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const emojis = guesses.map(g => g.correct ? '🟩' : '🟥').join('');
  const gameUrl = window.location.origin;
  const shareText = `oddpokdle\n${emojis}\n🔥 ${streak}\n${gameUrl}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ fontSize: 18, padding: '10px 24px', borderRadius: 24, cursor: 'pointer' }}>
        🔗 Share
      </button>
      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: 'var(--card-bg)', borderRadius: 16, padding: 40,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 20, minWidth: 340, color: 'var(--card-text)',
          }}>
            <button onClick={() => setOpen(false)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: 'var(--card-text)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            <h2 style={{ margin: 0, fontSize: 28 }}>oddpokdle</h2>
            <p style={{ fontSize: 40, margin: 0 }}>{emojis}</p>
            <p style={{ margin: 0, fontSize: 18 }}>🔥 {streak}</p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 16 }}>{gameUrl}</p>
            <button onClick={handleCopy} style={{ fontSize: 16, padding: '10px 28px', borderRadius: 24, cursor: 'pointer', background: 'var(--accent)', border: 'none', color: '#fff' }}>{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        </div>
      )}
    </>
  );
}
