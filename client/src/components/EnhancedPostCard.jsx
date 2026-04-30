import { useState, useEffect, useContext, useRef, memo } from 'react';
import { MdMoreVert } from "react-icons/md";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from "../context/DarkModeContext";
import { MessageCircle, Bookmark, MoreVertical, Send, Smile, Play, X } from 'lucide-react';
import { TbShare3 } from "react-icons/tb";
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { createPortal } from 'react-dom';
import EmojiPicker from 'emoji-picker-react';
import { getBookmarkedIds, toggleBookmark } from '../pages/BookmarksPage';
// Resolve avatar — admins always use the official logo
const getAvatar = (u) =>
  u?.role === 'admin'
    ? '/img/afro-task-logo.png'
    : (u?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.fullName || 'User')}`);

// Convert emoji codepoint to Twemoji CDN URL for crisp, consistent cross-platform emojis
const twemojiUrl = (emoji) => {
  const cp = [...emoji].map(e => e.codePointAt(0).toString(16)).filter(c => c !== 'fe0f').join('-');
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${cp}.svg`;
};

// Crisp emoji image using Twemoji
const TwEmoji = ({ emoji, size = 20, className = '' }) => (
  <img
    src={twemojiUrl(emoji)}
    alt={emoji}
    width={size}
    height={size}
    className={`inline-block select-none ${className}`}
    draggable={false}
  />
);

const REACTIONS = [
  { emoji: '👍', label: 'Like',      color: 'text-blue-500' },
  { emoji: '❤️', label: 'Love',      color: 'text-red-500' },
  { emoji: '😂', label: 'Haha',      color: 'text-yellow-500' },
  { emoji: '😮', label: 'Wow',       color: 'text-yellow-500' },
  { emoji: '😢', label: 'Sad',       color: 'text-blue-400' },
  { emoji: '😡', label: 'Angry',     color: 'text-red-600' },
  { emoji: '🎉', label: 'Celebrate', color: 'text-purple-500' },
];

// Separate component for the image so it never re-mounts due to parent state changes
const PostImage = memo(({ src, onClick }) => (
  <img
    src={src}
    alt="Post"
    loading="lazy"
    decoding="async"
    className="w-full max-h-96 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity duration-200"
    onClick={onClick}
  />
));

