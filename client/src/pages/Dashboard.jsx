import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  ArrowUpRight,
  Target,
  ChevronRight,
  Star,
  MessageSquare,
  Calendar,
  Flag
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { feedbackAPI, statsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon: Icon, label, value, trend, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl border ${colorClasses[color] || colorClasses.indigo}`}>
          <Icon size={24} />
        </div>
        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
          <TrendingUp size={14} />
          {trend}
        </div>
      </div>
      <h3 className="text-slate-500 text-sm font-semibold">{label}</h3>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    taskStats: { completed: 0, pending: 0, inProgress: 0 },
    trends: [],
    recentTasks: [],
    efficiency: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      // Fetch Feedback
      try {
        const res = await feedbackAPI.getAll();
        setFeedbacks(res.data);
      } catch (err) {
        console.error('DEBUG: Feedback fetch failed:', err.message);
      }

      // Fetch Leaderboard
      try {
        const res = await statsAPI.getLeaderboard();
        setTopPerformers(res.data.slice(0, 4));
      } catch (err) {
        console.error('DEBUG: Leaderboard fetch failed:', err.message);
      }

      // Fetch Dashboard Stats
      try {
        const res = await statsAPI.getDashboardStats();
        setDashboardStats(res.data);
      } catch (err) {
        console.error('DEBUG: Stats fetch failed:', err.message);
      }

      setLoading(false);
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const averageCSAT = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1) 
    : "0.0";

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={CheckCircle2} 
          label="Tasks Completed" 
          value={dashboardStats.taskStats.completed} 
          trend="+ live" 
          color="indigo"
        />
        <StatCard 
          icon={Clock} 
          label="Pending Tasks" 
          value={dashboardStats.taskStats.pending} 
          trend="real-time" 
          color="amber"
        />
        <StatCard 
          icon={Target} 
          label="Current Efficiency" 
          value={`${dashboardStats.efficiency}%`} 
          trend="accurate" 
          color="emerald"
        />
        <StatCard 
          icon={MessageSquare} 
          label="Avg CSAT Score" 
          value={averageCSAT} 
          trend="feedback" 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Chart Section */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Productivity Trends</h3>
                <p className="text-slate-400 text-sm font-medium">Performance points earned over the last 7 days</p>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardStats.trends}>
                  <defs>
                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      color: '#1e293b' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="points" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPoints)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Tasks for current user */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">{user?.role === 'JUNIOR' ? 'My Recent Tasks' : 'Global Recent Tasks'}</h3>
              <button className="text-indigo-600 text-sm font-bold hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {dashboardStats.recentTasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group">
                  <div className={`p-2 rounded-lg ${
                    task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 
                    task.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {task.status === 'COMPLETED' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                         <Calendar size={12} /> {new Date(task.deadline).toLocaleDateString()}
                       </span>
                       <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${
                         task.priority === 'HIGH' ? 'text-rose-500' : 'text-slate-400'
                       }`}>
                         <Flag size={12} /> {task.priority}
                       </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-600 font-black">+{task.points} pts</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{task.status.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
              {dashboardStats.recentTasks.length === 0 && (
                <p className="text-center py-8 text-slate-400 font-medium italic">No recent tasks found</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Top Performers Section */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Top Performers</h3>
            <div className="space-y-6">
              {topPerformers.map((user, index) => (
                <div key={user.id || user.name} className="flex items-center gap-4 group">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 group-hover:border-indigo-100 transition-colors">
                      <img src={user?.image?.startsWith('data:image') ? user.image : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.image || user.name}`} alt={user.name} />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white ${
                      index === 0 ? 'bg-yellow-400 text-yellow-950' : 
                      index === 1 ? 'bg-slate-200 text-slate-700' :
                      index === 2 ? 'bg-orange-300 text-orange-950' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 font-bold">{user.name}</p>
                    <p className="text-xs text-slate-400 font-semibold">{user.points.toLocaleString()} points</p>
                  </div>
                </div>
              ))}
              {topPerformers.length === 0 && !loading && (
                 <p className="text-slate-400 text-center py-4 font-medium italic">No performers yet</p>
              )}
            </div>
            <button className="w-full mt-8 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900 transition-all">
              View Full Leaderboard
            </button>
          </div>

          {/* CSAT Section */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">User Satisfaction</h3>
              <div className="flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-lg">
                 <Star className="text-indigo-600 fill-indigo-600" size={16} />
                 <span className="text-indigo-900 font-black text-sm">{averageCSAT}</span>
              </div>
            </div>

            <div className="space-y-4">
              {feedbacks.slice(0, 3).map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} className={s <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'} />
                      ))}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium line-clamp-2 italic">"{item.comment || "No comment."}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
