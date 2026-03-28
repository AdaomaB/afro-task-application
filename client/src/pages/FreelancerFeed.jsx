import { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';
import EnhancedPostCard from '../components/EnhancedPostCard';
import ProfileCompletionWidget from '../components/ProfileCompletionWidget';

const FreelancerFeed = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [stats, setStats] = useState({
    activeApplications: 0,
    ongoingProjects: 0,
    profileViews: 0,
    followers: 0
  });
  
  // Get search and category from URL params
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';

  useEffect(() => {
    fetchStats();
    fetchFeed();
    fetchRecommendedJobs();
  }, []);

  // Refetch feed when search or category changes
  useEffect(() => {
    setPage(1);
    fetchFeed();
  }, [searchQuery, categoryFilter]);

  useEffect(() => {
    if (page > 1) fetchFeed();
  }, [page]);

  const fetchStats = async () => {
    if (!user?.id) {
      console.log('User ID not available yet, skipping stats fetch');
      return;
    }
    
    try {
      console.log('Fetching stats for user:', user.id);
      
      // Fetch all stats in parallel
      const [applicationsRes, projectsRes, followRes, profileRes] = await Promise.all([
        api.get('/applications/my-applications').catch(() => ({ data: { applications: [] } })),
        api.get('/projects').catch(() => ({ data: { projects: [] } })),
        api.get(`/follows/${user.id}/stats`).catch(() => ({ data: { followersCount: 0 } })),
        api.get(`/profile/public/${user.id}`).catch(() => ({ data: { profile: {} } }))
      ]);
      
      console.log('Applications response:', applicationsRes.data);
      console.log('Projects response:', projectsRes.data);
      console.log('Follow stats response:', followRes.data);
      console.log('Profile response:', profileRes.data);
      
      // Calculate active applications (pending status)
      const activeApps = applicationsRes.data.applications?.filter(a => a.status === 'pending').length || 0;
      
      // Calculate ongoing projects (ongoing or awaiting_confirmation status)
      const ongoingProjs = projectsRes.data.projects?.filter(p => 
        p.status === 'ongoing' || p.status === 'awaiting_confirmation'
      ).length || 0;
      
      // Get followers count
      const followersCount = followRes.data.followersCount || 0;
      
      // Get profile views from profile data
      const profileViews = profileRes.data.profile?.profileViews || 0;
      
      console.log('Calculated stats:', { activeApps, ongoingProjs, followersCount, profileViews });
      
      setStats({
        activeApplications: activeApps,
        ongoingProjects: ongoingProjs,
        profileViews: profileViews,
        followers: followersCount
      });
      
      console.log('Final stats set:', {
        activeApplications: activeApps,
        ongoingProjects: ongoingProjs,
        profileViews: profileViews,
        followers: followersCount
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      
      // Build query params
      let queryParams = `page=${page}&limit=50`;
      if (searchQuery) {
        queryParams += `&search=${encodeURIComponent(searchQuery)}`;
      }
      if (categoryFilter) {
        queryParams += `&category=${encodeURIComponent(categoryFilter)}`;
      }
      
      const response = await api.get(`/posts/feed?${queryParams}`);
      setPosts(prev => page === 1 ? response.data.posts : [...prev, ...response.data.posts]);
    } catch (error) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedJobs = async () => {
    try {
      setLoadingJobs(true);
      const response = await api.get('/jobs?status=open&limit=5');
      setRecommendedJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Failed to load recommended jobs');
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dashboard-page">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        <Navbar />
        
        <div className="lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 lg:p-0"
            >
              {/* Show search/filter info if active */}
              {(searchQuery || categoryFilter) && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-800 font-medium">
                        {searchQuery && `Searching for: "${searchQuery}"`}
                        {searchQuery && categoryFilter && ' in '}
                        {categoryFilter && `${categoryFilter}`}
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate('/freelancer/feed')}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Clear filters ✕
                    </button>
                  </div>
                </div>
              )}
              
              <h1 className="lg:text-4xl text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.fullName?.split(' ')[0]} 👋
              </h1>
              <p className="text-gray-600">Here's what's happening with your freelance journey today.</p>
            </motion.div>

            {/* Profile Completion Widget */}
            <ProfileCompletionWidget userRole="freelancer" />

            {/* Feed Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Feed */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 px-6 lg:p-0">Feed</h2>
                
                <div className="md:mx-12 lg:mx-0">
                {loading && page === 1 ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
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
                    </div>

                    {posts.length > 0 && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={() => setPage(prev => prev + 1)}
                          disabled={loading}
                          className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium transition disabled:opacity-50 shadow-lg"
                        >
                          {loading ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}

                    {posts.length === 0 && !loading && (
                      <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                        <p className="text-gray-500 text-lg">No posts yet. Start following people!</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              </div>

              {/* Sidebar - Recommended Jobs */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended For You</h3>
                  
                  {loadingJobs ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                          <div className="h-8 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : recommendedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {recommendedJobs.slice(0, 3).map((job, index) => (
                        <div 
                          key={job.id} 
                          className={`p-4 rounded-xl border ${
                            index === 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100' :
                            index === 1 ? 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100' :
                            'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
                          }`}
                        >
                          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{job.title}</h4>
                          <p className="text-sm text-gray-600 mb-1">{job.budgetRange}</p>
                          <p className="text-xs text-gray-500 mb-3">{job.projectType}</p>
                          <button 
                            onClick={() => window.location.href = '/freelancer/jobs'}
                            className={`w-full px-4 py-2 text-white text-sm font-medium rounded-lg transition ${
                              index === 0 ? 'bg-green-600 hover:bg-green-700' :
                              index === 1 ? 'bg-teal-600 hover:bg-teal-700' :
                              'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            View Job
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No jobs available yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerFeed;
