import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, DollarSign, Clock, Video, ExternalLink, MessageSquare, Heart, Trash2, Eye } from 'lucide-react';
import Button from '../components/Button';
import FreelancerAnalytics from '../components/FreelancerAnalytics';
import api from '../services/api';
import toast from 'react-hot-toast';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const FreelancerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '', description: '', link: '', image: null
  });
  const [portfolioImagePreview, setPortfolioImagePreview] = useState(null);
  
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: '', description: '', price: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
      fetchProjects();
      setupRealTimeListeners();
    }
  }, [user?.id]);

  const setupRealTimeListeners = () => {
    if (!user?.id) return;

    // Real-time listener for posts
    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoadingPosts(false);
    });

    return () => {
      unsubscribePosts();
    };
  };

  const fetchProfileData = async () => {
    try {
      const response = await api.get(`/profile/public/${user.id}`);
      if (response.data.success) {
        setProfileData(response.data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handlePortfolioImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPortfolioForm({ ...portfolioForm, image: file });
      setPortfolioImagePreview(URL.createObjectURL(file));
    }
  };

  const openAddPortfolioModal = () => {
    setPortfolioForm({ title: '', description: '', link: '', image: null });
    setPortfolioImagePreview(null);
    setShowPortfolioModal(true);
  };

  const handleSavePortfolio = async () => {
    if (!portfolioForm.title?.trim() || !portfolioForm.description?.trim()) {
      toast.error('Please fill in title and description');
      return;
    }

    try {
      let imageUrl = '';

      // Upload image if selected
      if (portfolioForm.image instanceof File) {
        console.log('Uploading portfolio image...');
        const formData = new FormData();
        formData.append('image', portfolioForm.image);
        const uploadResponse = await api.post('/profile/upload-image', formData);
        imageUrl = uploadResponse.data.imageUrl;
        console.log('Image uploaded successfully:', imageUrl);
      } else {
        console.log('No image file selected');
      }

      const portfolioItem = {
        title: portfolioForm.title.trim(),
        description: portfolioForm.description.trim(),
        link: portfolioForm.link?.trim() || '',
        image: imageUrl
      };

      console.log('Saving portfolio item:', portfolioItem);

      // Use the dedicated portfolio endpoint
      await api.post('/profile/portfolio', portfolioItem);
      toast.success('Portfolio added!');
      
      // Reset and close
      setShowPortfolioModal(false);
      setPortfolioForm({ title: '', description: '', link: '', image: null });
      setPortfolioImagePreview(null);
      
      // Refresh
      await fetchProfileData();
    } catch (error) {
      console.error('Portfolio save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save portfolio');
    }
  };

  const handleDeletePortfolio = async (index) => {
    if (!window.confirm('Delete this portfolio item?')) return;

    try {
      const portfolio = [...(profileData?.portfolio || [])];
      portfolio.splice(index, 1);
      await api.put(`/profile/${user.id}`, { portfolio });
      toast.success('Portfolio deleted!');
      await fetchProfileData();
    } catch (error) {
      toast.error('Failed to delete portfolio');
    }
  };

  const openAddServiceModal = () => {
    setServiceForm({ title: '', description: '', price: '' });
    setShowServiceModal(true);
  };

  const handleSaveService = async () => {
    if (!serviceForm.title?.trim() || !serviceForm.description?.trim()) {
      toast.error('Please fill in title and description');
      return;
    }

    try {
      const serviceItem = {
        title: serviceForm.title.trim(),
        description: serviceForm.description.trim(),
        price: serviceForm.price?.trim() || ''
      };

      // Get current services and add new item
      const currentServices = profileData?.services || [];
      const updatedServices = [...currentServices, serviceItem];

      await api.put(`/profile/${user.id}`, { services: updatedServices });
      toast.success('Service added!');
      
      // Reset and close
      setShowServiceModal(false);
      setServiceForm({ title: '', description: '', price: '' });
      
      // Refresh
      await fetchProfileData();
    } catch (error) {
      console.error('Service save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleDeleteService = async (index) => {
    if (!window.confirm('Delete this service?')) return;

    try {
      const services = [...(profileData?.services || [])];
      services.splice(index, 1);
      await api.put(`/profile/${user.id}`, { services });
      toast.success('Service deleted!');
      await fetchProfileData();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-500">
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Afro Task</h1>
          <Button onClick={logout} variant="outline">Logout</Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        {/* Profile Header */}
        <div className="glass rounded-3xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {profileData?.profileImage ? (
              <img
                src={profileData.profileImage}
                alt={profileData?.fullName}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.fullName || 'User')}&size=200&background=10b981&color=fff`;
                }}
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-green-500 border-4 border-white flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {profileData?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-1">{profileData?.fullName || 'User'}</h2>
              <p className="text-white/90 text-xl mb-2">{profileData?.professionalTitle || 'Freelancer'}</p>
              <p className="text-white/80 text-sm mb-3">{profileData?.email}</p>
              
              <div className="flex flex-wrap gap-3 mb-4">
                {profileData?.yearsOfExperience && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                    <Briefcase className="w-4 h-4" />
                    {profileData.yearsOfExperience} years exp
                  </span>
                )}
                {profileData?.availability && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                    <Clock className="w-4 h-4" />
                    {profileData.availability}
                  </span>
                )}
                {profileData?.hourlyRate && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                    <DollarSign className="w-4 h-4" />
                    ${profileData.hourlyRate}/hr
                  </span>
                )}
              </div>

              {profileData?.bio && (
                <p className="text-white/90 text-sm leading-relaxed mb-4">{profileData.bio}</p>
              )}

              {/* Social Links */}
              {profileData?.socialLinks && (
                <div className="flex flex-wrap gap-2">
                  {profileData.socialLinks.linkedin && (
                    <a
                      href={profileData.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      LinkedIn
                    </a>
                  )}
                  {profileData.socialLinks.github && (
                    <a
                      href={profileData.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      GitHub
                    </a>
                  )}
                  {profileData.socialLinks.portfolio && (
                    <a
                      href={profileData.socialLinks.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Portfolio
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mb-6">
          <FreelancerAnalytics userId={user?.id} />
        </div>

        {/* Skills Section */}
        {profileData?.skills && profileData.skills.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages Section */}
        {profileData?.languages && profileData.languages.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.languages.map((language, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white/20 text-white rounded-full text-sm"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Intro Video Section */}
        {profileData?.introVideoUrl && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Video className="w-6 h-6" />
              Introduction Video
            </h3>
            <video
              src={profileData.introVideoUrl}
              controls
              className="w-full max-h-96 rounded-lg"
            />
          </div>
        )}

        {/* Portfolio Section */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Portfolio</h3>
            <button
              onClick={openAddPortfolioModal}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition"
            >
              + Add Project
            </button>
          </div>
          {profileData?.portfolio && profileData.portfolio.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData.portfolio.map((item, index) => {
                console.log(`Portfolio item ${index}:`, item);
                console.log(`Image URL:`, item.image);
                return (
                <div key={index} className="bg-white/10 rounded-xl overflow-hidden">
                  {item.image ? (
                    <div className="w-full h-48 bg-green-200">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', item.image);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-green-200 flex items-center justify-center">
                      <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-white/80 text-sm mb-3">{item.description}</p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/90 text-sm hover:underline flex items-center gap-1 mb-3"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Project
                      </a>
                    )}
                    <button
                      onClick={() => handleDeletePortfolio(index)}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <p className="text-white/70 text-center py-4">No portfolio items yet. Add your first project!</p>
          )}
        </div>

        {/* Services Section */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Services</h3>
            <button
              onClick={openAddServiceModal}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition"
            >
              + Add Service
            </button>
          </div>
          {profileData?.services && profileData.services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData.services.map((service, index) => (
                <div key={index} className="bg-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white">{service.title}</h4>
                    {service.price && (
                      <span className="text-white/90 font-medium">{service.price}</span>
                    )}
                  </div>
                  <p className="text-white/80 text-sm mb-3">{service.description}</p>
                  <button
                    onClick={() => handleDeleteService(index)}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
                  >
                    Delete Service
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/70 text-center py-4">No services listed yet. Add your first service!</p>
          )}
        </div>

        {/* Projects Section */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">My Projects</h3>
          </div>
          {loadingProjects ? (
            <p className="text-white/70 text-center py-8">Loading projects...</p>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/70 mb-4">No projects yet. Start applying to jobs!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{project.job?.title || 'Project'}</h4>
                      <p className="text-white/70 text-sm line-clamp-2">{project.job?.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                      project.status === 'completed' 
                        ? 'bg-green-500/20 text-green-300'
                        : project.status === 'awaiting_confirmation'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {project.status === 'awaiting_confirmation' ? 'Pending' : project.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{project.job?.budget || project.job?.budgetRange || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(project.startedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                    <img
                      src={project.client?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.client?.fullName || 'Client')}`}
                      alt={project.client?.fullName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{project.client?.fullName}</p>
                      <p className="text-white/60 text-xs">{project.client?.companyName || 'Client'}</p>
                    </div>
                    <button
                      onClick={() => window.location.href = `/project/${project.id}`}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-sm rounded transition"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Posts Section */}
        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Posts</h3>
          </div>
          {loadingPosts ? (
            <p className="text-white/70 text-center py-8">Loading posts...</p>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/70 mb-4">No posts yet. Share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={post.author?.profileImage || `https://ui-avatars.com/api/?name=${post.author?.fullName}`}
                      alt={post.author?.fullName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">{post.author?.fullName}</p>
                      <p className="text-white/60 text-xs">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {post.content && (
                    <p className="text-white mb-3">{post.content}</p>
                  )}
                  
                  {post.mediaUrl && (
                    <div className="mb-3">
                      {post.type === 'video' || post.mediaType === 'video' ? (
                        <video
                          src={post.mediaUrl}
                          controls
                          className="w-full rounded-lg max-h-96"
                        />
                      ) : (
                        <img
                          src={post.mediaUrl}
                          alt="Post media"
                          className="w-full rounded-lg"
                        />
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-white/70 text-sm">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1 hover:text-white transition ${
                        post.likes?.includes(user.id) ? 'text-red-400' : ''
                      }`}
                    >
                      <Heart className="w-5 h-5" fill={post.likes?.includes(user.id) ? 'currentColor' : 'none'} />
                      <span>{post.likes?.length || 0}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-5 h-5" />
                      <span>{post.commentsCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-5 h-5" />
                      <span>{post.views || 0} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Modal */}
      {showPortfolioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Portfolio Project</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., E-commerce Website"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe the project..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Link</label>
                <input
                  type="url"
                  value={portfolioForm.link}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, link: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePortfolioImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {portfolioImagePreview && (
                  <div className="mt-3">
                    <img
                      src={portfolioImagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPortfolioModal(false);
                  setPortfolioForm({ title: '', description: '', link: '', image: null });
                  setPortfolioImagePreview(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePortfolio}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
              >
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Service</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Website Development"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe your service..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="text"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., $50/hour or $500 fixed"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowServiceModal(false);
                  setServiceForm({ title: '', description: '', price: '' });
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveService}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerDashboard;
