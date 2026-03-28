import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';
import ReviewModal from '../components/ReviewModal';
import { MapPin, Briefcase, Award, ExternalLink, Mail, Phone, ArrowLeft, MessageCircle, X, DollarSign, Clock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ProfileCompletionWidget from '../components/ProfileCompletionWidget';

const PROJECT_CATEGORIES = [
  'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
  'Video Editing', 'Digital Marketing', 'Writing', 'Data Science',
  'AI / Machine Learning', 'Cybersecurity', 'DevOps', 'Game Development', 'Others'
];

const emptyProjectForm = {
  title: '', description: '', category: '', customCategory: '',
  projectLink: '', technologies: '', completionDate: '', image: null
};

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ title: '', description: '', link: '', image: '' });
  const [serviceForm, setServiceForm] = useState({ title: '', description: '', price: '' });
  const [showDeletePortfolioModal, setShowDeletePortfolioModal] = useState(false);
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showcaseProjects, setShowcaseProjects] = useState([]);
  const [loadingShowcase, setLoadingShowcase] = useState(false);

  // Create/Edit project modal
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const isOwnProfile = user?.id === userId;
  const isFreelancer = profile?.role === 'freelancer';
  const isClient = profile?.role === 'client';

  const tabs = isFreelancer 
    ? ['about', 'portfolio', 'services', 'projects', 'posts', 'reviews']
    : ['about', 'active-jobs', 'completed-jobs', 'posts'];

  const tabLabels = {
    about: 'About',
    portfolio: 'Projects',
    services: 'Services',
    projects: 'Active Jobs',
    posts: 'Posts',
    reviews: 'Reviews',
    'active-jobs': 'Active Jobs',
    'completed-jobs': 'Completed Jobs'
  };

  useEffect(() => {
    fetchProfile();
    if (!isOwnProfile) {
      checkFollowStatus();
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchShowcaseProjects(userId);
    }
  }, [userId]);

  const fetchShowcaseProjects = async (uid) => {
    setLoadingShowcase(true);
    try {
      const res = await api.get(`/profile/showcase-projects?freelancerId=${uid}&limit=50`);
      setShowcaseProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch showcase projects:', err);
      setShowcaseProjects([]);
    } finally {
      setLoadingShowcase(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/profile/public/${userId}`);
      const profileData = response.data.profile;
      
      // Fetch reviews if freelancer
      if (profileData.role === 'freelancer') {
        try {
          const reviewsResponse = await api.get(`/reviews/${userId}`);
          profileData.reviews = reviewsResponse.data.reviews || [];
          profileData.averageRating = reviewsResponse.data.averageRating || 0;
          profileData.totalReviews = reviewsResponse.data.totalReviews || 0;
        } catch (err) {
          console.error('Failed to fetch reviews:', err);
          profileData.reviews = [];
        }
      }
      
      // Fetch jobs if client
      if (profileData.role === 'client') {
        try {
          const jobsResponse = await api.get(`/jobs/my-jobs`);
          const allJobs = jobsResponse.data.jobs || [];
          profileData.activeJobs = allJobs.filter(job => job.status === 'open' || job.status === 'ongoing');
          profileData.completedJobs = allJobs.filter(job => job.status === 'completed' || job.status === 'closed');
        } catch (err) {
          console.error('Failed to fetch jobs:', err);
          profileData.activeJobs = [];
          profileData.completedJobs = [];
        }
      }
      
      // Fetch posts
      try {
        const postsResponse = await api.get(`/posts/user/${userId}`);
        profileData.posts = postsResponse.data.posts || [];
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        profileData.posts = [];
      }
      
      // Fetch projects if freelancer
      if (profileData.role === 'freelancer') {
        try {
          const projectsResponse = await api.get(`/profile/showcase-projects?freelancerId=${userId}&limit=50`);
          profileData.projects = projectsResponse.data.projects || [];
        } catch (err) {
          console.error('Failed to fetch projects:', err);
          profileData.projects = [];
        }
      }
      
      setProfile(profileData);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await api.get(`/follows/${userId}/status`);
      setFollowing(response.data.following);
    } catch (error) {
      console.error('Failed to check follow status');
    }
  };

  const handleFollow = async () => {
    if (loadingFollow) return;
    
    try {
      setLoadingFollow(true);
      const response = await api.post(`/follows/${userId}`);
      setFollowing(response.data.following);
      toast.success(response.data.following ? 'Following!' : 'Unfollowed');
    } catch (error) {
      toast.error('Failed to follow user');
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      await api.delete(`/posts/${postToDelete}`);
      toast.success('Post deleted!');
      setShowDeleteModal(false);
      setPostToDelete(null);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleAddPortfolio = async () => {
    if (!portfolioForm.title || !portfolioForm.description) {
      toast.error('Please fill in title and description');
      return;
    }
    try {
      await api.post('/profile/portfolio', portfolioForm);
      toast.success('Portfolio item added!');
      setShowPortfolioModal(false);
      setPortfolioForm({ title: '', description: '', link: '', image: '' });
      fetchProfile();
    } catch (error) {
      toast.error('Failed to add portfolio item');
    }
  };

  const handleAddService = async () => {
    if (!serviceForm.title || !serviceForm.description || !serviceForm.price) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await api.post('/profile/services', serviceForm);
      toast.success('Service added!');
      setShowServiceModal(false);
      setServiceForm({ title: '', description: '', price: '' });
      fetchProfile();
    } catch (error) {
      toast.error('Failed to add service');
    }
  };

  const handleContactUser = async () => {
    try {
      const response = await api.post('/pre-project-chats/create-direct', {
        otherUserId: userId
      });

      if (response.data.success) {
        const messagesPath = `/${user?.role}/messages?chatId=${response.data.chatId}`;
        navigate(messagesPath);
        toast.success(`Opening chat with ${profile?.fullName}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to open chat');
    }
  };

  // ── Showcase project handlers ─────────────────────────────────────────────
  const openCreateProject = () => {
    setEditingProject(null);
    setProjectForm(emptyProjectForm);
    setImagePreview(null);
    setUploadProgress(0);
    setShowProjectModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProjectForm(f => ({ ...f, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSaveProject = async () => {
    const { title, description, category, customCategory, projectLink, technologies, completionDate, image } = projectForm;
    if (!title.trim() || !description.trim() || !category) {
      toast.error('Title, description and category are required'); return;
    }
    const finalCategory = category === 'Others' && customCategory.trim() ? customCategory.trim() : category;
    setSaving(true);
    try {
      const data = new FormData();
      data.append('title', title.trim());
      data.append('description', description.trim());
      data.append('category', finalCategory);
      data.append('projectLink', projectLink.trim());
      data.append('technologies', technologies);
      data.append('completionDate', completionDate || '');
      data.append('freelancerName', profile?.fullName || user.name || '');
      data.append('freelancerProfileImage', profile?.profileImage || '');
      if (image instanceof File) data.append('image', image);

      await api.post('/profile/showcase-projects', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      toast.success('Project created and published!');
      setShowProjectModal(false);
      setProjectForm(emptyProjectForm);
      setImagePreview(null);
      setUploadProgress(0);
      fetchShowcaseProjects(userId);
    } catch (err) {
      console.error('Save project error:', err);
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Navbar />
          <div className="p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded-t-3xl mb-20"></div>
                <div className="bg-white rounded-b-3xl p-8">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Navbar />
          <div className="p-4 md:p-8">
            <div className="max-w-6xl mx-auto text-center py-12">
              <p className="text-gray-600 text-lg">Profile not found</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen  bg-gray-50">
      <Sidebar />
      
      <div className="w-screen lg:flex-1 lg:ml-64">
        <Navbar />
        <div className="p-2 md:p-8">
          <div className="mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            {/* Cover Banner */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`lg:h-64 h-32 rounded-t-3xl ${
                isFreelancer 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500'
              } relative`}
            >
              <div className="absolute lg:-bottom-16 -bottom-10 left-8">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile?.fullName}
                    className="lg:w-32 lg:h-32 w-20 h-20 rounded-full object-cover lg:border-8 border-4 border-white shadow-xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || 'User')}&size=200&background=${isFreelancer ? '10b981' : 'eab308'}&color=fff`;
                    }}
                  />
                ) : (
                  <div className={`w-32 h-32 rounded-full ${
                    isFreelancer ? 'bg-green-500' : 'bg-yellow-500'
                  } border-8 border-white flex items-center justify-center text-white text-5xl font-bold shadow-xl`}>
                    {profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-b-3xl shadow-lg lg:pt-20 pt-10 px-8 pb-6 mb-6"
            >
              <div className="grid grid-rows-1 lg:grid-cols-2 md:grid-cols-2 justify-between items-end">
                <div>
                  <h1 className="lg:text-3xl text-xl font-bold text-gray-900 mb-2">{profile?.fullName}</h1>
                  <div className="flex items-center gap-4 text-gray-600 lg:text-base text-sm mb-4">
                    {profile?.country && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.country}</span>
                      </div>
                    )}
                    {isFreelancer && profile?.skillCategory && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{profile.skillCategory}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="lg:text-2xl text-xl font-bold text-gray-900">{profile.followersCount || 0}</p>
                      <p className="lg:text-sm text-xs text-gray-600">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="lg:text-2xl text-xl  font-bold text-gray-900">{profile.followingCount || 0}</p>
                      <p className="lg:text-sm text-xs text-gray-600">Following</p>
                    </div>
                    {isFreelancer && (
                      <div className="text-center">
                        <p className="lg:text-2xl text-xl font-bold text-gray-900">{profile.projects?.length || 0}</p>
                        <p className="lg:text-sm text-xs text-gray-600">Projects</p>
                      </div>
                    )}
                  </div>
                </div>
                {!isOwnProfile && (
                  <div className="flex justify-end mt-4 gap-3">
                    <button
                      onClick={handleFollow}
                      disabled={loadingFollow}
                      className={`px-6 py-2 rounded-lg font-medium transition ${
                        following
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : isFreelancer
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      }`}
                    >
                      {loadingFollow ? '...' : following ? 'Following' : 'Follow'}
                    </button>
                    <button
                      onClick={handleContactUser}
                      className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                        isFreelancer
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Me
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

             {/* Profile Completion Widget */}
            <ProfileCompletionWidget userRole={profile?.role} />

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg mb-6">
<div className="border-b border-gray-200">
                <div className="overflow-x-auto no-scrollbar pb-2">
                  <div className="flex flex-nowrap gap-3 sm:gap-6 px-6 sm:px-8 min-w-max">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 px-3 sm:px-4 font-medium text-sm sm:text-base flex items-center transition whitespace-nowrap relative ${
                          activeTab === tab
                            ? isFreelancer
                              ? 'text-green-600'
                              : 'text-yellow-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {tabLabels[tab]}
                        {activeTab === tab && (
                          <motion.div
                            layoutId="activeTab"
                            className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                              isFreelancer ? 'bg-green-600' : 'bg-yellow-600'
                            }`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'about' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Intro Video Section - Show for Freelancers */}
                    {isFreelancer && profile.introVideoUrl && (
                      <div className="bg-gray-50 rounded-xl lg:p-6 p-3">
                        <h3 className="lg:text-xl text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Award className="w-6 h-6 text-green-600" />
                          Introduction Video
                        </h3>
                        <video
                          src={profile.introVideoUrl}
                          controls
                          className="w-full max-h-96 rounded-lg"
                        />
                      </div>
                    )}

                    {/* Professional Info - From Onboarding */}
                    {isFreelancer && (profile.professionalTitle || profile.bio || profile.yearsOfExperience) && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="lg:text-xl text-sm font-bold text-gray-900 mb-4">Professional Information</h3>
                        {profile.professionalTitle && (
                          <div className="mb-3">
                            <span className="font-semibold text-gray-900">Title: </span>
                            <span className="text-gray-700">{profile.professionalTitle}</span>
                          </div>
                        )}
                        {profile.yearsOfExperience && (
                          <div className="mb-3">
                            <span className="font-semibold text-gray-900">Experience: </span>
                            <span className="text-gray-700">{profile.yearsOfExperience} years</span>
                          </div>
                        )}
                        {profile.bio && (
                          <div className="mt-4">
                            <p className="font-semibold text-gray-900 mb-2">Bio:</p>
                            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                          </div>
                        )}
                        {profile.hourlyRate && (
                          <div className="mt-3">
                            <span className="font-semibold text-gray-900">Hourly Rate: </span>
                            <span className="text-green-600 font-bold">${profile.hourlyRate}/hr</span>
                          </div>
                        )}
                        {profile.availability && (
                          <div className="mt-3">
                            <span className="font-semibold text-gray-900">Availability: </span>
                            <span className="text-gray-700">{profile.availability}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bio Section - Legacy */}
                    {profile.about?.bio && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
                        <p className="text-gray-700">{profile.about.bio}</p>
                        {profile.about.experience && (
                          <div className="mt-3">
                            <span className="font-semibold text-gray-900">Experience: </span>
                            <span className="text-gray-700">{profile.about.experience}</span>
                          </div>
                        )}
                        {profile.about.education && (
                          <div className="mt-2">
                            <span className="font-semibold text-gray-900">Education: </span>
                            <span className="text-gray-700">{profile.about.education}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Skills - From Onboarding */}
                    {isFreelancer && profile.skills && profile.skills.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <span key={index} className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages - From Onboarding */}
                    {isFreelancer && profile.languages && profile.languages.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Languages</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.languages.map((language, index) => (
                            <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Links - From Onboarding */}
                    {isFreelancer && profile.socialLinks && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Social Links</h3>
                        <div className="space-y-2">
                          {profile.socialLinks.linkedin && (
                            <a
                              href={profile.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                              LinkedIn
                            </a>
                          )}
                          {profile.socialLinks.github && (
                            <a
                              href={profile.socialLinks.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-800 hover:text-gray-900"
                            >
                              <ExternalLink className="w-4 h-4" />
                              GitHub
                            </a>
                          )}
                          {profile.socialLinks.portfolio && (
                            <a
                              href={profile.socialLinks.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-green-600 hover:text-green-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Portfolio
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <Mail className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">{profile?.email}</p>
                          </div>
                        </div>
                        {profile?.whatsapp && (
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Phone className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="text-sm text-gray-600">WhatsApp</p>
                              <p className="font-medium text-gray-900">{profile.whatsapp}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Legacy Skills */}
                    {isFreelancer && profile.about?.skills && profile.about.skills.length > 0 && !profile.skills && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.about.skills.map((skill, index) => (
                            <span key={index} className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Legacy Links */}
                    {isFreelancer && (profile?.portfolioWebsite || profile?.linkedIn) && !profile.socialLinks && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Links</h3>
                        <div className="space-y-2">
                          {profile?.portfolioWebsite && (
                            <a
                              href={profile.portfolioWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-green-600 hover:text-green-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Portfolio Website
                            </a>
                          )}
                          {profile?.linkedIn && (
                            <a
                              href={profile.linkedIn}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-green-600 hover:text-green-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                              LinkedIn Profile
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Company Info */}
                    {isClient && profile?.companyName && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Company Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Company Name</p>
                            <p className="font-medium text-gray-900">{profile.companyName}</p>
                          </div>
                          {profile.companyWebsite && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">Website</p>
                              <a 
                                href={profile.companyWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:text-blue-700"
                              >
                                {profile.companyWebsite}
                              </a>
                            </div>
                          )}
                          {profile.industry && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">Industry</p>
                              <p className="font-medium text-gray-900">{profile.industry}</p>
                            </div>
                          )}
                        </div>
                        {profile.hiringPreferences && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">Hiring Preferences</p>
                            <div className="space-y-1 text-sm text-gray-700">
                              {profile.hiringPreferences.lookingFor && (
                                <p><span className="font-medium">Looking for:</span> {profile.hiringPreferences.lookingFor}</p>
                              )}
                              {profile.hiringPreferences.budgetRange && (
                                <p><span className="font-medium">Budget:</span> {profile.hiringPreferences.budgetRange}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'portfolio' && isFreelancer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {isOwnProfile && (
                      <button
                        onClick={openCreateProject}
                        className="mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                      >
                        + Create Project
                      </button>
                    )}
                    {loadingShowcase ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1,2,3].map(i => (
                          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                            <div className="w-full h-48 bg-gray-200" />
                            <div className="p-6 space-y-3">
                              <div className="h-4 bg-gray-200 rounded w-3/4" />
                              <div className="h-3 bg-gray-200 rounded w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : showcaseProjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {showcaseProjects.map((item) => (
                          <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
                            {item.projectImage ? (
                              <img
                                src={item.projectImage}
                                alt={item.title}
                                className="w-full h-48 object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-full h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                <Briefcase className="w-16 h-16 text-green-600" />
                              </div>
                            )}
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-lg text-gray-900">{item.title}</h4>
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full ml-2 shrink-0">{item.category}</span>
                              </div>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.description}</p>
                              {item.technologies?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {item.technologies.map((t, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{t}</span>
                                  ))}
                                </div>
                              )}
                              {item.projectLink && (
                                <a href={item.projectLink} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium mb-4">
                                  <ExternalLink className="w-4 h-4" />View Project
                                </a>
                              )}
                              {!isOwnProfile && (
                                <button onClick={handleContactUser}
                                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center justify-center gap-2">
                                  <MessageCircle className="w-4 h-4" />Contact Me
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No projects yet</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'services' && isFreelancer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {isOwnProfile && (
                      <button
                        onClick={() => setShowServiceModal(true)}
                        className="mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                      >
                        + Add Service
                      </button>
                    )}
                    {profile.services && profile.services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {profile.services.map((service) => (
                          <div key={service.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
                            <h4 className="font-bold text-lg text-gray-900 mb-3">{service.title}</h4>
                            <p className="text-gray-700 text-sm mb-4 line-clamp-3">{service.description}</p>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-2xl font-bold text-green-600">{service.price}</span>
                              <Briefcase className="w-6 h-6 text-green-600" />
                            </div>
                            
                            {isOwnProfile ? (
                              <button
                                onClick={() => {
                                  setItemToDelete(service);
                                  setShowDeleteServiceModal(true);
                                }}
                                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition"
                              >
                                Delete Service
                              </button>
                            ) : (
                              <button
                                onClick={handleContactUser}
                                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center justify-center gap-2"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Contact Me
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No services listed yet</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'active-jobs' && isClient && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {profile.activeJobs && profile.activeJobs.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {profile.activeJobs.map((job) => (
                          <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-lg text-gray-900">{job.title}</h4>
                                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {job.status?.toUpperCase() || 'ACTIVE'}
                                </span>
                              </div>
                              {job.budgetRange && (
                                <p className="text-xl font-bold text-yellow-600">{job.budgetRange}</p>
                              )}
                            </div>
                            {job.description && (
                              <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                            )}
                            {job.requiredSkills && job.requiredSkills.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {job.requiredSkills.map((skill, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No active jobs</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'completed-jobs' && isClient && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {profile.completedJobs && profile.completedJobs.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {profile.completedJobs.map((job) => (
                          <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-lg text-gray-900">{job.title}</h4>
                                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  COMPLETED
                                </span>
                              </div>
                              {job.budgetRange && (
                                <p className="text-xl font-bold text-gray-600">{job.budgetRange}</p>
                              )}
                            </div>
                            {job.description && (
                              <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                            )}
                            {job.completedAt && (
                              <p className="text-sm text-gray-500">
                                Completed on {new Date(job.completedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No completed jobs yet</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'projects' && isFreelancer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {(() => {
                      const activeJobs = (profile.projects || []).filter(p =>
                        p.status === 'ongoing' || p.status === 'awaiting_confirmation' || p.status === 'active'
                      );
                      return activeJobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeJobs.map((project) => (
                            <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-6">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg text-gray-900 mb-1">{project.job?.title || 'Project'}</h4>
                                  <p className="text-gray-600 text-sm line-clamp-2">{project.job?.description}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                                  project.status === 'awaiting_confirmation'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {project.status === 'awaiting_confirmation' ? 'Pending' : 'Ongoing'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span>{project.job?.budget || project.job?.budgetRange || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{new Date(project.startedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                                <img
                                  src={project.client?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.client?.fullName || 'Client')}`}
                                  alt={project.client?.fullName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <p className="text-gray-900 text-sm font-medium">{project.client?.fullName}</p>
                                  <p className="text-gray-600 text-xs">{project.client?.companyName || 'Client'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No active jobs at the moment</p>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {activeTab === 'posts' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {profile.posts && profile.posts.length > 0 ? (
                      <div className="space-y-4">
                        {profile.posts.map((post) => (
                          <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-6 relative">
                            <div className="flex items-start gap-4 mb-4">
                              <img
                                src={profile.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}`}
                                alt={profile.fullName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900">{profile.fullName}</h5>
                                <p className="text-sm text-gray-500">
                                  {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              {isOwnProfile && (
                                <button
                                  onClick={() => {
                                    setPostToDelete(post.id);
                                    setShowDeleteModal(true);
                                  }}
                                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            
                            {post.content && (
                              <p className="text-gray-800 mb-4">{post.content}</p>
                            )}
                            
                            {post.mediaUrl && (
                              <div className="mb-4">
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
                            
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <span>❤️ {post.likes?.length || 0} likes</span>
                              <span>💬 {post.commentsCount || 0} comments</span>
                              <span>👁️ {post.views || 0} views</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No posts yet</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'reviews' && isFreelancer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {!isOwnProfile && (
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="mb-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                      >
                        ⭐ Leave a Review
                      </button>
                    )}
                    
                    {profile.reviews && profile.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {profile.reviews.map((review) => (
                          <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                              <img
                                src={review.reviewer?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer?.fullName || 'User')}`}
                                alt={review.reviewer?.fullName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h5 className="font-semibold text-gray-900">{review.reviewer?.fullName || 'Anonymous'}</h5>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                          ⭐
                                        </span>
                                      ))}
                                      <span className="text-sm text-gray-600 ml-2">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  {user?.id === review.reviewerId && (
                                    <button
                                      onClick={() => {
                                        if (confirm('Delete this review?')) {
                                          api.delete(`/reviews/${review.id}`)
                                            .then(() => {
                                              toast.success('Review deleted!');
                                              fetchProfile();
                                            })
                                            .catch(() => toast.error('Failed to delete review'));
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No reviews yet</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        freelancerName={profile?.fullName}
        onSubmit={async (reviewData) => {
          try {
            await api.post(`/reviews/${userId}`, reviewData);
            toast.success('Review added!');
            fetchProfile();
          } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add review');
            throw error;
          }
        }}
      />

      {/* Delete Post Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Post</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPostToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePost}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Portfolio Modal */}
      <AnimatePresence>
        {showPortfolioModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Portfolio Item</h3>
                <button
                  onClick={() => {
                    setShowPortfolioModal(false);
                    setPortfolioForm({ title: '', description: '', link: '', image: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={portfolioForm.title}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., E-commerce Website"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={portfolioForm.description}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe your project..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Link (optional)
                  </label>
                  <input
                    type="url"
                    value={portfolioForm.link}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={portfolioForm.image}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500">Or upload an image:</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // For now, just show a message that image upload needs backend support
                        toast.info('Image upload feature coming soon. Please use image URL for now.');
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mt-2"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPortfolioModal(false);
                    setPortfolioForm({ title: '', description: '', link: '', image: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPortfolio}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Add Portfolio Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Service Modal */}
      <AnimatePresence>
        {showServiceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Service</h3>
                <button
                  onClick={() => {
                    setShowServiceModal(false);
                    setServiceForm({ title: '', description: '', price: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Logo Design"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe your service..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., $50 or $50-$100"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowServiceModal(false);
                    setServiceForm({ title: '', description: '', price: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddService}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Add Service
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Portfolio Modal */}
      <AnimatePresence>
        {showDeletePortfolioModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Portfolio Item?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeletePortfolioModal(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await api.delete(`/profile/portfolio/${itemToDelete.id}`);
                      toast.success('Portfolio item deleted!');
                      setShowDeletePortfolioModal(false);
                      setItemToDelete(null);
                      fetchProfile();
                    } catch (error) {
                      toast.error('Failed to delete portfolio item');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Service Modal */}
      <AnimatePresence>
        {showDeleteServiceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Service?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteServiceModal(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await api.delete(`/profile/services/${itemToDelete.id}`);
                      toast.success('Service deleted!');
                      setShowDeleteServiceModal(false);
                      setItemToDelete(null);
                      fetchProfile();
                    } catch (error) {
                      toast.error('Failed to delete service');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Create Project Modal ──────────────────────────────────────────── */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Create Project</h3>
              <button onClick={() => setShowProjectModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                <input type="text" value={projectForm.title}
                  onChange={e => setProjectForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., E-commerce Website" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Description *</label>
                <textarea value={projectForm.description}
                  onChange={e => setProjectForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe what you built, the problem it solves, and your role..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={projectForm.category}
                  onChange={e => setProjectForm(f => ({ ...f, category: e.target.value, customCategory: '' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Select a category</option>
                  {PROJECT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {projectForm.category === 'Others' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Category *</label>
                  <input type="text" value={projectForm.customCategory}
                    onChange={e => setProjectForm(f => ({ ...f, customCategory: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Blockchain Development" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-lg" />
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Link</label>
                <input type="url" value={projectForm.projectLink}
                  onChange={e => setProjectForm(f => ({ ...f, projectLink: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://github.com/... or live URL" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
                <input type="text" value={projectForm.technologies}
                  onChange={e => setProjectForm(f => ({ ...f, technologies: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="React, Node.js, MongoDB (comma separated)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
                <input type="date" value={projectForm.completionDate}
                  onChange={e => setProjectForm(f => ({ ...f, completionDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowProjectModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleSaveProject} disabled={saving}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg font-medium transition">
                {saving ? 'Saving...' : 'Publish Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage;
