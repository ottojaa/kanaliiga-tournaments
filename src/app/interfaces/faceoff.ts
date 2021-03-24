export interface Faceoff {
  matchId: string;
  date: string;
  participants: Participant[];
  matches: Match[];
  stageId: string;
  tournamentId: string;
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
  onlineId: string;
  team: number;
  name: string;
  score: number;
  goals: number;
  assists: number;
  shots: number;
  saves: number;
  teamName: string;
  shootingPercentage: number;
  gamesPlayed: number;
}

export interface Participant {
  forfeit: string;
  number: number;
  position: number;
  rank: number | null;
  result: 'win' | 'loss';
  score: number;
  participant: {
    id: string;
    name: string;
  };
}
export interface PlayerOverviewRepresentation {
  team: number;
  onlineId: string;
  teamName: string;
  name: string;
  score: string;
  assists: string;
  shots: string;
  goals: string;
  shootingPercentage: string;
}

export type ParticipantInformation = Omit<Participant, 'participant' | 'position' | 'number' | 'forfeit' | 'rank'> & { teamName: string };
export type PlayerListForEachMatch = Player[][];
export interface TeamOverview { players: PlayerOverviewRepresentation[]; participant: ParticipantInformation; }
export interface PlayerOverviewsPerTeam { teamOne: TeamOverview; teamTwo: TeamOverview; players: PlayerOverviewRepresentation[]; }
export interface MatchStatistics  { teamOne: Partial<Team>; teamTwo: Partial<Team>; players: Player[]; }
