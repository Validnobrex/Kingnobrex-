
// STORAGE_KEY is located in constants.tsx, User and Submission are in types.ts
import { User, Submission } from '../types';
import { STORAGE_KEY } from '../constants';

interface LocalDB {
  users: User[];
  submissions: Submission[];
}

const getDB = (): LocalDB => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { users: [], submissions: [] };
};

const saveDB = (db: LocalDB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const storageService = {
  getUsers: (): User[] => {
    return getDB().users.sort((a, b) => b.total_submissions - a.total_submissions);
  },

  getOrCreateUser: (username: string): User => {
    const db = getDB();
    const existing = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (existing) return existing;

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      total_submissions: 0,
      created_at: Date.now()
    };

    db.users.push(newUser);
    saveDB(db);
    return newUser;
  },

  addSubmission: (userId: string): { success: boolean; user?: User; error?: string } => {
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return { success: false, error: "User not found" };

    // Anti-spam check: prevent multiple submissions within 2 seconds
    const lastSub = db.submissions
      .filter(s => s.user_id === userId)
      .sort((a, b) => b.created_at - a.created_at)[0];
    
    if (lastSub && Date.now() - lastSub.created_at < 2000) {
      return { success: false, error: "Please wait a moment before submitting again." };
    }

    const newSub: Submission = {
      id: crypto.randomUUID(),
      user_id: userId,
      created_at: Date.now()
    };

    db.submissions.push(newSub);
    db.users[userIndex].total_submissions += 1;
    
    saveDB(db);
    return { success: true, user: db.users[userIndex] };
  },

  getRank: (userId: string): number => {
    const users = storageService.getUsers();
    const rank = users.findIndex(u => u.id === userId) + 1;
    return rank;
  }
};
