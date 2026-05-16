import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MoreVertical, 
  UserCheck, 
  UserX,
  Search,
  Filter,
  Check,
  X,
  Loader2,
  Trash2,
  AlertCircle,
  Edit2,
  Briefcase
} from 'lucide-react';
import { userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const EditMemberModal = ({ isOpen, onClose, onConfirm, member }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dept: '',
    role: ''
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        dept: member.dept || 'Engineering',
        role: member.role || 'JUNIOR'
      });
    }
  }, [member]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm(member.id, formData);
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  <Edit2 size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Edit Team Member</h3>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Department</label>
                  <select 
                    value={formData.dept}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-bold cursor-pointer"
                    onChange={(e) => setFormData({...formData, dept: e.target.value})}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Member Status (Role)</label>
                  <select 
                    value={formData.role}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-bold cursor-pointer"
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="JUNIOR">Junior Employee</option>
                    <option value="SENIOR">Senior Employee</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="MD">Managing Director</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all">Cancel</button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-2 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ResignModal = ({ isOpen, onClose, onConfirm, member }) => {
  const [reason, setReason] = useState('');
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Process Resignation</h3>
              <p className="text-slate-500 text-sm">Are you sure you want to mark <span className="font-bold text-slate-900">{member?.name}</span> as resigned? This will preserve their historical data.</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reason for Departure</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                placeholder="Briefly explain the reason..."
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 bg-slate-50 text-slate-500 font-bold rounded-xl hover:bg-slate-100 transition-all">Cancel</button>
              <button onClick={() => onConfirm(member.id, reason)} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100">Confirm Resignation</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const MemberCard = ({ member, onStatusUpdate, isApproval, onResignClick, onEditClick, isAdmin }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:border-indigo-200 transition-all"
  >
    <div className={`absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity ${member.status === 'RESIGNED' ? 'bg-slate-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}></div>
    
    <div className={`w-24 h-24 rounded-full p-1 border-2 mb-4 bg-slate-50 transition-colors ${member.status === 'RESIGNED' ? 'grayscale opacity-60 border-slate-200' : 'border-slate-100 group-hover:border-indigo-50'}`}>
      <img src={member.image?.startsWith('data:image') ? member.image : `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.image || member.name}`} className="rounded-full" alt={member.name} />
    </div>

    <h4 className={`font-bold text-lg ${member.status === 'RESIGNED' ? 'text-slate-400' : 'text-slate-900'}`}>{member.name}</h4>
    <p className={`${member.status === 'RESIGNED' ? 'text-slate-300' : 'text-indigo-600'} text-xs font-black mb-4 uppercase tracking-widest`}>{member.role}</p>

    <div className="flex items-center gap-2 mb-6">
      <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100">{member.dept || 'Engineering'}</span>
      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
        member.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
        member.status === 'RESIGNED' ? 'bg-slate-100 text-slate-500 border-slate-200' :
        member.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
        'bg-amber-50 text-amber-600 border-amber-100'
      }`}>
        {member.status}
      </span>
    </div>

    {member.status === 'RESIGNED' && member.resignationReason && (
      <p className="text-[10px] text-slate-400 italic mb-4 line-clamp-2">"{member.resignationReason}"</p>
    )}

    <div className="w-full pt-6 border-t border-slate-100 flex justify-between items-center">
      {isApproval ? (
        <div className="flex gap-2 w-full">
          <button onClick={() => onStatusUpdate(member.id, 'APPROVED')} className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
            <Check size={14} /> Approve
          </button>
          <button onClick={() => onStatusUpdate(member.id, 'REJECTED')} className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
            <X size={14} /> Reject
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-all">
              <Mail size={16} />
            </button>
            <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-all">
              <Phone size={16} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            {isAdmin && member.status === 'APPROVED' && (
              <button onClick={() => onEditClick(member)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors" title="Edit Member">
                <Edit2 size={18} />
              </button>
            )}
            {member.status === 'APPROVED' ? (
              <button onClick={() => onResignClick(member)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors" title="Mark as Resigned">
                <UserX size={20} />
              </button>
            ) : (
              <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                <MoreVertical size={20} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  </motion.div>
);

const Team = () => {
  const [activeTab, setActiveTab] = useState('DIRECTORY');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resignTarget, setResignTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data } = await userAPI.getAll();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, reason = '') => {
    try {
      await userAPI.updateStatus(id, status, reason);
      setResignTarget(null);
      fetchMembers();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleUpdateMember = async (id, updateData) => {
    try {
      await userAPI.updateUser(id, updateData);
      setEditTarget(null);
      fetchMembers();
    } catch (error) {
      console.error('Error updating member:', error);
    }
  };

  const pendingCount = members.filter(m => m.status === 'PENDING').length;
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'MD';

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('DIRECTORY')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'DIRECTORY' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Team Directory
          </button>
          <button 
            onClick={() => setActiveTab('APPROVALS')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'APPROVALS' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Approval Queue
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${activeTab === 'APPROVALS' ? 'bg-white/20 border-white/20 text-white' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
              {pendingCount}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('RESIGNED')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'RESIGNED' ? 'bg-slate-800 text-white shadow-md shadow-slate-200' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Alumni (Resigned)
          </button>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search members..." 
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium placeholder:text-slate-400"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={48} className="mb-4 animate-spin opacity-20" />
          <p className="font-bold">Loading team members...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members
              .filter(m => {
                if (activeTab === 'DIRECTORY') return m.status === 'APPROVED';
                if (activeTab === 'APPROVALS') return m.status === 'PENDING';
                if (activeTab === 'RESIGNED') return m.status === 'RESIGNED';
                return false;
              })
              .map(member => (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  isApproval={activeTab === 'APPROVALS'}
                  onStatusUpdate={handleStatusUpdate}
                  onResignClick={setResignTarget}
                  onEditClick={setEditTarget}
                  isAdmin={isAdmin}
                />
              ))
            }
          </div>

          {activeTab === 'APPROVALS' && pendingCount === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-300">
              <UserCheck size={64} className="mb-4 opacity-50" strokeWidth={1} />
              <p className="font-bold text-slate-400">No pending approvals</p>
              <p className="text-sm font-medium">Your team is up to date!</p>
            </div>
          )}

          {activeTab === 'RESIGNED' && members.filter(m => m.status === 'RESIGNED').length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-300">
              <Trash2 size={64} className="mb-4 opacity-50" strokeWidth={1} />
              <p className="font-bold text-slate-400">No resignation records</p>
              <p className="text-sm font-medium">Retention is 100%!</p>
            </div>
          )}
        </>
      )}

      <ResignModal 
        isOpen={!!resignTarget}
        onClose={() => setResignTarget(null)}
        member={resignTarget}
        onConfirm={handleStatusUpdate}
      />

      <EditMemberModal 
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        member={editTarget}
        onConfirm={handleUpdateMember}
      />
    </div>
  );
};

export default Team;
