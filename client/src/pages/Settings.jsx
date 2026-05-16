import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Palette, 
  Smartphone,
  Save,
  ChevronRight,
  Camera,
  Loader2,
  RefreshCw,
  Check,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../utils/api';

const SettingsSection = ({ icon: Icon, title, description, children }) => (
  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
      <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-indigo-600 shadow-sm">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-400 font-medium">{description}</p>
      </div>
    </div>
    <div className="p-8">
      {children}
    </div>
  </div>
);

const Settings = () => {
  const { user, syncUser } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    image: '',
    currentPassword: '',
    newPassword: '',
    notifications: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        name: user.name || '',
        email: user.email || '',
        image: user.image || user.name || 'Alexander',
      });
    }
  }, [user]);

  const handleRandomize = () => {
    const randomSeeds = ['Felix', 'Aneka', 'Caspian', 'Milo', 'Luna', 'Oliver', 'Zoe', 'Leo', 'Maya', 'Jasper'];
    const randomSeed = randomSeeds[Math.floor(Math.random() * randomSeeds.length)] + Math.floor(Math.random() * 100);
    setFormData({ ...formData, image: randomSeed });
    addToast('Avatar randomized!', 'info');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('Image size should be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
        addToast('Photo uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await userAPI.updateMe({
        name: formData.name,
        email: formData.email,
        image: formData.image
      });
      await syncUser();
      addToast('Profile settings saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Failed to save settings. Please try again.';
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isBase64 = (str) => str?.startsWith('data:image');
  const avatarUrl = isBase64(formData.image) 
    ? formData.image 
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.image}`;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h2>
        <p className="text-slate-500 font-medium mt-1">Manage your profile, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Section */}
        <SettingsSection 
          icon={User} 
          title="Profile Information" 
          description="Update your personal details and how others see you."
        >
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl transition-all bg-slate-100 ring-8 ring-slate-50">
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="absolute -bottom-2 -right-2 flex flex-col gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl border-4 border-white hover:scale-110 active:scale-95 transition-all group/btn"
                    title="Upload Photo"
                  >
                    <Upload size={20} />
                  </button>
                  <button 
                    onClick={handleRandomize}
                    className="p-3 bg-white text-indigo-600 rounded-2xl shadow-xl border-4 border-indigo-50 hover:scale-110 active:scale-95 transition-all group/btn"
                    title="Randomize Avatar"
                  >
                    <RefreshCw size={20} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                  </button>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              
              <div className="w-full space-y-3">
                <div className="text-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Avatar Source</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={isBase64(formData.image) ? "Custom Device Photo" : (formData.image || '')}
                      readOnly={isBase64(formData.image)}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className={`w-full border rounded-xl py-3 px-4 text-center text-sm font-bold focus:ring-2 outline-none transition-all ${
                        isBase64(formData.image) 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                          : 'bg-slate-50 border-slate-200 text-indigo-600 focus:ring-indigo-500'
                      }`}
                      placeholder="Type for avatar or upload photo..."
                    />
                    {isBase64(formData.image) && (
                      <button 
                        onClick={() => {
                          setFormData({...formData, image: user?.name || 'Alexander'});
                          addToast('Reset to default avatar', 'info');
                        }}
                        className="mt-2 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                      >
                        Reset to Avatar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                  />
                  <User className="absolute right-4 top-3.5 text-slate-300" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                  />
                  <Mail className="absolute right-4 top-3.5 text-slate-300" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role / Position</label>
                <input 
                  type="text" 
                  disabled
                  value={user?.role || ''}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-slate-500 font-bold cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Department</label>
                <input 
                  type="text" 
                  disabled
                  value={user?.department?.name || 'Engineering'}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-slate-500 font-bold cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection 
          icon={Shield} 
          title="Security & Password" 
          description="Keep your account secure with a strong password."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
              <input 
                type="password" 
                placeholder="Enter new password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
              />
            </div>
          </div>
        </SettingsSection>

        <div className="flex justify-end gap-4 mt-4">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="group px-10 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
