
export interface User {
  id: string;
  username: string;
  total_submissions: number;
  created_at: number;
}

export interface Submission {
  id: string;
  user_id: string;
  created_at: number;
  note?: string;
}

export interface LeaderboardEntry extends User {
  rank: number;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  submissions: Submission[];
}
