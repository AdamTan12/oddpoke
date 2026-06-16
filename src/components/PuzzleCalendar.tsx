import { useEffect, useRef, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '../lib/supabase';
import type { Puzzle } from '../types/puzzle';

interface PuzzleListItem {
  id: string;
  theme: string;
  publish_date: string;
}

interface Props {
  onPuzzleSelect: (puzzle: Puzzle | null) => void;
}

export default function PuzzleCalendar({ onPuzzleSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [puzzles, setPuzzles] = useState<PuzzleListItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.rpc('list_puzzles').then(({ data }) => {
      if (data) setPuzzles(data);
    });
    handleDateClick(new Date());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const puzzleDates = new Set(
    puzzles.map(p => {
      const [year, month, day] = p.publish_date.split('-').map(Number);
      return new Date(year, month - 1, day).toDateString();
    })
  );

  async function handleDateClick(date: Date) {
    const formatted = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const { data } = await supabase.rpc('get_puzzle_by_date', { p_date: formatted });
    onPuzzleSelect(data ?? null);
    setSelectedDate(date);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <button onClick={() => setOpen(o => !o)}>Puzzle Calendar</button>
      {selectedDate && <span>{selectedDate.toLocaleDateString()}</span>}
      {open && (
        <div style={{ position: 'absolute', zIndex: 10, marginTop: 8 }}>
          <Calendar
            value={selectedDate}
            onClickDay={handleDateClick}
            tileClassName={({ date, view }) => {
              if (view !== 'month') return null;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const twoWeeks = new Date(today);
              twoWeeks.setDate(today.getDate() + 14);
              if (puzzleDates.has(date.toDateString())) return 'puzzle-date-has';
              if (date < today) return 'puzzle-date-missing';
              if (date <= twoWeeks) return 'puzzle-date-missing';
              return null;
            }}
          />
        </div>
      )}
    </div>
  );
}
