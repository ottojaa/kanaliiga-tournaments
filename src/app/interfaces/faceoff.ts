export interface Faceoff {
  matchId: string;
  date: string;
  participants: string[];
  matches: Match[];
}

export interface Match {
  date: string;
  matchIndex: number;
  teams: Team[];
}

export interface Team {
  score: number;
  teamId: number;
  name: string;
  result: string;
  players: Player[];
}

export interface Player {
  id: string;
  team: number;
  name: string;
  score: number;
  goals: number;
  assists: number;
  shots: number;
  saves: number;
  teamName: string;
}
