import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Briefcase, CheckCircle, Clock, Eye } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';
import EnhancedPostCard from '../components/EnhancedPostCard';
import ProfileCompletionWidget from '../components/ProfileCompletionWidget';

const ClientFeed = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    applicants: 0,
    ongoingProjects: 0,
    completedProjects: 0,
    profileViews: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchFeed();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    if (!user?.id) {
      console.log('User ID not available yet, skipping stats fetch');
      return;
    }
    
    try {
      console.log('Fetching stats for user:', user.id);
      
      // Fetch all stats in parallel with error handling
      const [jobsRes, projectsRes, profileRes] = await Promise.all([
        api.get('/jobs/my-jobs').catch(() => ({ data: { jobs: [] } })),
        api.get('/projects').catch(() => ({ data: { projects: [] } })),
        api.get(`/profile/public/${user.id}`).catch(() => ({ data: { profile: {} } }))
      ]);
      
      console.log('Jobs response:', jobsRes.data);
      console.log('Projects response:', projectsRes.data);
      console.log('Profile response:', profileRes.data);
      
      // Calculate active jobs (open status)
      const activeJobs = jobsRes.data.jobs?.filter(j => j.status === 'open').length || 0;
      
      // Calculate total applicants across all jobs
      const totalApplicants = jobsRes.data.jobs?.reduce((sum, job) => sum + (job.applicantsCount || 0), 0) || 0;
      
      // Calculate ongoing projects (ongoing or awaiting_confirmation status)
      const ongoingProjs = projectsRes.data.projects?.filter(p => 
        p.status === 'ongoing' || p.status === 'awaiting_confirmation'
      ).length || 0;
      
      // Calculate completed projects
      const completedProjs = projectsRes.data.projects?.filter(p => p.status === 'completed').length || 0;
      
      // Get profile views from profile data
      const profileViews = profileRes.data.profile?.profileViews || 0;

      console.log('Calculated stats:', { activeJobs, totalApplicants, ongoingProjs, completedProjs, profileViews });

      setStats({
        activeJobs,
        applicants: totalApplicants,
        ongoingProjects: ongoingProjs,
        completedProjects: completedProjs,
        profileViews: profileViews
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const fetchFeed = async (pageNum = 1) => {
    try {
      const loadingState = pageNum === 1 ? setLoading : setLoadingMore;
      loadingState(true);
      
      const response = await api.get(`/posts/feed?page=${pageNum}&limit=10`);
      
      if (pageNum === 1) {
        setPosts(response.data.posts);
      } else {
        setPosts(prev => [...prev, ...response.data.posts]);
      }
      
      setHasMore(response.data.hasMore);
      setPage(pageNum);
    } catch (error) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFeed(page + 1);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await api.get('/jobs/my-jobs');
      const jobs = response.data.jobs || [];
      setRecentActivity(jobs.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch activity');
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const StatCard = ({ icon: Icon, label, value, change, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">{change}</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{label}</p>
    </motion.div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dashboard-page">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        <Navbar />
        
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Good day, {user?.fullName?.split(' ')[0]} 👋
              </h1>
              <p className="text-gray-600">Here's what's happening with your projects today</p>
            </motion.div>

            {/* Profile Completion Widget */}
            <ProfileCompletionWidget userRole="client" />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Feed Section - 2 columns */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Feed</h2>
                  
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
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
                          <p className="text-center text-gray-500 py-8">No posts yet</p>
                        )}
                      </div>
                      
                      {hasMore && posts.length > 0 && (
                        <div className="mt-6 text-center">
                          <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-xl font-medium transition disabled:opacity-50 shadow-lg"
                          >
                            {loadingMore ? 'Loading...' : 'Load More'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Sidebar - 1 column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                    <button 
                      onClick={() => window.location.href = '/client/jobs'}
                      className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      See all
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentActivity.map((job, index) => (
                      <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
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
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                        0
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => window.location.href = '/client/post-job'}
                      className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition text-sm"
                    >
                      Post New Job
                    </button>
                    <button 
                      onClick={() => window.location.href = '/client/jobs'}
                      className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition text-sm"
                    >
                      View Applications
                    </button>
                    <button 
                      onClick={() => window.location.href = '/client/projects/ongoing'}
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
  );
};

export default ClientFeed;
