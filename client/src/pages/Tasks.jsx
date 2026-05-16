import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Flag, 
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  X,
  Target,
  Star
} from 'lucide-react';
import { taskAPI, userAPI, feedbackAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const TaskItem = ({ task, onUpdate, onComplete }) => {
  const [updating, setUpdating] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const { syncUser } = useAuth();
  const { addToast } = useToast();

  const statuses = [
    { id: 'PENDING', label: 'Pending', icon: AlertTriangle, color: 'amber' },
    { id: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: 'indigo' },
    { id: 'UNDER_REVIEW', label: 'Under Review', icon: Search, color: 'purple' },
    { id: 'COMPLETED', label: 'Completed', icon: CheckCircle2, color: 'emerald' },
  ];

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setShowStatusMenu(false);
    try {
      await taskAPI.updateStatus(task.id, newStatus);
      addToast(`Task status updated to ${newStatus.replace('_', ' ')}`, 'success');
      if (newStatus === 'COMPLETED' && task.status !== 'COMPLETED') {
        onComplete(task);
      }
      onUpdate();
      syncUser();
    } catch (err) {
      console.error(err);
      addToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const currentStatus = statuses.find(s => s.id === task.status) || statuses[0];
  const StatusIcon = currentStatus.icon;

  const colorMap = {
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            disabled={updating}
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all hover:scale-105 active:scale-95 ${colorMap[currentStatus.color]}`}
          >
            {updating ? <Loader2 size={20} className="animate-spin" /> : <StatusIcon size={24} />}
          </button>

          <AnimatePresence>
            {showStatusMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowStatusMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute left-0 top-14 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-40"
                >
                  {statuses.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleStatusChange(s.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        task.status === s.id ? `bg-${s.color}-50 text-${s.color}-600` : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <s.icon size={16} />
                      {s.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-bold transition-all ${task.status === 'COMPLETED' ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
              {task.title}
            </h4>
            <Flag className={`${task.priority === 'HIGH' ? 'text-rose-500' : 'text-slate-300'}`} size={14} />
          </div>
          <p className="text-slate-500 text-sm font-medium line-clamp-1">{task.description}</p>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Points</p>
            <p className="text-indigo-600 font-black">+{task.points}</p>
          </div>

          <div className="hidden md:flex flex-col items-end">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Deadline</p>
            <div className="flex items-center gap-1 text-slate-600 font-bold">
              <Calendar size={14} />
              <span className="text-sm">{new Date(task.deadline).toISOString().split('T')[0]}</span>
            </div>
          </div>

          <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const AssignTaskModal = ({ isOpen, onClose, onTaskCreated, users }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedToId: '',
    priority: 'MEDIUM',
    points: 10,
    deadline: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await taskAPI.create(formData);
      addToast('New task assigned successfully!', 'success');
      onTaskCreated();
      onClose();
      setFormData({ title: '', description: '', assignedToId: '', priority: 'MEDIUM', points: 10, deadline: '' });
    } catch (err) {
      console.error(err);
      addToast('Failed to assign task', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  <Plus size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Assign New Task</h3>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Task Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter task name..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                <textarea 
                  required
                  placeholder="What needs to be done?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium h-24 resize-none"
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assign To</label>
                  <select 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                    onChange={(e) => setFormData({...formData, assignedToId: e.target.value})}
                  >
                    <option value="">Select Member</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Points</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      required
                      min="5"
                      step="5"
                      value={formData.points}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-10 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                      onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
                    />
                    <Target className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deadline</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-10 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    />
                    <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <Plus size={20} /> Assign Task
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const FeedbackModal = ({ isOpen, onClose, task }) => {
  const { addToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackAPI.submit({
        userId: user?.id,
        taskId: task?.id,
        rating,
        comment
      });
      addToast('Feedback submitted! Thank you.', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Failed to submit feedback', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden">
            <div className="p-8 text-center space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Task Completed!</h3>
                <p className="text-slate-500 font-medium mt-1">How was your experience working on <span className="text-slate-900 font-bold">{task?.title}</span>?</p>
              </div>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 transition-all hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-200'}`}
                  >
                    <Star size={32} fill={rating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>

              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none font-medium text-sm"
                placeholder="Any feedback or issues faced? (Optional)"
                onChange={(e) => setComment(e.target.value)}
              />

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3.5 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all">Skip</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completionTarget, setCompletionTarget] = useState(null);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const isJunior = user?.role === 'JUNIOR';
      
      const tasksPromise = isJunior ? taskAPI.getMyTasks() : taskAPI.getAll();
      const usersPromise = !isJunior ? userAPI.getAll() : Promise.resolve({ data: [] });
      
      const [tasksRes, usersRes] = await Promise.all([tasksPromise, usersPromise]);
      
      setTasks(tasksRes.data);
      if (!isJunior) {
        setUsers(usersRes.data.filter(u => u.status === 'APPROVED'));
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      // If tasks failed, tasks will be empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const filteredTasks = tasks.filter(t => filter === 'ALL' || t.status === filter);
  const canAssignTasks = user?.role !== 'JUNIOR';

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
            <Filter size={18} />
            Filters
          </button>
          {canAssignTasks && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Plus size={18} />
              Assign Task
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 pb-2 overflow-x-auto">
        {['ALL', 'PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-all relative ${
              filter === t ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.replace('_', ' ')}
            {filter === t && (
              <motion.div layoutId="tab-underline" className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-indigo-500" />
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="text-indigo-500 animate-spin" size={40} />
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onUpdate={fetchData} 
              onComplete={setCompletionTarget}
            />
          ))
        )}
      </div>

      <AssignTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTaskCreated={fetchData}
        users={users}
      />

      <FeedbackModal 
        isOpen={!!completionTarget}
        onClose={() => setCompletionTarget(null)}
        task={completionTarget}
      />
    </div>
  );
};

export default Tasks;
