import { Player, Faceoff } from '../interfaces/faceoff';

export interface RLPlayer {
    name: string;
    custom_fields: {
      in_game_nimimerkki: string;
      rank: string;
      rl_tracker_link: string;
      varapelaaja: boolean;
    };
  }

export interface FaceoffResult {
    faceoffWins: number;
    faceoffLosses: number;
    gamesWon: number;
    gamesLost: number;
    cols: number;
    rows: number;
    gamesPlayed: number;
    winPercentage: string;
  }

export interface Stats { total: Player[]; average: Player[]; }

export interface TeamInformation {
    playerStats: Stats;
    teamStats: Faceoff[];
}
