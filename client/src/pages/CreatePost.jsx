import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';

const CreatePost = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    hashtags: ''
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  const isFreelancer = user?.role === 'freelancer';
  const dashboardPath = isFreelancer ? '/freelancer/feed' : '/client/feed';

  const handleMediaChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const newPreviews = newFiles.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));

    setMediaFiles(prev => [...prev, ...newFiles]);
    setMediaPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeMedia = (index) => {
    const fileToRemove = mediaFiles[index];
    const previewToRemove = mediaPreviews[index];
    
    // Cleanup URL
    URL.revokeObjectURL(previewToRemove.url);
    
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate: either content or media must be provided
    if (!formData.content.trim() && mediaFiles.length === 0) {
      toast.error('Please add some content or media');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('content', formData.content);
      
      const hashtagsArray = formData.hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      data.append('hashtags', JSON.stringify(hashtagsArray));
      
      mediaFiles.forEach((file, index) => {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        data.append('media', file);
        data.append(`mediaType_${index}`, type);
      });

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
        <div className="bg-white border-b text-center lg:text-start border-gray-200 px-4 md:px-8 py-4">
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
                    multiple
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${
                      isFreelancer ? 'focus:ring-green-500' : 'focus:ring-yellow-500'
                    } focus:border-transparent`}
                  />
                  {mediaPreviews.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mediaPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          {preview.type === 'video' ? (
                            <video
                              src={preview.url}
                              controls
                              className="w-full h-48 rounded-lg object-cover"
                            />
                          ) : (
                            <img
                              src={preview.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-48 rounded-lg object-cover cursor-pointer"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-all">
                            <button
                              type="button"
                              onClick={() => removeMedia(index)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">{preview.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {mediaFiles.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {mediaFiles.length} file(s) selected. 
                      <button
                        type="button"
                        onClick={() => {
                          mediaFiles.forEach(URL.revokeObjectURL);
                          setMediaFiles([]);
                          setMediaPreviews([]);
                        }}
                        className="text-red-500 hover:text-red-700 font-medium ml-1"
                      >
                        Clear all
                      </button>
                    </p>
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
