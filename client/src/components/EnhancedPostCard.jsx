import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Send, Smile, Play, Pause } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import EmojiPicker from 'emoji-picker-react';

const EnhancedPostCard = ({ post, onDelete }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [viewCount, setViewCount] = useState(post.views || 0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imageModal, setImageModal] = useState(false);
  const [videoModal, setVideoModal] = useState(false);
  const [following, setFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);

  const isOwner = user?.uid === post.authorId;
  const postAuthor = post.author || post.user;
  const hasVideo = post.type === 'video' || post.mediaType === 'video';
  const hasImage = (post.type === 'image' || post.image) && !hasVideo;

  // Real-time listener for view count updates
  useEffect(() => {
    if (!post.id) return;

    const unsubscribe = onSnapshot(doc(db, 'posts', post.id), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setViewCount(data.views || 0);
        setLikeCount(data.likes?.length || 0);
      }
    });

    return () => unsubscribe();
  }, [post.id]);

  // Handle video modal open - track view when modal opens
  const handleVideoClick = async () => {
    setVideoModal(true);
    
    // Track view when video modal is opened (not on preview)
    if (!isOwner && !viewTracked && post.id && user?.uid) {
      try {
        const response = await api.post(`/posts/${post.id}/view`);
        if (response.data.newView) {
          setViewTracked(true);
        }
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    }
  };

  useEffect(() => {
    // Check if already liked
    if (post.likes && user?.id) {
      setLiked(post.likes.includes(user.id));
    }
  }, [post.likes, user?.id]);

  // Track post view - only once per user, NOT for video preview
  useEffect(() => {
    const trackView = async () => {
      // Don't track for videos (they track when modal opens)
      // Don't track for own posts
      // Don't track if already tracked
      if (hasVideo || isOwner || !post.id || !user?.id || viewTracked) return;
      
      try {
        const response = await api.post(`/posts/${post.id}/view`);
        if (response.data.newView) {
          setViewTracked(true);
        }
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };
    
    // Track view after a short delay to ensure user is actually viewing
    const timer = setTimeout(trackView, 1000);
    return () => clearTimeout(timer);
  }, [post.id, isOwner, user?.id, hasVideo, viewTracked]);

  useEffect(() => {
    // Check if already following
    const checkFollowStatus = async () => {
      if (!isOwner && post.authorId && user?.id) {
        try {
          const response = await api.get(`/follows/${post.authorId}/status`);
          setFollowing(response.data.following);
        } catch (error) {
          console.error('Failed to check follow status');
        }
      }
    };
    checkFollowStatus();
  }, [post.authorId, user?.id, isOwner]);

  useEffect(() => {
    if (showComments && post.id) {
      fetchComments();
    }
  }, [showComments, post.id]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/posts/${post.id}/comments`);
      console.log('Comments fetched:', response.data.comments);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const handleUserClick = () => {
    if (post.authorId && post.authorId !== user?.id) {
      navigate(`/profile/${post.authorId}`);
    } else if (post.authorId === user?.id) {
      navigate(`/${user.role}/profile`);
    }
  };

  const handleLike = async () => {
    try {
      const newLiked = !liked;
      setLiked(newLiked);
      setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
      await api.post(`/posts/${post.id}/like`);
    } catch (error) {
      setLiked(!liked);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
      toast.error('Failed to like post');
    }
  };

  const handleFollow = async () => {
    if (loadingFollow) return;
    
    try {
      setLoadingFollow(true);
      const response = await api.post(`/follows/${post.authorId}`);
      setFollowing(response.data.following);
      toast.success(response.data.following ? 'Following!' : 'Unfollowed');
    } catch (error) {
      toast.error('Failed to follow user');
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${postAuthor?.fullName}`,
          text: post.content,
          url: shareUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    console.log('=== SUBMITTING COMMENT ===');
    console.log('Comment content:', newComment);
    console.log('Post ID:', post.id);
    console.log('User:', user);

    try {
      const response = await api.post(`/posts/${post.id}/comments`, {
        content: newComment.trim()
      });
      console.log('Comment posted successfully:', response.data);
      
      // Add the new comment to the list immediately
      setComments(prev => [...prev, response.data.comment]);
      setNewComment('');
      setShowEmojiPicker(false);
      toast.success('Comment posted!');
      
      // Refresh comments to ensure sync
      await fetchComments();
    } catch (error) {
      console.error('Failed to post comment:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(error.response?.data?.message || 'Failed to post comment');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${post.id}`);
        toast.success('Post deleted');
        onDelete?.(post.id);
      } catch (error) {
        toast.error('Failed to delete post');
      }
    }
  };

  const getTypeBadge = () => {
    const role = postAuthor?.role || post.authorRole;
    const badges = {
      freelancer: { text: 'Freelancer', color: 'bg-green-100 text-green-800' },
      client: { text: 'Client', color: 'bg-yellow-100 text-yellow-800' }
    };
    const badge = badges[role] || badges.freelancer;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={postAuthor?.profileImage || `https://ui-avatars.com/api/?name=${postAuthor?.fullName || 'User'}`}
              alt={postAuthor?.fullName}
              onClick={handleUserClick}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 cursor-pointer hover:ring-4 hover:ring-gray-200 transition"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 
                  onClick={handleUserClick}
                  className="font-semibold text-gray-900 cursor-pointer hover:text-green-600 transition"
                >
                  {postAuthor?.fullName || 'Unknown User'}
                </h3>
                {getTypeBadge()}
              </div>
              <p className="text-sm text-gray-500">{postAuthor?.skillCategory || postAuthor?.role} • {formatTime(post.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOwner && (
              <button 
                onClick={handleFollow}
                disabled={loadingFollow}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${
                  following 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {loadingFollow ? '...' : following ? 'Following' : 'Follow'}
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition"
                    >
                      Delete Post
                    </button>
                  )}
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition">
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-gray-800 mb-3 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        )}

        {/* Video - Click to open modal */}
        {hasVideo && post.mediaUrl && (
          <div 
            className={`relative group ${post.content ? "mb-3" : "mb-0"} cursor-pointer`}
            onClick={handleVideoClick}
          >
            <video
              src={post.mediaUrl}
              className="w-full max-h-[500px] object-cover rounded-xl"
              muted
              playsInline
            />
            {/* Play Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all rounded-xl">
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
                <Play className="w-10 h-10 text-gray-900 ml-1" />
              </div>
            </div>
          </div>
        )}

        {/* Image - Compact Design */}
        {hasImage && post.image && (
          <div className={post.content ? "mb-3" : "mb-0"}>
            <img
              src={post.image}
              alt="Post"
              className="w-full max-h-96 object-cover rounded-xl cursor-pointer hover:opacity-95 transition"
              onClick={() => setImageModal(true)}
            />
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.hashtags.map((tag, index) => (
              <span key={index} className="text-green-600 hover:text-green-700 cursor-pointer text-sm font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
        <span>{likeCount} likes</span>
        <span>{post.commentsCount || 0} comments</span>
      </div>

      {/* Actions */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-around">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            liked ? 'text-red-600' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          <span className="font-medium">Like</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Comment</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Share</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setBookmarked(!bookmarked)}
          className={`p-2 rounded-lg transition ${
            bookmarked ? 'text-green-600' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
        </motion.button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 bg-gray-50"
          >
            <div className="p-6 max-h-96 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 mb-4">
                    <img
                      src={comment.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.fullName || 'User')}`}
                      alt={comment.user?.fullName || 'User'}
                      className="w-8 h-8 rounded-full object-cover cursor-pointer"
                      onClick={() => comment.userId && navigate(`/profile/${comment.userId}`)}
                    />
                    <div className="flex-1">
                      <div className="bg-white rounded-lg px-4 py-2">
                        <p 
                          className="font-semibold text-sm text-gray-900 cursor-pointer hover:underline"
                          onClick={() => comment.userId && navigate(`/profile/${comment.userId}`)}
                        >
                          {comment.user?.fullName || 'Anonymous User'}
                        </p>
                        <p className="text-gray-800 text-sm">{comment.content || 'No content'}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-1 ml-4">
                        <p className="text-xs text-gray-500">{formatTime(comment.createdAt)}</p>
                        <button
                          onClick={async () => {
                            try {
                              await api.post(`/posts/${post.id}/comments/${comment.id}/like`);
                              // Refresh comments to update like count
                              await fetchComments();
                            } catch (error) {
                              toast.error('Failed to like comment');
                            }
                          }}
                          className={`text-xs font-medium ${
                            comment.likes?.includes(user?.uid) ? 'text-red-500' : 'text-gray-500'
                          } hover:text-red-500 transition`}
                        >
                          {comment.likes?.includes(user?.uid) ? '❤️' : '🤍'} {comment.likes?.length || 0}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleComment} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-3">
                <img
                  src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.fullName}`}
                  alt={user?.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1.5 hover:bg-gray-100 rounded-full transition"
                    >
                      <Smile className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="p-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 rounded-full transition"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2 z-20">
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          setNewComment(prev => prev + emojiData.emoji);
                          setShowEmojiPicker(false);
                        }}
                        width={300}
                        height={400}
                      />
                    </div>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      {videoModal && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setVideoModal(false)}
        >
          <button
            onClick={() => setVideoModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <video
            src={post.mediaUrl}
            controls
            autoPlay
            className="max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Image Modal */}
      {imageModal && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModal(false)}
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            src={post.image}
            alt="Post"
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </motion.div>
  );
};

export default EnhancedPostCard;
