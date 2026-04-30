import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, RefreshCw } from 'lucide-react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';
import EnhancedPostCard from '../components/EnhancedPostCard';
import ProfileCompletionWidget from '../components/ProfileCompletionWidget';
import { useNavigate } from 'react-router-dom';

const LIMIT = 10;
const POLL_INTERVAL = 45000; // 45 seconds

const ClientFeed = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // "New posts available" banner
  const [newPostsCount, setNewPostsCount] = useState(0);
  const latestPostIdRef = useRef(null);
  const pollTimerRef = useRef(null);

  const [stats, setStats] = useState({ activeJobs: 0, applicants: 0 });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
    loadFeed(1, true);
    fetchRecentActivity();
    return () => clearInterval(pollTimerRef.current);
  }, []);

  // ─── Feed loader ─────────────────────────────────────────────────────────────
  const loadFeed = async (pageNum = 1, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await api.get(`/posts/feed?page=${pageNum}&limit=${LIMIT}`);
      const incoming = res.data.posts || [];

      if (reset) {
        setPosts(incoming);
        setPage(1);
        if (incoming.length > 0) latestPostIdRef.current = incoming[0].id;
        startPolling();
      } else {
        setPosts(prev => [...prev, ...incoming]);
        setPage(pageNum);
      }

      setHasMore(res.data.hasMore ?? incoming.length === LIMIT);
      setNewPostsCount(0);
    } catch {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ─── Background polling ───────────────────────────────────────────────────────
  const startPolling = useCallback(() => {
    clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/posts/feed?page=1&limit=${LIMIT}`);
        const latest = res.data.posts || [];
        if (!latest.length || !latestPostIdRef.current) return;
        const newCount = latest.findIndex(p => p.id === latestPostIdRef.current);
        if (newCount > 0) setNewPostsCount(newCount);
      } catch {
        // silent
      }
    }, POLL_INTERVAL);
  }, []);

  const handleShowNewPosts = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadFeed(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) loadFeed(page + 1);
  };

  // ─── Stats & activity ─────────────────────────────────────────────────────────
  const fetchStats = async () => {
    if (!user?.id) return;
    try {
      const [jobsRes, projectsRes] = await Promise.all([
        api.get('/jobs/my-jobs').catch(() => ({ data: { jobs: [] } })),
        api.get('/projects').catch(() => ({ data: { projects: [] } })),
      ]);
      const activeJobs = jobsRes.data.jobs?.filter(j => j.status === 'open').length || 0;
      const totalApplicants = jobsRes.data.jobs?.reduce((s, j) => s + (j.applicantsCount || 0), 0) || 0;
      setStats({ activeJobs, applicants: totalApplicants });
    } catch {
      // silent
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const res = await api.get('/jobs/my-jobs');
      setRecentActivity((res.data.jobs || []).slice(0, 5));
    } catch {
      // silent
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  // ─── Skeleton ────────────────────────────────────────────────────────────────
  const Skeleton = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
    <div className="flex min-h-screen bg-gray-50 dashboard-page">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <Navbar />

        <div className="lg:p-8 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Welcome */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="lg:text-3xl md:text-2xl text-xl font-bold text-gray-900 mb-2">
                Good day, {user?.fullName?.split(' ')[0]} 👋
              </h1>
              <p className="text-gray-600 lg:text-lg text-xs">
                Here's what's happening with your projects today
              </p>
            </motion.div>

            <ProfileCompletionWidget userRole="client" />

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Feed */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6 px-6 lg:px-0">
                  <h2 className="text-2xl font-bold text-gray-900">Activity Feed</h2>
                  <button
                    onClick={() => loadFeed(1, true)}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-sm text-yellow-600 hover:text-yellow-700 font-medium disabled:opacity-50 transition"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {/* New posts banner removed — now a floating portal pill below */}

                <div className="md:mx-12 lg:mx-0">
                  {loading ? (
                    <Skeleton />
                  ) : (
                    <>
                      <div className="space-y-6">
                        {posts.map(post => (
                          <EnhancedPostCard
                            key={post.id}
                            post={post}
                            onDelete={handleDeletePost}
                          />
                        ))}
                        {posts.length === 0 && (
                          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                            <p className="text-gray-500 text-lg">No posts yet. Start following freelancers!</p>
                          </div>
                        )}
                      </div>

                      {posts.length > 0 && hasMore && (
                        <div className="mt-8 text-center">
                          <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-xl font-medium transition disabled:opacity-50 shadow-lg"
                          >
                            {loadingMore ? 'Loading...' : 'Load More'}
                          </button>
                        </div>
                      )}

                      {posts.length > 0 && !hasMore && (
                        <p className="mt-8 text-center text-sm text-gray-400">You're all caught up!</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                    <button
                      onClick={() => navigate('/client/jobs')}
                      className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      See all
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentActivity.map((job, index) => (
                      <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{job.title}</p>
                          <p className="text-xs text-gray-500">{job.applicantsCount || 0} applicants</p>
                        </div>
                      </div>
                    ))}
                    {recentActivity.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </div>

                {/* Pending Requests */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Requests</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Applications to review</span>
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                        {stats.applicants}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Projects to approve</span>
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">0</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/client/post-job')}
                      className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition text-sm"
                    >
                      Post New Job
                    </button>
                    <button
                      onClick={() => navigate('/client/jobs')}
                      className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition text-sm"
                    >
                      View Applications
                    </button>
                    <button
                      onClick={() => navigate('/client/projects/ongoing')}
                      className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition text-sm"
                    >
                      Manage Projects
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Floating "new posts" pill — fixed top-center like Twitter */}
    {createPortal(
      <AnimatePresence>
        {newPostsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              onClick={handleShowNewPosts}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-full shadow-2xl transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
              {newPostsCount} new post{newPostsCount > 1 ? 's' : ''}
            </button>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
};

export default ClientFeed;
