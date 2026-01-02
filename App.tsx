
import React, { useState, useEffect, useCallback } from 'react';
import { User, LeaderboardEntry } from './types';
import { storageService } from './services/storageService';
import { getGeminiInsights } from './services/geminiService';
import { Icons, APP_NAME } from './constants';

const Login: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      const user = storageService.getOrCreateUser(username.trim());
      onLogin(user);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="bg-indigo-600 p-4 rounded-2xl shadow-xl shadow-indigo-500/20">
        <Icons.Trophy className="w-12 h-12 text-white" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white">{APP_NAME}</h1>
        <p className="text-slate-400">Enter your username to start climbing the ranks.</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="text"
          placeholder="What's your username?"
          className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white text-lg transition-all"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg active:scale-[0.98]"
        >
          Get Started
        </button>
      </form>
    </div>
  );
};

const Dashboard: React.FC<{ user: User; onUpdate: () => void; onLogout: () => void }> = ({ user, onUpdate, onLogout }) => {
  const [insight, setInsight] = useState<string>('Loading AI insight...');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentRank = storageService.getRank(user.id);

  const fetchInsight = useCallback(async () => {
    const text = await getGeminiInsights(user.username, currentRank, user.total_submissions);
    setInsight(text || "No insights yet.");
  }, [user.username, currentRank, user.total_submissions]);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  const handleSubmission = () => {
    setIsSubmitting(true);
    setError(null);
    
    // Simulate some work or delay
    setTimeout(() => {
      const result = storageService.addSubmission(user.id);
      if (result.success) {
        onUpdate();
        // Refresh insight on milestone
        if ((result.user?.total_submissions || 0) % 5 === 0) {
            fetchInsight();
        }
      } else {
        setError(result.error || "Failed to submit.");
      }
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center text-indigo-400">
             <Icons.User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome back, {user.username}!</h2>
            <p className="text-slate-400 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                Rank #{currentRank}
              </span>
              •
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-600/20 text-indigo-400">
                {user.total_submissions} Submissions
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-slate-500 hover:text-slate-300 transition-colors text-sm font-medium underline underline-offset-4"
        >
          Change Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
          <Icons.Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500 opacity-20 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 space-y-4">
            <h3 className="text-xl font-semibold">Post a Submission</h3>
            <p className="text-indigo-100 text-sm opacity-90">Each post you share in the community counts as +1 point toward your leaderboard rank.</p>
            <button
              onClick={handleSubmission}
              disabled={isSubmitting}
              className={`flex items-center justify-center gap-2 w-full py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
            >
              {isSubmitting ? 'Submitting...' : <><Icons.Plus className="w-5 h-5" /> Add Submission</>}
            </button>
            {error && <p className="text-red-300 text-xs font-medium bg-red-900/40 p-2 rounded-lg text-center">{error}</p>}
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-8 rounded-3xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-500/10 p-2 rounded-lg">
                <Icons.TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold text-white">AI Momentum Coach</h3>
          </div>
          <p className="text-slate-300 italic text-lg leading-relaxed">
            "{insight}"
          </p>
        </div>
      </div>
    </div>
  );
};

const Leaderboard: React.FC<{ users: User[]; currentUserId: string | null }> = ({ users, currentUserId }) => {
  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden backdrop-blur-sm">
      <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Global Standings</h3>
        <span className="text-slate-500 text-sm">{users.length} Contributors</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Rank</th>
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold text-right">Submissions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.slice(0, 50).map((user, idx) => {
              const rank = idx + 1;
              const isMe = user.id === currentUserId;
              
              return (
                <tr key={user.id} className={`transition-colors group ${isMe ? 'bg-indigo-600/10' : 'hover:bg-slate-700/30'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        {rank === 1 && <span className="text-2xl">🥇</span>}
                        {rank === 2 && <span className="text-2xl">🥈</span>}
                        {rank === 3 && <span className="text-2xl">🥉</span>}
                        {rank > 3 && <span className="text-slate-400 font-mono">#{rank}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isMe ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className={`font-medium ${isMe ? 'text-indigo-400' : 'text-slate-200'}`}>
                        {user.username} {isMe && <span className="ml-1 text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full">YOU</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-slate-200 font-mono font-bold">{user.total_submissions}</span>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500 italic">
                  No submissions yet. Be the first to post!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(() => {
    const allUsers = storageService.getUsers();
    setUsers(allUsers);
    
    // Update local user state if logged in
    if (user) {
      const updatedUser = allUsers.find(u => u.id === user.id);
      if (updatedUser) setUser(updatedUser);
    }
  }, [user]);

  useEffect(() => {
    const lastUserId = localStorage.getItem('last_user_id');
    const allUsers = storageService.getUsers();
    setUsers(allUsers);

    if (lastUserId) {
      const found = allUsers.find(u => u.id === lastUserId);
      if (found) setUser(found);
    }
    setLoading(false);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('last_user_id', newUser.id);
    refreshData();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('last_user_id');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-900 pb-20 px-4 md:px-0">
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Icons.Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">{APP_NAME}</span>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-slate-400 text-sm font-medium">@{user.username}</span>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-8 space-y-12">
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            <Dashboard user={user} onUpdate={refreshData} onLogout={handleLogout} />
            <Leaderboard users={users} currentUserId={user.id} />
          </>
        )}
      </main>
      
      <footer className="max-w-4xl mx-auto px-4 pt-12 text-center text-slate-600 text-xs">
        <p>&copy; 2024 {APP_NAME}. Built with Gemini & React.</p>
      </footer>
    </div>
  );
};

export default App;