// Reply emoji picker state is local to each reply input
const ReplyInput = ({ comment, postId, onReplied, onCancel }) => {
  const { user } = useContext(AuthContext);
  const [text, setText] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    try {
      await api.post(`/posts/${postId}/comments`, { content: text.trim(), parentId: comment.id });
      setText('');
      setShowPicker(false);
      onReplied();
    } catch {
      toast.error('Failed to post reply');
    }
  };

  return (
    <div className="mt-2 flex gap-2 items-start">
      <img
        src={getAvatar(user)}
        className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-1"
        alt=""
      />
      <div className="flex-1 relative">
        <div className="flex gap-2">
          <input
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder={`Reply to ${comment.user?.fullName?.split(' ')[0]}...`}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none pr-8"
          />
          <button
            type="button"
            onClick={() => setShowPicker(p => !p)}
            className="p-1.5 hover:bg-gray-100 rounded-full transition flex-shrink-0"
          >
            <Smile className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="p-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 rounded-full transition flex-shrink-0"
          >
            <Send className="w-3 h-3 text-white" />
          </button>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-full transition flex-shrink-0">
            <X className="w-3 h-3 text-gray-400" />
          </button>
        </div>
        {showPicker && (
          <div className="absolute bottom-full right-0 mb-2 z-30">
            <EmojiPicker
              onEmojiClick={d => { setText(p => p + d.emoji); setShowPicker(false); }}
              width={280}
              height={350}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const EnhancedPostCard = ({ post, onDelete, isAdminView = false }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { dark } = useDarkMode();
  const mounted = useRef(false); // track first mount to skip re-animation

  // Resolve admin identity from localStorage for admin-authored posts
  const adminUser = (() => { try { return JSON.parse(localStorage.getItem('adminUser')); } catch { return null; } })();
  const isAdminPost = post.authorRole === 'admin';
  const postAuthor = post.author || post.user;
  const hasVideo = post.type === 'video' || post.mediaType === 'video';
  const hasImage = (post.type === 'image' || post.image) && !hasVideo;

  // For admin posts always use the official logo
  const authorAvatar = getAvatar(isAdminPost ? { role: 'admin' } : postAuthor);

  const [liked, setLiked] = useState(false);
  const [myReaction, setMyReaction] = useState(null);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [reactionCounts, setReactionCounts] = useState(post.reactions || {});
  const [bookmarked, setBookmarked] = useState(() =>
    user?.id ? getBookmarkedIds(user.id).includes(post.id) : false
  );
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeCommentMenu, setActiveCommentMenu] = useState(null);
  const [imageModal, setImageModal] = useState(false);
  const [videoModal, setVideoModal] = useState(false);
  const [following, setFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [commentDetailId, setCommentDetailId] = useState(null);
  const reactionRef = useRef(null);

  // isOwner: regular user owns their post, OR admin viewing an admin post
  const isOwner = isAdminPost
    ? (isAdminView || adminUser?.role === 'admin')
    : user?.uid === post.authorId;

  // Mark mounted after first render
  useEffect(() => { mounted.current = true; }, []);

  // Close reaction picker on outside click
  useEffect(() => {
    const h = (e) => { if (reactionRef.current && !reactionRef.current.contains(e.target)) setShowReactions(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Firebase real-time — only update counts, NOT the whole card
  useEffect(() => {
    if (!post.id) return;
    const unsub = onSnapshot(doc(db, 'posts', post.id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // Use functional updates so React batches these without re-animating
        setLikeCount(data.likes?.length || 0);
        setReactionCounts(data.reactions || {});
        if (data.userReactions && data.userReactions[user?.uid]) {
          setMyReaction(data.userReactions[user.uid]);
        }
      }
    });
    return () => unsub();
  }, [post.id, user?.uid]);

  useEffect(() => {
    if (post.likes && user?.id) setLiked(post.likes.includes(user.id));
    if (post.userReactions && user?.uid) setMyReaction(post.userReactions[user.uid] || null);
    if (post.reactions) setReactionCounts(post.reactions);
  }, [post.likes, post.userReactions, post.reactions, user?.id, user?.uid]);

  useEffect(() => {
    const track = async () => {
      if (hasVideo || isOwner || !post.id || !user?.id || viewTracked) return;
      try { const r = await api.post(`/posts/${post.id}/view`); if (r.data.newView) setViewTracked(true); } catch {}
    };
    const t = setTimeout(track, 1000);
    return () => clearTimeout(t);
  }, [post.id, isOwner, user?.id, hasVideo, viewTracked]);

  useEffect(() => {
    const check = async () => {
      if (!isOwner && !isAdminPost && post.authorId && user?.id) {
        try { const r = await api.get(`/follows/${post.authorId}/status`); setFollowing(r.data.following); } catch {}
      }
    };
    check();
  }, [post.authorId, user?.id, isOwner, isAdminPost]);

  useEffect(() => {
    if (showComments && post.id) fetchComments();
  }, [showComments, post.id]);

  useEffect(() => {
    if (showDetailModal && post.id) fetchComments();
  }, [showDetailModal, post.id]);

  const fetchComments = async () => {
    try { const r = await api.get(`/posts/${post.id}/comments`); setComments(r.data.comments || []); }
    catch { setComments([]); }
  };

  const handleVideoClick = async () => {
    setVideoModal(true);
    if (!isOwner && !viewTracked && post.id && user?.uid) {
      try { const r = await api.post(`/posts/${post.id}/view`); if (r.data.newView) setViewTracked(true); } catch {}
    }
  };

  const handleUserClick = () => {
    if (isAdminPost) {
      navigate(`/admin/profile/${post.authorId}`);
      return;
    }
    if (post.authorId && post.authorId !== user?.id) navigate(`/profile/${post.authorId}`);
    else if (post.authorId === user?.id) navigate(`/${user.role}/profile`);
  };

  const handleLike = async () => {
    try {
      const next = !liked;
      setLiked(next);
      setLikeCount(p => next ? p + 1 : p - 1);
      await api.post(`/posts/${post.id}/like`);
    } catch {
      setLiked(l => !l);
      toast.error('Failed to like post');
    }
  };

  const handleReaction = async (emoji) => {
    try {
      const same = myReaction === emoji;
      const newReaction = same ? null : emoji;
      const prevReaction = myReaction;

      // Optimistic update — update bubble immediately, don't wait for Firebase
      setMyReaction(newReaction);
      setReactionCounts(prev => {
        const next = { ...prev };
        if (prevReaction && next[prevReaction]) {
          next[prevReaction] = next[prevReaction].filter(id => id !== (user?.uid || user?.id));
          if (next[prevReaction].length === 0) delete next[prevReaction];
        }
        if (newReaction) {
          next[newReaction] = [...(next[newReaction] || []), (user?.uid || user?.id)];
        }
        return next;
      });

      setShowReactions(false);

      if (newReaction) {
        // Apply or switch reaction
        await api.post(`/posts/${post.id}/react`, { emoji: newReaction });
      } else if (prevReaction) {
        // Remove reaction — send the previous emoji so backend knows what to remove
        await api.post(`/posts/${post.id}/react`, { emoji: prevReaction, remove: true });
      }
    } catch (error) {
      console.error('Failed to react:', error);
      toast.error('Failed to react to post');
    }
  };

  const handleFollow = async () => {
    if (loadingFollow) return;
    try {
      setLoadingFollow(true);
      const r = await api.post(`/follows/${post.authorId}`);
      setFollowing(r.data.following);
      toast.success(r.data.following ? 'Following!' : 'Unfollowed');
    } catch { toast.error('Failed to follow user'); }
    finally { setLoadingFollow(false); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: `Post by ${postAuthor?.fullName}`, text: post.content, url }); }
      catch (e) { if (e.name !== 'AbortError') { navigator.clipboard.writeText(url); toast.success('Link copied!'); } }
    } else { navigator.clipboard.writeText(url); toast.success('Link copied!'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const r = await api.post(`/posts/${post.id}/comments`, { content: newComment.trim() });
      setComments(prev => [...prev, r.data.comment]);
      setNewComment('');
      setShowEmojiPicker(false);
      await fetchComments();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post comment'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      if (isAdminPost) {
        await api.delete(`/admin/posts/${post.id}`);
      } else {
        await api.delete(`/posts/${post.id}`);
      }
      toast.success('Post deleted');
      onDelete?.(post.id);
    } catch { toast.error('Failed to delete post'); }
  };

  const getTypeBadge = () => {
    const role = postAuthor?.role || post.authorRole;
    const map = { freelancer: 'bg-green-100 text-green-800', client: 'bg-yellow-100 text-yellow-800' };
    const color = map[role] || map.freelancer;
    const label = role === 'client' ? 'Client' : 'Freelancer';
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  const fmt = (ts) => {
    if (!ts) return '';
    let date;
    if (ts && typeof ts === 'object' && (ts._seconds !== undefined || ts.seconds !== undefined)) {
      date = new Date((ts._seconds ?? ts.seconds) * 1000);
    } else {
      date = new Date(ts);
    }
    if (isNaN(date.getTime())) return '';
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    const days = Math.floor(s / 86400);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  const topComments = comments.filter(c => !c.parentId);
  const getReplies = (id) => comments.filter(c => c.parentId === id);

  // Get top 3 most used reactions with their counts
  const getTopReactions = () => {
    return Object.entries(reactionCounts)
      .map(([emoji, users]) => ({ emoji, count: Array.isArray(users) ? users.length : (users || 0) }))
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const totalReactions = Object.values(reactionCounts).reduce((sum, users) => {
    return sum + (Array.isArray(users) ? users.length : (users || 0));
  }, 0) + likeCount;

  // Stacked emoji bubbles like Facebook/LinkedIn
  const ReactionBubbles = () => {
    const top = getTopReactions();
    if (top.length === 0 && totalReactions === 0) return null;
    return (
      <span className="flex items-center gap-1.5">
        <span className="flex items-center">
          {top.map((r, i) => (
            <span
              key={r.emoji}
              title={`${r.count} ${r.emoji}`}
              className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full bg-white shadow-sm border border-gray-100"
              style={{ marginLeft: i > 0 ? '-5px' : 0, zIndex: top.length - i }}
            >
              <TwEmoji emoji={r.emoji} size={14} />
            </span>
          ))}
        </span>
        {totalReactions > 0 && (
          <span className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{totalReactions}</span>
        )}
      </span>
    );
  };

  return (
    <>
    {/* Detail Modal */}
    {showDetailModal && (
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center md:p-4 p-0 overflow-y-auto transition duration-300">
        <div className={`${dark ? 'bg-gray-800' : 'bg-white'} max-w-2xl w-full my-8 h-[100vh] overflow-hidden flex flex-col`} onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-2 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={() => setShowDetailModal(false)} className={`p-2 rounded-full transition duration-300 ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className={`w-5 h-5 ${dark ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className={`p-2 rounded-lg transition ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <MoreVertical className={`w-5 h-5 ${dark ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              {showMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl border py-2 z-10 ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  {isOwner && <button onClick={handleDelete} className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition">Delete Post</button>}
                  <button className={`w-full px-4 py-2 text-left transition ${dark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-50'}`}>Report</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Post Content */}
            <div className={`p-6 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Author Header */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={authorAvatar}
                  alt={postAuthor?.fullName}
                  onClick={handleUserClick}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 cursor-pointer hover:ring-4 hover:ring-gray-200 transition"
                />
                <div className="flex-1">
                  <h3 onClick={handleUserClick} className={`font-semibold cursor-pointer hover:text-green-600 transition ${dark ? 'text-white' : 'text-gray-900'}`}>
                    {postAuthor?.fullName || 'Unknown User'}
                  </h3>
                  <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{isAdminPost ? 'AfroTask Admin' : (postAuthor?.skillCategory || postAuthor?.role)} • {fmt(post.createdAt)}</p>
                </div>
              </div>

              {/* Content */}
              {post.content && <p className={`mb-4 whitespace-pre-wrap leading-relaxed text-base ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{post.content}</p>}

              {/* Media */}
              {hasVideo && post.mediaUrl && (
                <div className="relative group cursor-pointer mb-4 rounded-xl overflow-hidden" onClick={(e) => { e.stopPropagation(); setVideoModal(true); }}>
                  <video src={post.mediaUrl} className="w-full max-h-[400px] object-cover" muted playsInline />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-10 h-10 text-gray-900 ml-1" />
                    </div>
                  </div>
                </div>
              )}

              {hasImage && post.image && (
                <img src={post.image} alt="Post" className="w-full max-h-[400px] object-cover rounded-xl mb-4 cursor-pointer hover:opacity-90 transition" onClick={(e) => { e.stopPropagation(); setImageModal(true); }} />
              )}

              {/* Hashtags */}
              {post.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.hashtags.map((tag, i) => (
                    <span key={i} className="text-green-600 hover:text-green-700 cursor-pointer text-sm font-medium">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className={`mt-4 pt-4 border-t flex items-center justify-between text-sm ${dark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                <ReactionBubbles />
                <span>{post.commentsCount || comments.length} comments</span>              </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 p-4 space-y-4">
              {topComments.length === 0 ? (
                <p className={`text-center py-4 text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>No comments yet. Be the first!</p>
              ) : topComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <img
                    src={getAvatar(comment.user)}
                    alt={comment.user?.fullName}
                    className="w-8 h-8 rounded-full object-cover cursor-pointer flex-shrink-0"
                    onClick={() => comment.userId && navigate(`/profile/${comment.userId}`)}
                  />
                  <div className="flex-1">
                    <div className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-2xl px-4 py-2.5 inline-block max-w-full`}>
                      <div className="flex flex-row justify-between gap-4">
                      <p className={`font-semibold text-sm cursor-pointer hover:underline ${dark ? 'text-gray-200' : 'text-gray-900'}`}
                        onClick={() => comment.userId && navigate(`/profile/${comment.userId}`)}>
                        {comment.user?.fullName || 'Anonymous'}
                      </p>
                      <div className="relative">
                        <button onClick={() => setActiveCommentMenu(activeCommentMenu === comment.id ? null : comment.id)} className={`p-2 rounded-lg transition ${dark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                          <MdMoreVert className={`text-xl ${dark ? 'text-gray-400' : 'text-gray-500'}`} />
                        </button>
                        {activeCommentMenu === comment.id && (
                          <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl border py-2 z-10 ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                            {isOwner && <button onClick={handleDelete} className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition">Delete Post</button>}
                            <button className={`w-full px-4 py-2 text-left transition ${dark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-50'}`}>Report</button>
                          </div>
                        )}
                      </div>
                      </div>
                      <p className={`text-sm mt-0.5 break-words ${dark ? 'text-gray-300' : 'text-gray-800'}`}>{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 ml-1">
                      <span className="text-xs text-gray-400">{fmt(comment.createdAt)}</span>
                      <button className="text-xs font-medium text-gray-400 hover:text-red-400">❤️ {comment.likes?.length || 0}</button>
                      <button className="text-xs font-semibold text-gray-400 hover:text-green-600">Reply</button>
                    </div>
                    {/* Nested replies */}
                    {getReplies(comment.id).length > 0 && (
                      <div className={`mt-2 space-y-2 pl-2 border-l-2 ${dark ? 'border-gray-600' : 'border-gray-200'}`}>
                        {getReplies(comment.id).map(reply => (
                          <div key={reply.id} className="flex gap-2">
                            <img
                              src={getAvatar(reply.user)}
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0 cursor-pointer"
                              onClick={() => reply.userId && navigate(`/profile/${reply.userId}`)}
                              alt=""
                            />
                            <div className="flex-1">
                              <div className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-2xl px-3 py-2 inline-block max-w-full`}>
                                <p className={`font-semibold text-xs cursor-pointer hover:underline ${dark ? 'text-gray-200' : 'text-gray-900'}`}
                                  onClick={() => reply.userId && navigate(`/profile/${reply.userId}`)}>
                                  {reply.user?.fullName || 'Anonymous'}
                                </p>
                                <p className={`text-xs mt-0.5 break-words ${dark ? 'text-gray-300' : 'text-gray-800'}`}>{reply.content}</p>
                              </div>
                              <span className="text-xs text-gray-400 ml-1 block mt-0.5">{fmt(reply.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment Input - Fixed at bottom with z-20 */}
          <form onSubmit={handleComment} className={`border-t p-4 relative z-20 ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="flex gap-3">
              <img
                src={getAvatar(user)}
                alt={user?.fullName}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className={`w-full px-4 py-2 pr-20 border rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-1.5 rounded-full transition ${dark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                    <Smile className={`w-4 h-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                  <button type="submit" disabled={!newComment.trim()}
                    className="p-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 rounded-full transition">
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 z-50">
                    <EmojiPicker
                      onEmojiClick={d => { setNewComment(p => p + d.emoji); setShowEmojiPicker(false); }}
                      theme={dark ? 'dark' : 'light'}
                      width={300} height={380}
                    />
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Main Card */}
    {/* Use layout="position" to prevent re-animation on state updates */}
    
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${dark ? 'bg-gray-800' : 'bg-white'} lg:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-visible contain-content min-sm:w-[100%] lg:w-[100%] w-screen cursor-pointer`}
    >
      {/* Header */}
      <div className="p-3 md:p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 w-full" onClick={() => setShowDetailModal(true)}>
            <div className="contain-content lg:w-12 w-10 lg:h-12 h-10">
            <img
              src={authorAvatar}
              alt={postAuthor?.fullName}
              onClick={handleUserClick}
              className="w-full h-full rounded-full object-cover cursor-pointer transition"
            />
            </div>
              <div className="flex flex-col items-start gap-1">
                <h3 onClick={handleUserClick} className={`flex flex-row flex-nowrap w-full font-semibold cursor-pointer hover:text-green-600 transition md:text-lg text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {postAuthor?.fullName || 'Unknown User'}
                </h3>
              <p className={`flex flex-row flex-nowrap md:text-sm text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{isAdminPost ? 'AfroTask Admin' : (postAuthor?.skillCategory || postAuthor?.role)} • {fmt(post.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOwner && !isAdminPost && (
              <button onClick={handleFollow} disabled={loadingFollow}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${following ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                {loadingFollow ? '...' : following ? 'Following' : 'Follow'}
              </button>
            )}
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className={`p-2 rounded-lg transition ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <MoreVertical className={`w-5 h-5 ${dark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              {showMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl border py-2 z-10 ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  {isOwner && <button onClick={handleDelete} className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition">Delete Post</button>}
                  <button className={`w-full px-4 py-2 text-left transition ${dark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-50'}`}>Report</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {post.content && <p className={`mb-3 whitespace-pre-wrap leading-relaxed ${dark ? 'text-gray-200' : 'text-gray-800'}`} onClick={() => setShowDetailModal(true)}>{post.content}</p>}

        {/* Video */}
        {hasVideo && post.mediaUrl && (
          <div className={`relative group ${post.content ? 'mb-3' : 'mb-0'} cursor-pointer`} onClick={(e) => { e.stopPropagation(); setVideoModal(true); }}>
            <video src={post.mediaUrl} className="w-full max-h-[500px] object-cover rounded-xl" muted playsInline />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all rounded-xl">
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
                <Play className="w-10 h-10 text-gray-900 ml-1" />
              </div>
            </div>
          </div>
        )}

        {/* Image — memoized to prevent re-mount on state changes */}
        {hasImage && post.image && (
          <div className={post.content ? 'mb-3 overflow-hidden rounded-xl' : 'mb-0 overflow-hidden rounded-xl'}>
            <PostImage src={post.image} onClick={(e) => { e.stopPropagation(); setImageModal(true); }} />
          </div>
        )}

        {post.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.hashtags.map((tag, i) => (
              <span key={i} className="text-green-600 hover:text-green-700 cursor-pointer text-sm font-medium">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className={`px-6 py-3 border-t flex items-center justify-between text-sm ${dark ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-600'}`}>
        <ReactionBubbles />
        <span>{post.commentsCount || 0} comments</span>
      </div>

      {/* Actions */}
      <div className={`lg:px-6 px-3 py-3 border-t flex items-center justify-around ${dark ? 'border-gray-700' : 'border-gray-100'}`} onClick={e => e.stopPropagation()}>
        <div className="contain-content lg:w-5 w-4 h-4 lg:h-5">
            <img
              src={getAvatar(user)}
              alt={user?.fullName}
              className="w-full h-full rounded-full object-cover transition"
            />
            </div>

        {/* Reaction picker */}
        <div className="relative" ref={reactionRef}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); myReaction ? handleReaction(myReaction) : handleReaction('👍'); }}
            onMouseEnter={() => setShowReactions(true)}
            className={`flex items-center gap-1.5 md:px-4 p-2 rounded-lg transition ${myReaction ? REACTIONS.find(r => r.emoji === myReaction)?.color || 'text-blue-500' : dark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            {myReaction
              ? <TwEmoji emoji={myReaction} size={20} />
              : <TwEmoji emoji="👍" size={20} className="opacity-60" />
            }
            <span className="font-medium text-xs md:text-sm">
              {myReaction ? REACTIONS.find(r => r.emoji === myReaction)?.label : 'Like'}
            </span>
          </motion.button>

          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onMouseLeave={() => setShowReactions(false)}
                className={`absolute bottom-full left-0 mb-2 rounded-2xl shadow-2xl border md:px-3 p-2 flex gap-1 z-20 whitespace-nowrap ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'}`}
              >
                {REACTIONS.map((r) => (
                  <button
                    key={r.emoji}
                    onClick={(e) => { e.stopPropagation(); handleReaction(r.emoji); }}
                    title={r.label}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-transform hover:scale-125 hover:bg-gray-50 ${myReaction === r.emoji ? 'scale-125 bg-blue-50' : ''}`}
                  >
                    <TwEmoji emoji={r.emoji} size={28} />
                    <span className="text-[10px] text-gray-500 font-medium">{r.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
          className={`flex items-center gap-2 md:px-4 p-2 rounded-lg transition ${dark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <MessageCircle className="lg:w-5 w-4 h-4 lg:h-5" />
          {/* <span className="font-medium text-xs md:text-sm">Comment</span> */}
        </motion.button>

        <motion.button whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); handleShare(); }}
          className={`flex items-center gap-2 md:px-4 p-2 rounded-lg transition ${dark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <TbShare3 className="lg:w-5 w-4 h-4 lg:h-5" />
          {/* <span className="font-medium text-xs md:text-sm">Share</span> */}
        </motion.button>

        <motion.button whileTap={{ scale: 0.95 }} onClick={(e) => {
            e.stopPropagation();
            if (!user?.id) return;
            const isNowBookmarked = toggleBookmark(user.id, post);
            setBookmarked(isNowBookmarked);
            toast.success(isNowBookmarked ? 'Post saved' : 'Bookmark removed', { duration: 1500 });
          }}
          className={`p-2 rounded-lg transition ${bookmarked ? 'text-green-600' : dark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
        </motion.button>
      </div>

      {/* Comments Modal */}
      {showComments && createPortal(
        <div className="fixed inset-0 bg-black/50 z-40 flex lg:items-center items-end justify-center md:p-4 p-0 overflow-y-auto" onClick={() => setShowComments(false)}>
          <div className={`${dark ? 'bg-gray-800' : 'bg-white'} max-w-2xl w-full lg:my-8 h-[90vh] overflow-hidden flex flex-col lg:rounded-2xl`} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Comments</h2>
              <button onClick={() => setShowComments(false)} className={`p-2 rounded-full transition ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <X className={`w-5 h-5 ${dark ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {topComments.length === 0 ? (
                <p className={`text-center py-8 text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>No comments yet. Be the first!</p>
              ) : topComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <img
                    src={getAvatar(comment.user)}
                    alt={comment.user?.fullName}
                    className="w-8 h-8 rounded-full object-cover cursor-pointer flex-shrink-0 mt-0.5"
                    onClick={() => comment.userId && navigate(`/profile/${comment.userId}`)}
                  />
                  <div className="flex-1 min-w-0">
                    {/* Comment bubble */}
                    <div className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-2xl px-4 py-2.5 inline-block max-w-full`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-semibold text-sm cursor-pointer hover:underline leading-tight ${dark ? 'text-gray-200' : 'text-gray-900'}`}
                          onClick={() => comment.userId && navigate(`/profile/${comment.userId}`)}>
                          {comment.user?.fullName || 'Anonymous'}
                        </p>
                        <div className="relative">
                          <button onClick={() => setActiveCommentMenu(activeCommentMenu === comment.id ? null : comment.id)} className={`p-2 rounded-xl transition shadow-sm ${dark ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-white/80'}`}>
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {activeCommentMenu === comment.id && (
                            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl border py-2 z-10 ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                              {isOwner && <button onClick={() => { handleDelete(); setActiveCommentMenu(null); }} className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition">Delete Comment</button>}
                              <button onClick={() => setActiveCommentMenu(null)} className={`w-full px-4 py-2 text-left transition ${dark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-50'}`}>Report</button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm mt-0.5 break-words ${dark ? 'text-gray-300' : 'text-gray-800'}`}>{comment.content}</p>
                    </div>

                    {/* Comment actions */}
                    <div className="flex items-center gap-3 mt-1 ml-1">
                      <span className="text-xs text-gray-400">{fmt(comment.createdAt)}</span>
                      <button
                        onClick={async () => {
                          try { await api.post(`/posts/${post.id}/comments/${comment.id}/like`); await fetchComments(); }
                          catch { toast.error('Failed to like'); }
                        }}
                        className={`text-xs font-medium transition ${comment.likes?.includes(user?.uid) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                      >
                        {comment.likes?.includes(user?.uid) ? '❤️' : '🤍'} {comment.likes?.length || 0}
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-xs font-semibold text-gray-400 hover:text-green-600 transition"
                      >
                        Reply
                      </button>
                    </div>

                    {/* Reply input */}
                    {replyingTo === comment.id && (
                      <ReplyInput
                        comment={comment}
                        postId={post.id}
                        onReplied={async () => { await fetchComments(); setReplyingTo(null); }}
                        onCancel={() => setReplyingTo(null)}
                      />
                    )}

                    {/* Nested replies */}
                    {getReplies(comment.id).length > 0 && (
                      <div className={`mt-2 space-y-3 pl-5 ml-2 border-l-2 ${dark ? 'border-gray-600' : 'border-gray-200'}`}>
                        {getReplies(comment.id).map(reply => (
                          <div key={reply.id} className="flex gap-2">
                            <img
                              src={reply.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user?.fullName || 'User')}`}
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0 cursor-pointer mt-0.5"
                              onClick={() => reply.userId && navigate(`/profile/${reply.userId}`)}
                              alt=""
                            />
                            <div className="flex-1 min-w-0">
                              <div className={`${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-2xl px-3 py-2 shadow-sm inline-block max-w-full`}>
                                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-1">Reply</p>
                                <p className={`font-semibold text-xs cursor-pointer hover:underline leading-tight ${dark ? 'text-gray-200' : 'text-gray-900'}`}
                                  onClick={() => reply.userId && navigate(`/profile/${reply.userId}`)}>
                                  {reply.user?.fullName || 'Anonymous'}
                                </p>
                                <p className={`text-xs mt-0.5 break-words ${dark ? 'text-gray-300' : 'text-gray-800'}`}>{reply.content}</p>
                              </div>
                              <span className="text-xs text-gray-400 ml-1 block mt-0.5">{fmt(reply.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Main comment input */}
            <form onSubmit={handleComment} className={`p-4 border-t ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className="flex gap-3 relative z-20">
                <img
                  src={getAvatar(user)}
                  alt={user?.fullName}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className={`w-full px-4 py-2 pr-20 border rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-1.5 rounded-full transition ${dark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                      <Smile className={`w-4 h-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    <button type="submit" disabled={!newComment.trim()}
                      className="p-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 rounded-full transition">
                      <Send className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2 z-50">
                      <EmojiPicker
                        onEmojiClick={d => { setNewComment(p => p + d.emoji); setShowEmojiPicker(false); }}
                        theme={dark ? 'dark' : 'light'}
                        width={300} height={380}
                      />
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Video Modal */}
      {videoModal && createPortal(
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center w-screen h-screen" onClick={() => setVideoModal(false)}>
          {/* Cancel button */}
          <button
            onClick={() => setVideoModal(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Video container */}
          <div className="relative flex items-center justify-center w-full h-full p-4" onClick={e => e.stopPropagation()}>
            <video
              src={post.mediaUrl}
              controls
              autoPlay
              className="max-h-screen max-w-screen w-auto h-auto  object-contain"
            />
          </div>
        </div>,
        document.body
      )}

      {/* Image Modal — Full screen with cancel button */}
      {imageModal && createPortal(
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center w-screen h-screen" onClick={() => setImageModal(false)}>
          {/* Cancel button */}
          <button
            onClick={() => setImageModal(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image container */}
          <div className="relative flex items-center justify-center w-full h-full p-4" onClick={e => e.stopPropagation()}>
            <img
              src={post.image}
              alt="Post"
              className="max-h-screen max-w-screen h-auto w-auto object-contain"
              style={{ animation: 'imgFadeIn 0.2s ease forwards' }}
            />
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes imgFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </motion.div>
    </>
  );
  
};

export default EnhancedPostCard;
