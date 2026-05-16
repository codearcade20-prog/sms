import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, Search, Loader2 } from 'lucide-react';
import { statsAPI } from '../utils/api';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await statsAPI.getLeaderboard();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="text-indigo-500 animate-spin" size={48} />
      </div>
    );
  }

  // Reorder for podium (2, 1, 3)
  const podium = [
    users[1] || null,
    users[0] || null,
    users[2] || null
  ];

  const others = users.slice(3);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      {/* Header section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Performance Leaderboard</h2>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">Celebrating the top contributors driving ProPulse forward this month.</p>
      </div>

      {/* Podium */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-2 pt-20">
        {podium.map((user, idx) => {
          if (!user) return null;
          const isFirst = idx === 1;
          const isSecond = idx === 0;
          const rank = isFirst ? 1 : isSecond ? 2 : 3;
          
          return (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex flex-col items-center ${isFirst ? 'order-1 md:order-2 z-10' : isSecond ? 'order-2 md:order-1' : 'order-3'}`}
            >
              <div className="relative mb-4">
                {isFirst && <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-500 w-10 h-10 animate-bounce" />}
                <div className={`rounded-full border-4 p-1 bg-white ${isFirst ? 'w-28 h-28 border-yellow-400 shadow-xl shadow-yellow-100' : isSecond ? 'w-20 h-20 border-slate-200 shadow-lg' : 'w-16 h-16 border-orange-300 shadow-md'}`}>
                  <img src={user.image?.startsWith('data:image') ? user.image : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.image || user.name}`} className="rounded-full" alt="" />
                </div>
                <div className={`absolute -top-3 -right-3 rounded-full flex items-center justify-center font-black ${
                  isFirst ? 'w-10 h-10 bg-yellow-400 text-yellow-950 text-xl' : 
                  isSecond ? 'w-8 h-8 bg-slate-200 text-slate-700' : 'w-7 h-7 bg-orange-300 text-orange-950 text-xs'
                }`}>
                  {rank}
                </div>
              </div>
              <div className={`bg-white shadow-sm border border-slate-200 flex flex-col items-center justify-center rounded-t-3xl border-b-0 ${
                isFirst ? 'w-52 h-52 bg-indigo-50/50 border-indigo-100' : isSecond ? 'w-44 h-40' : 'w-40 h-32'
              }`}>
                <span className={`text-slate-900 font-bold ${isFirst ? 'text-lg font-black' : ''}`}>{user.name}</span>
                <span className={`text-indigo-600 font-black ${isFirst ? 'text-2xl' : 'text-xl'}`}>{user.points}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">{user.department?.name || 'No Dept'}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* List section */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-slate-900">Full Rankings</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search employee..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {others.map((user, idx) => (
            <div key={user.id || user.name} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
              <div className="w-8 text-center font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">{idx + 4}</div>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 bg-white">
                <img src={user.image?.startsWith('data:image') ? user.image : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.image || user.name}`} alt="" />
              </div>
              <div className="flex-1">
                <p className="text-slate-900 font-bold">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{user.department?.name || 'No Dept'}</p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-indigo-600 font-black">{user.points.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Points</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
