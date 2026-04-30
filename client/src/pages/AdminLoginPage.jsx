import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Shield, User, Key, ArrowRight, BarChart2, FileText, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const FEATURES = [
  { icon: BarChart2, title: 'Platform Analytics', desc: 'Monitor users, jobs, and activity in real time.' },
  { icon: FileText, title: 'Blog Management', desc: 'Create, edit and publish blog posts with images.' },
  { icon: Users, title: 'User Control', desc: 'View and manage all freelancers and clients.' },
];

function Field({ icon: Icon, label, name, type = 'text', placeholder, form, setForm, showPassword, setShowPassword }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type={name === 'password' ? (showPassword ? 'text' : 'password') : type}
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          required
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00564C] focus:ring-1 focus:ring-[#00564C] transition text-sm"
        />
        {name === 'password' && (
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', fullName: '', secretKey: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/admin/login' : '/admin/register';
      const res = await api.post(endpoint, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('adminUser', JSON.stringify(res.data.user));
      setUser(res.data.user);
      toast.success(mode === 'login' ? 'Welcome back!' : 'Admin account created!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00564C]/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-[#00564C]/30 rounded-full blur-3xl animate-pulse delay-500" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl  flex items-center justify-center shadow-lg shadow-[#00564C]/30">
          <img src="/img/afro-task.png"
                    alt="Afro Task"
                    className="h-full w-auto" />
            {/* <Shield className="w-5 h-5 text-white" /> */}
          </div>
          <span className="text-white font-bold text-lg tracking-tight">AfroTask Admin</span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00564C]/20 border border-[#00564C]/30 text-emerald-400 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Admin Control Panel
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Manage your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#00564C]">
                platform with ease
              </span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-sm">
              Full control over users, content, and platform activity — all from one secure dashboard.
            </p>
          </motion.div>

          <div className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition"
              >
                <div className="w-9 h-9 rounded-xl bg-[#00564C]/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} AfroTask. Restricted access.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#00564C]/50 p-1 flex items-center justify-center">
                <img src="/img/afro-task.png"
                    alt="Afro Task"
                    className="h-full w-auto" />            </div>
            <span className="text-white font-bold">AfroTask Admin</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {mode === 'login' ? 'Welcome back' : 'Create admin account'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {mode === 'login'
                    ? 'Sign in to access the admin dashboard'
                    : 'You need the secret key to register'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <Field icon={User} label="Full Name" name="fullName" placeholder="Your full name" 
                    form={form} setForm={setForm} showPassword={showPassword} setShowPassword={setShowPassword} />
                )}
                <Field icon={Mail} label="Email address" name="email" type="email" placeholder="admin@afrotask.com" 
                  form={form} setForm={setForm} showPassword={showPassword} setShowPassword={setShowPassword} />
                <Field icon={Lock} label="Password" name="password" placeholder="Enter your password" 
                  form={form} setForm={setForm} showPassword={showPassword} setShowPassword={setShowPassword} />
                {mode === 'register' && (
                  <Field icon={Key} label="Admin Secret Key" name="secretKey"
                    placeholder="Enter the secret key"
                    form={form} setForm={setForm} showPassword={showPassword} setShowPassword={setShowPassword} />
                )}

                <button type="submit" disabled={loading}
                  className="w-full mt-2 py-3.5 bg-[#00564C] hover:bg-[#006b5e] text-white font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 group shadow-lg shadow-[#00564C]/20"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign in' : 'Create account'}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-sm text-gray-500 hover:text-emerald-400 transition">
                  {mode === 'login'
                    ? "No admin account yet? Register →"
                    : '← Back to sign in'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          <p className="text-center text-gray-700 text-xs mt-10">
            Restricted to authorized administrators only
          </p>
        </div>
      </div>
    </div>
  );
}
