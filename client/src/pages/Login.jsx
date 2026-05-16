import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'JUNIOR'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        addToast('Welcome back to ProPulse!', 'success');
        navigate('/dashboard');
      } else {
        await register(formData);
        addToast('Registration successful! Awaiting admin approval.', 'success');
        setIsLogin(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/50 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/50 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl shadow-slate-200 border border-white relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ProPulse</h1>
          <p className="text-slate-400 mt-2 font-medium">{isLogin ? 'Welcome back, professional' : 'Join the elite workforce'}</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-600 ml-1">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-11 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <UserPlus className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-600 ml-1">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                required
                placeholder="name@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-11 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <Mail className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-600 ml-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-11 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <Lock className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-100 transition-all mt-4 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              isLogin ? (
                <>
                  Login to Dashboard
                  <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              ) : 'Request Approval'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 font-bold ml-2 hover:text-indigo-700 transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
