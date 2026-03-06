import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const CreatePost = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    hashtags: ''
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
  const [preview, setPreview] = useState(null);

  const isFreelancer = user?.role === 'freelancer';
  const dashboardPath = isFreelancer ? '/freelancer/feed' : '/client/feed';

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setMediaFile(file);
      setMediaType(type);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate: either content or media must be provided
    if (!formData.content.trim() && !mediaFile) {
      toast.error('Please add some content or media');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('content', formData.content);
      data.append('type', mediaType || 'text');
      
      const hashtagsArray = formData.hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      data.append('hashtags', JSON.stringify(hashtagsArray));
      
      if (mediaFile) {
        data.append('media', mediaFile);
        data.append('mediaType', mediaType);
      }

      await api.post('/posts', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Post created successfully!');
      navigate(dashboardPath);
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        {/* Simple Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
          <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
        </div>
        
        <div className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              {isFreelancer ? 'Create Post' : 'Share Company Update'}
            </h1>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isFreelancer ? "What's on your mind?" : "What's new with your company?"}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows={6}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${
                      isFreelancer ? 'focus:ring-green-500' : 'focus:ring-yellow-500'
                    } focus:border-transparent`}
                    placeholder={isFreelancer 
                      ? "Share your thoughts, achievements, or updates..." 
                      : "Share company news, job openings, or announcements..."
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">You can post text, image, or both</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hashtags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.hashtags}
                    onChange={(e) => setFormData({...formData, hashtags: e.target.value})}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${
                      isFreelancer ? 'focus:ring-green-500' : 'focus:ring-yellow-500'
                    } focus:border-transparent`}
                    placeholder={isFreelancer ? "webdev, design, freelance" : "hiring, jobs, company"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Media (Image or Video)
                  </label>
                  <input
                    type="file"
                    onChange={handleMediaChange}
                    accept="image/*,video/*"
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${
                      isFreelancer ? 'focus:ring-green-500' : 'focus:ring-yellow-500'
                    } focus:border-transparent`}
                  />
                  {preview && (
                    <div className="mt-4 relative">
                      {mediaType === 'video' ? (
                        <video
                          src={preview}
                          controls
                          className="rounded-lg max-h-96 w-full"
                        />
                      ) : (
                        <img
                          src={preview}
                          alt="Preview"
                          className="rounded-lg max-h-96 w-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setMediaFile(null);
                          setMediaType(null);
                          setPreview(null);
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(dashboardPath)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 px-6 py-3 ${
                      isFreelancer 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                        : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
                    } text-white rounded-lg transition disabled:opacity-50`}
                  >
                    {loading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
