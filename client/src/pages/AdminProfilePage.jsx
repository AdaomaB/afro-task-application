import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, ArrowLeft, Mail, Globe, Users, FileText,
  MessageSquare, ExternalLink, Save, Lock, Eye, EyeOff, Loader2, User,
} from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import EnhancedPostCard from '../components/EnhancedPostCard';

export default function AdminProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { dark } = useDarkMode();
  const { user: currentUser } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit state — only relevant when admin views their own profile
  const adminStored = (() => { try { return JSON.parse(localStorage.getItem('adminUser')); } catch { return null; } })();
  const isOwnProfile = adminStored?.id === userId || currentUser?.id === userId;

  const [profile, setProfile] = useState({ fullName: adminStored?.fullName || '', email: adminStored?.email || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    fetchAdminPublicData();
  }, []);

  const fetchAdminPublicData = async () => {
    try {
      const [blogsRes, postsRes] = await Promise.all([
        api.get('/blogs?limit=6').catch(() => ({ data: { blogs: [] } })),
        api.get('/admin/posts').catch(() => ({ data: { posts: [] } })),
      ]);
      const allPosts = postsRes.data.posts || [];
      const adminPosts = allPosts.filter(p => p.authorRole === 'admin');
      setBlogs(blogsRes.data.blogs || []);
      setProfile(prev => ({ ...prev, posts: adminPosts }));
    } catch (err) {
      console.error('Failed to load admin profile data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/admin/profile', profile);
      const stored = JSON.parse(localStorage.getItem('adminUser') || '{}');
      localStorage.setItem('adminUser', JSON.stringify({ ...stored, ...res.data.user }));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSavingPw(true);
    try {
      await api.put('/admin/profile/password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password updated!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPw(false);
    }
  };

  const handleDeletePost = async (postId) => {
    setProfile(prev => ({ ...prev, posts: (prev.posts || []).filter(p => p.id !== postId) }));
  };

  const bg = dark ? 'bg-gray-900' : 'bg-gray-50';
  const card = dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = dark ? 'text-white' : 'text-gray-900';
  const muted = dark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`flex min-h-screen ${bg}`}>
      {(currentUser?.role === 'client' || currentUser?.role === 'freelancer')
        ? <Sidebar />
        : <AdminSidebar
            user={adminStored}
            tab="profile"
            setTab={(id) => navigate(`/admin/dashboard?tab=${id}`)}
            setSearch={() => {}}
            logout={() => { localStorage.removeItem('token'); localStorage.removeItem('adminUser'); navigate('/admin/login'); }}
            onBroadcast={() => {}}
          />
      }

      <div className={`w-full flex-1 lg:ml-64`}>
        {(currentUser?.role === 'client' || currentUser?.role === 'freelancer') && <Navbar />}
        
        <div className="p-4 md:p-8 mx-auto space-y-6">

          {/* Back */}
          <button onClick={() => navigate(-1)}
            className={`mb-6 flex items-center gap-2 text-sm transition ${muted} hover:${text}`}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Hero banner */}
          <div>
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            className="relative lg:h-52 md:h-32 h-24 rounded-t-3xl overflow-hidden bg-gradient-to-br from-[#00564C] via-emerald-700 to-teal-900">
            {/* Decorative grid */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {/* Floating orbs */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-teal-300/10 blur-2xl" />
          </motion.div>

          {/* Profile card */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="rounded-b-2xl border border-white/[0.06] bg-white/[0.02] p-6">

            {/* Avatar — overlaps banner */}
            <div className="flex items-end justify-between -mt-12 mb-5">
              <div className="relative">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gray-200 flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800">
                  <img src="/img/afro-task.png"
                    alt="Afro Task"
                    className="h-full w-auto" />
                  {/* <Shield className="w-10 h-10 md:w-12 md:h-12 text-white" /> */}
                </div>
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-[#00564C] text-white text-[10px] font-bold rounded-full shadow">
                  OFFICIAL
                </span>
              </div>
            </div>

            {/* Name + badge */}
            <div className="mb-5">
              <div className="flex items-center justify-between flex-wrap gap-3">

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className={`text-2xl md:text-3xl font-bold ${text}`}>
                      AfroTask
                    </h1>

                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/20">
                      <Shield className="w-3 h-3" />
                      Verified Admin
                    </span>
                  </div>

                  <p className={`mt-1 text-sm ${muted}`}>
                    Official AfroTask platform account
                  </p>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 text-sm rounded-xl border border-white/[0.1] text-gray-300 hover:text-white hover:bg-white/[0.05] transition"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* About */}
            <p className={`text-sm leading-relaxed mb-6 max-w-2xl ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
              AfroTask is Africa's premier freelance marketplace connecting talented professionals with clients across the continent and beyond.
              We manage the platform, publish updates, and ensure a safe and productive environment for all users.
            </p>

            {/* Links row */}
            <div className="flex flex-wrap gap-3">
              <a href="https://afrotask.digify.com.ng" target="_blank" rel="noreferrer"
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition ${dark ? 'border-gray-600 text-gray-400 hover:text-white hover:border-gray-400' : 'border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-400'}`}>
                <Globe className="w-3.5 h-3.5" /> afrotask.digify.com.ng
              </a>
              <a href="mailto:support@afrotask.com"
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition ${dark ? 'border-gray-600 text-gray-400 hover:text-white hover:border-gray-400' : 'border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-400'}`}>
                <Mail className="w-3.5 h-3.5" /> support@afrotask.com
              </a>
            </div>
          </motion.div>
          </div>


          {/* Recent blogs */}
          {!loading && blogs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
              className={`${card} border rounded-2xl p-6 mb-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`font-semibold ${text}`}>Latest from AfroTask</h2>
                <button onClick={() => navigate('/blogs')}
                  className="flex items-center gap-1 text-xs text-[#00564C] dark:text-emerald-400 hover:underline">
                  View all <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {blogs.slice(0, 4).map((blog) => (
                  <button key={blog.id} onClick={() => navigate(`/blogs/${blog.id}`)}
                    className={`flex items-start gap-3 p-3 rounded-xl text-left transition ${dark ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50'}`}>
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                      {blog.image
                        ? <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><FileText className="w-5 h-5 text-gray-400" /></div>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${text}`}>{blog.title}</p>
                      <p className={`text-xs mt-0.5 line-clamp-2 ${muted}`}>{blog.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* What we do */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
            className={`${card} border rounded-2xl p-6`}>
            <h2 className={`font-semibold mb-4 ${text}`}>What AfroTask Does</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Users, title: 'Connect Talent', desc: 'We match skilled African freelancers with clients who need quality work done.', color: 'bg-blue-500/10 text-blue-500' },
                { icon: Shield, title: 'Safe Platform', desc: 'We moderate content, handle disputes, and keep the community safe for everyone.', color: 'bg-emerald-500/10 text-emerald-500' },
                { icon: MessageSquare, title: 'Support', desc: 'Our team is available to help with any issues, questions, or feedback you have.', color: 'bg-purple-500/10 text-purple-500' },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className={`p-4 rounded-xl ${dark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                  <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className={`text-sm font-semibold mb-1 ${text}`}>{title}</p>
                  <p className={`text-xs leading-relaxed ${muted}`}>{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

              <div className='text-white'>Posts</div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {profile.posts && profile.posts.length > 0 ? (
                <div className="space-y-4">
                  {profile.posts.map((post) => (
                    <EnhancedPostCard
                      key={post.id}
                      post={post}
                      isAdminView={true}
                      onDelete={handleDeletePost}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No posts yet</p>
                </div>
              )}
            </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal — admin only */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" >
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl w-full max-w-md border border-white/[0.08] shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="text-white font-bold text-lg">Edit Admin Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
            <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Profile info */}
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Profile Info</p>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                    placeholder="Full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00564C] text-sm" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })}
                    placeholder="Email address"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00564C] text-sm" />
                </div>
                <button type="submit" disabled={savingProfile}
                  className="w-full py-2.5 bg-[#00564C] hover:bg-[#006b5e] text-white rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </form>

              <div className="border-t border-gray-700" />

              {/* Change password */}
              <form onSubmit={handleChangePassword} className="space-y-3">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Change Password</p>
                {[
                  { key: 'currentPassword', placeholder: 'Current password' },
                  { key: 'newPassword', placeholder: 'New password' },
                  { key: 'confirmPassword', placeholder: 'Confirm new password' },
                ].map(({ key, placeholder }) => (
                  <div key={key} className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPw[key] ? 'text' : 'password'}
                      value={passwords[key]}
                      onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full pl-10 pr-10 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00564C] text-sm"
                    />
                    {key === 'confirmPassword' && (
                      <button type="button" onClick={() => setShowPw(prev => ({
                        ...prev,
                        [key]: !prev[key]
                      }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                ))}
                <button type="submit" disabled={savingPw}
                  className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {savingPw ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
