import type { Profile } from "./user";

export type MatchStatus = "open" | "full" | "cancelled" | "finished";

export interface Match {
  id: string;
  field_id: string;
  complex_id: string;
  starts_at: string; // ISO timestamp
  duration_minutes: number;
  capacity: number;
  status: MatchStatus;
  created_by: string;
  created_at: string;
}

export interface MatchPlayer {
  id: string;
  match_id: string;
  player_id: string;
  joined_at: string;
  profile?: Profile;
}

export interface WaitingListEntry {
  id: string;
  match_id: string;
  player_id: string;
  requested_at: string;
  profile?: Profile;
}

export interface MatchWithDetails extends Match {
  field: {
    id: string;
    name: string;
    surface: string | null;
  };
  complex: {
    id: string;
    name: string;
  };
  players: MatchPlayer[];
  waiting_list: WaitingListEntry[];
}

export interface CreateMatchInput {
  field_id: string;
  complex_id: string;
  starts_at: string;
  duration_minutes?: number;
  capacity?: number;
}
