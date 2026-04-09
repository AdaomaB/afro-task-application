import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const PostCard = ({ post, onLike }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${post.id}/like`);
      setLiked(response.data.liked);
      setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
      if (onLike) onLike(post.id);
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
    >
      <div className="flex items-start gap-4">
        

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">{post.author?.fullName}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              post.authorRole === 'freelancer'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {post.authorRole === 'freelancer' ? 'Freelancer' : 'Client'}
            </span>
          </div>
          
          <p className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <p className="mt-4 text-gray-700 whitespace-pre-wrap">{post.content}</p>

      {post.hashtags && post.hashtags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.hashtags.map((tag, index) => (
            <span key={index} className="text-blue-500 text-sm">#{tag}</span>
          ))}
        </div>
      )}

      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="mt-4 rounded-xl w-full object-cover max-h-96"
        />
      )}

      <div className="mt-4 flex items-center gap-6 pt-4 border-t border-gray-100">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition ${
            liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <span className="text-xl">{liked ? '❤️' : '🤍'}</span>
          <span className="font-medium">{likesCount}</span>
        </button>
        <div className="flex items-center gap-2 text-gray-500">
          <span>💬</span>
          <span>{post.commentsCount || 0}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
