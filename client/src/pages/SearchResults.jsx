import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';
import AdminSidebar from '../components/AdminSidebar';
import EnhancedPostCard from '../components/EnhancedPostCard';
import JobCard from '../components/JobCard';

export default function SearchResults() {
  const { user: currentUser } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const adminStored = (() => { try { return JSON.parse(localStorage.getItem('adminUser')); } catch { return null; } })();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    posts: 0,
    jobs: 0,
    projects: 0,
    users: 0,
    total: 0
  });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const response = await api.get('/search', {
        params: { q: query, limit: 50 }
      });
      
      setResults(response.data.results || []);
      setCounts(response.data.counts || {});
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = (type) => {
    if (type === 'all') return results;
    return results.filter(item => item.type === type);
  };

  const filteredResults = filterResults(activeTab);

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleJobClick = (jobId) => {
    navigate(`/freelancer/feed?jobId=${jobId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
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
      
      <div className="flex-1 lg:ml-64">
        {(currentUser?.role === 'client' || currentUser?.role === 'freelancer') && <Navbar />}
        
        <div className="p-8">
          <div className="max-w-5xl mx-auto">
            {/* Search Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Search Results
              </h1>
              <p className="text-gray-600">
                Found {counts.total} result{counts.total !== 1 ? 's' : ''} for "{query}"
              </p>
            </motion.div>

            {/* Tab Navigation */}
            {!loading && counts.total > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 border-b">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'text-[#00564C] border-b-2 border-[#00564C]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({counts.total})
                </button>
                {counts.posts > 0 && (
                  <button
                    onClick={() => setActiveTab('post')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'post'
                        ? 'text-[#00564C] border-b-2 border-[#00564C]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Posts ({counts.posts})
                  </button>
                )}
                {counts.jobs > 0 && (
                  <button
                    onClick={() => setActiveTab('job')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'job'
                        ? 'text-[#00564C] border-b-2 border-[#00564C]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Jobs ({counts.jobs})
                  </button>
                )}
                {counts.projects > 0 && (
                  <button
                    onClick={() => setActiveTab('project')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'project'
                        ? 'text-[#00564C] border-b-2 border-[#00564C]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Projects ({counts.projects})
                  </button>
                )}
                {counts.users > 0 && (
                  <button
                    onClick={() => setActiveTab('user')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'user'
                        ? 'text-[#00564C] border-b-2 border-[#00564C]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    People ({counts.users})
                  </button>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results State */}
            {!loading && counts.total === 0 && query && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try using different keywords or check your spelling</p>
              </motion.div>
            )}

            {/* Results */}
            <div className="space-y-4">
              {filteredResults.map((result, index) => (
                <motion.div
                  key={`${result.type}-${result.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {result.type === 'post' && (
                    <EnhancedPostCard post={result} onDelete={() => {}} />
                  )}
                  
                  {result.type === 'job' && (
                    <div 
                      onClick={() => handleJobClick(result.id)}
                      className="cursor-pointer"
                    >
                      <JobCard job={result} onApply={() => {}} />
                    </div>
                  )}
                  
                  {result.type === 'user' && (
                    <div
                      onClick={() => handleUserClick(result.id)}
                      className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        {result.resultImage && (
                          <img
                            src={result.resultImage}
                            alt={result.resultTitle}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {result.resultTitle}
                          </h3>
                          <p className="text-gray-600">{result.resultSubtitle}</p>
                          {result.bio && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                              {result.bio}
                            </p>
                          )}
                          {result.skills && result.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {result.skills.slice(0, 3).map((skill, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 text-xs bg-[#00564C]/10 text-[#00564C] rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                              {result.skills.length > 3 && (
                                <span className="px-3 py-1 text-xs text-gray-600">
                                  +{result.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {result.type === 'project' && (
                    <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {result.resultTitle}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {result.description?.substring(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {result.resultSubtitle}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
