import { PlayerStats } from '../faceoff.service';
import { Participant } from './faceoff';

export interface Tournament {
  id: string;
  discipline: string;
  name: string;
  full_name: string;
  status: string;
  description?: string;
  scheduled_date_start: string;
  scheduled_date_end: string;
  timezone: string;
  public: boolean;
  size: number;
  online: boolean;
  location: string;
  country: string;
  platforms: string[];
  logo: {
    logo_small: string;
    logo_medium: string;
    logo_large: string;
    original: string;
  };
  registration_enabled: boolean;
  registration_opening_datetime: string;
  registration_closing_datetime: string;
}

export interface TeamParticipant {
  id: string;
  name: string;
  custom_fields: {
    joukkueen_nimi: string;
    kapteeni_discord: string;
    organisaation_nimi: string;
    organisaation_ytunnus: string;
    varakapteeni_discord: string;
  };
  lineup: Lineup[];
}

export interface Lineup {
  name: string;
  custom_fields: {
    in_game_nimimerkki: string;
    rank: string;
    rl_tracker_link: string;
    varapelaaja: string;
    steam_id?: string;
  };
}

export interface TeamRanking {
  group_id: string;
  id: string;
  participant: TeamParticipant;
  points: number;
  position: number;
  properties: {
    draws: number;
    forfeits: number;
    losses: number;
    played: number;
    score_against: number;
    score_difference: number;
    score_for: number;
    wins: number;
  };
}

export interface TeamTableProperties {
  scoreFor: number;
  scoreAgainst: number;
  played: number;
  wins: number;
  losses: number;
  forfeits: number;
  id: string;
  name: string;
}

export interface State {
  teamStats: TeamRanking[];
  playerStats: PlayerStats[];
  groups: Group[][];
  faceoffIds: string[];
  filters: Filter[];
  stageData: any[];
  tournaments: any[];
}

export interface Filter {
  id: string;
  name: string;
  checked: boolean;
}

export interface Group {
  id: string;
  round_id: string;
  group_id: string;
  played_at: string;
  status: string;
  number: number;
  stage_id: string;
  opponents: Participant[];
}

export interface Stage {
  id: string;
  name: string;
}

export interface Tournament {
  id: string;
  name: string;
}
