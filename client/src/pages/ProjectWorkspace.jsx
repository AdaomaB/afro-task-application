import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, MessageSquare, Calendar, DollarSign, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingScreen from '../components/LoadingScreen';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState(null);

  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

  useEffect(() => {
    if (projectId && user) {
      fetchProject();
    }
  }, [projectId, user]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/projects/${projectId}`);
      
      if (response.data.success && response.data.project) {
        setProject(response.data.project);
      } else {
        setError('No project data received');
        toast.error('Failed to load project');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load project';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsFinished = async () => {
    setActionLoading(true);
    try {
      await api.post(`/projects/${projectId}/mark-finished`);
      toast.success('Project marked as finished!');
      await fetchProject();
      
      setPostContent(`Just completed an amazing project: ${project.job?.title}! 🎉`);
      setShowPostModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as finished');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveCompletion = async () => {
    setActionLoading(true);
    try {
      await api.post(`/projects/${projectId}/approve`);
      toast.success('Project completed successfully!');
      
      setPostContent(`Successfully completed a project with ${project.freelancer?.fullName}! 🌟`);
      setShowPostModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve completion');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      toast.error('Please provide revision notes');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/projects/${projectId}/request-revision`, { revisionNotes });
      toast.success('Revision requested.');
      setShowRevisionModal(false);
      setRevisionNotes('');
      await fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request revision');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenChat = () => {
    if (project?.chatId) {
      navigate(`/project-chat/${project.chatId}`);
    } else {
      toast.error('Chat not available');
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      toast.error('Please write something');
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', postContent);
      formData.append('type', postImage ? 'image' : 'text');
      if (postImage) {
        formData.append('media', postImage);
      }

      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Post created!');
      setShowPostModal(false);
      setPostContent('');
      setPostImage(null);
      
      navigate(`/${user.role}/feed`);
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipPost = () => {
    setShowPostModal(false);
    setPostContent('');
    setPostImage(null);
    navigate(`/${user.role}/feed`);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Navbar />
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Project Not Found'}</h2>
                <p className="text-gray-600 mb-6">{error || "The project doesn't exist or you don't have access."}</p>
                <button onClick={() => navigate(-1)} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    const statusConfig = {
      ongoing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Ongoing', icon: Clock },
      awaiting_confirmation: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Awaiting Confirmation', icon: Clock },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed', icon: CheckCircle }
    };
    const config = statusConfig[project.status] || statusConfig.ongoing;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 ${config.bg} ${config.text} text-sm font-semibold rounded-full`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              Back to Projects
            </button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={isFreelancer ? (project.client?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.client?.fullName || 'Client')}&background=random`) : (project.freelancer?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.freelancer?.fullName || 'Freelancer')}&background=random`)}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(isFreelancer ? (project.client?.fullName || 'Client') : (project.freelancer?.fullName || 'Freelancer'))}&background=random`;
                      }}
                    />
                    <div className="text-white">
                      <p className="text-sm opacity-90">{isFreelancer ? 'Client' : 'Freelancer'}</p>
                      <p className="font-bold text-lg">{isFreelancer ? project.client?.fullName : project.freelancer?.fullName}</p>
                    </div>
                  </div>
                  
                  
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{project.job?.title || 'Project'}</h1>
                    <p className="text-gray-600">{project.job?.description || 'No description'}</p>
                  </div>
                  {getStatusBadge()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Started</p>
                      <p className="font-semibold text-gray-900">{project.startedAt ? new Date(project.startedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="font-semibold text-gray-900">{project.job?.budget || project.job?.budgetRange || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Deadline</p>
                      <p className="font-semibold text-gray-900">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}</p>
                    </div>
                  </div>
                </div>

                {project.status === 'awaiting_confirmation' && (
                  <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                    <p className="text-yellow-800 font-medium">
                      {isFreelancer ? '⏳ Waiting for client approval' : '✅ Freelancer marked as finished. Review the work below.'}
                    </p>
                  </div>
                )}

                {project.revisionRequested && project.status === 'ongoing' && (
                  <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-lg">
                    <p className="text-orange-800 font-medium mb-2">🔄 Revision Requested</p>
                    {project.revisionNotes && <p className="text-orange-700 text-sm"><span className="font-semibold">Notes:</span> {project.revisionNotes}</p>}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  {isFreelancer && project.status === 'ongoing' && (
                    <button onClick={handleMarkAsFinished} disabled={actionLoading} className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Mark as Finished
                    </button>
                  )}

                  {isClient && project.status === 'awaiting_confirmation' && (
                    <>
                      <button onClick={handleApproveCompletion} disabled={actionLoading} className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Approve & Complete
                      </button>
                      <button onClick={() => setShowRevisionModal(true)} disabled={actionLoading} className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                        <XCircle className="w-5 h-5" />
                        Request Revision
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Project Details</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{project.job?.description || 'No detailed description.'}</p>

              {project.job?.requiredSkills && project.job.requiredSkills.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.job.requiredSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {showRevisionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Revision</h3>
            <p className="text-gray-600 mb-4">Explain what needs to be revised:</p>
            <textarea value={revisionNotes} onChange={(e) => setRevisionNotes(e.target.value)} rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Describe the changes..." />
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowRevisionModal(false); setRevisionNotes(''); }} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleRequestRevision} disabled={actionLoading || !revisionNotes.trim()} className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50">{actionLoading ? 'Sending...' : 'Send Request'}</button>
            </div>
          </motion.div>
        </div>
      )}

      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Share Your Experience!</h3>
            <p className="text-gray-600 mb-6">{isFreelancer ? 'Let others know about this project!' : 'Share your experience with this freelancer!'}</p>
            
            <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 mb-4" placeholder="Share your thoughts..." />

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add an image (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setPostImage(e.target.files[0])} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {postImage && <p className="text-sm text-gray-600 mt-2">Selected: {postImage.name}</p>}
            </div>

            <div className="flex gap-3">
              <button onClick={handleSkipPost} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Skip</button>
              <button onClick={handleCreatePost} disabled={actionLoading || !postContent.trim()} className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50">{actionLoading ? 'Posting...' : 'Share Post'}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectWorkspace;
