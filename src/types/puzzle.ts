export interface PuzzleChoice {
  id: string;
  name: string;
  sprite_url: string;
  is_answer: boolean;
}

export interface Puzzle {
  id: string;
  theme: string;
  choices: PuzzleChoice[];
}
