export enum GamePhase {
  MENU = 'MENU',
  PLAYER_SET_SECRET = 'PLAYER_SET_SECRET',
  AI_THINKING_GUESS = 'AI_THINKING_GUESS', // AI is trying to guess player's number
  REVEAL_AI_GUESS = 'REVEAL_AI_GUESS',     // Show what AI guessed and calc score
  AI_SETTING_SECRET = 'AI_SETTING_SECRET', // AI is picking a number
  PLAYER_GUESSING = 'PLAYER_GUESSING',     // Player guesses AI's number
  REVEAL_PLAYER_GUESS = 'REVEAL_PLAYER_GUESS', // Show what AI had and calc score
  GAME_OVER = 'GAME_OVER'
}

export interface GameState {
  phase: GamePhase;
  playerScore: number;
  computerScore: number;
  playerSecret: number | null;
  computerSecret: number | null;
  lastGuess: number | null; // The guess made by the active player
  turnCount: number;
  message: string;
  winner: 'PLAYER' | 'COMPUTER' | null;
  isKnockout: boolean; // New flag for instant win
}

export const INITIAL_SCORE = 1000;
export const MAX_NUMBER = 100;