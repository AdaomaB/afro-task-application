import { useState, useEffect, useMemo, useContext } from 'react'
import LoadingScreen from '../components/LoadingScreen'
import { useParams, useNavigate } from 'react-router-dom'
import BlogCard from '../components/BlogCard'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { X, ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import WhiteNavbar from '../components/navbar/WhiteNavbar'
import Footer from '../components/Footer'
import { IoIosPerson, IoMdTime } from 'react-icons/io'

const emptyForm = { title: '', description: '', content: '' }

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium transition-all
      ${type === 'success' ? 'bg-[#00564C]' : 'bg-red-600'}`}>
      {type === 'success' ? '✅' : '❌'} {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  )
}

export default function BlogPage() {
  const { user } = useContext(AuthContext)
  const { blogId } = useParams()
  const navigate = useNavigate()
  const [firestoreBlogs, setFirestoreBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentBlog, setCurrentBlog] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [visibleCommentCount, setVisibleCommentCount] = useState(5)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [expandedComments, setExpandedComments] = useState(new Set())

  useEffect(() => {
    if (!loading && currentBlog === null && blogId) {
      // Blog not found, will show "Blog Not Found" page
    }
  }, [loading, currentBlog, blogId])

  const showToast = (message, type = 'success') => setToast({ message, type })

  const fetchBlogs = async () => {
    try {
      const res = await api.get('/profile/blogs')
      setFirestoreBlogs(res.data.blogs || [])
    } catch {
      setFirestoreBlogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const formatDate = (iso) => {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch { return '' }
  }

  const allBlogs = useMemo(() => {
    const dynamic = firestoreBlogs.map(b => ({
      id: b.id,
      title: b.title,
      description: b.description,
      content: b.content,
      author: b.authorName,
      date: formatDate(b.createdAt),
      link: b.image || '',
      isFirestore: true,
      authorId: b.authorId,
      raw: b,
    }))
    return [...dynamic]
  }, [firestoreBlogs])

  useEffect(() => {
    if (allBlogs.length > 0) {
      const found = allBlogs.find(b => String(b.id) === String(blogId))
      setCurrentBlog(found || null)
      if (found) {
        fetchComments()
      }
    }
  }, [allBlogs, blogId])

  const suggestions = useMemo(() => {
    if (!currentBlog) return []
    const others = allBlogs.filter(b => b.id !== currentBlog.id)
    const shuffled = others.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  }, [allBlogs, currentBlog])

  const handleDelete = async () => {
    if (!currentBlog || !currentBlog.isFirestore) return
    if (!window.confirm(`Delete "${currentBlog.title}"?`)) return
    setDeleting(true)
    try {
      await api.delete(`/profile/blogs/${currentBlog.id}`)
      navigate('/blogs')
    } catch (err) {
      console.error(err)
      alert('Failed to delete blog')
    } finally {
      setDeleting(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const openEdit = () => {
    setForm({ title: currentBlog.title, description: currentBlog.description, content: currentBlog.content })
    setImageFile(null)
    setImagePreview(currentBlog.link || null)
    setShowEditModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      const data = new FormData()
      data.append('title', form.title.trim())
      data.append('description', form.description.trim())
      data.append('content', form.content.trim())
      data.append('authorName', user.fullName || user.name || 'Anonymous')
      if (imageFile) {
        console.log('Image file being uploaded:', { name: imageFile.name, size: imageFile.size, type: imageFile.type })
        data.append('image', imageFile)
      }

      await api.put(`/profile/blogs/${currentBlog.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      showToast('Blog updated successfully!')

      await fetchBlogs()
      setForm(emptyForm)
      setImageFile(null)
      setImagePreview(null)
      setShowEditModal(false)
    } catch (err) {
      console.error('Blog save error:', err.response?.data || err.message)
      showToast(err.response?.data?.message || 'Failed to save blog', 'error')
    } finally {
      setSaving(false)
    }
  }

  const fetchComments = async () => {
    if (!blogId) return
    setLoadingComments(true)
    try {
      const res = await api.get(`/profile/blogs/${blogId}/comments`)
      setComments(res.data.comments || [])
    } catch (err) {
      console.error('Failed to fetch comments:', err)
      setComments([])
    } finally {
      setLoadingComments(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/welcome')
      return
    }
    if (!commentText.trim()) return
    
    try {
      await api.post(`/profile/blogs/${blogId}/comments`, {
        text: commentText.trim(),
        authorName: user.fullName || user.name || 'Anonymous'
      })
      showToast('Comment added successfully!')
      setCommentText('')
      await fetchComments()
    } catch (err) {
      console.error('Failed to add comment:', err)
      showToast(err.response?.data?.message || 'Failed to add comment', 'error')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await api.delete(`/profile/blogs/${blogId}/comments/${commentId}`)
      showToast('Comment deleted')
      await fetchComments()
    } catch (err) {
      console.error('Failed to delete comment:', err)
      showToast(err.response?.data?.message || 'Failed to delete comment', 'error')
    }
  }

  const handleSubmitReply = async (e, commentId) => {
    e.preventDefault()
    if (!user) {
      navigate('/welcome')
      return
    }
    if (!replyText.trim()) return
    
    try {
      await api.post(`/profile/blogs/${blogId}/comments/${commentId}/replies`, {
        text: replyText.trim(),
        authorName: user.fullName || user.name || 'Anonymous'
      })
      showToast('Reply added successfully!')
      setReplyText('')
      setReplyingTo(null)
      await fetchComments()
    } catch (err) {
      console.error('Failed to add reply:', err)
      showToast(err.response?.data?.message || 'Failed to add reply', 'error')
    }
  }

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('Delete this reply?')) return
    try {
      await api.delete(`/profile/blogs/${blogId}/comments/${commentId}/replies/${replyId}`)
      showToast('Reply deleted')
      await fetchComments()
    } catch (err) {
      console.error('Failed to delete reply:', err)
      showToast(err.response?.data?.message || 'Failed to delete reply', 'error')
    }
  }

  const toggleExpandComment = (commentId) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedComments(newExpanded)
  }

  if (loading) {
    return <div className="min-h-screen bg-[#00564C] flex items-center justify-center p-8">
      <LoadingScreen />
    </div>;
  }

  if (!currentBlog) {
    return <div className="min-h-screen bg-[#00564C]">
      <WhiteNavbar />
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12">
        <div className="text-center max-w-md space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white">Blog Not Found</h1>
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed">The blog you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button onClick={() => navigate('/blogs')} className="bg-white hover:bg-gray-100 text-[#00564C] font-semibold px-8 py-4 rounded-2xl transition-all flex items-center gap-2 mx-auto shadow-lg">
            <ArrowLeft className="w-5 h-5" />
            Back to Blogs
          </button>
        </div>
      </div>
      <Footer />
    </div>;
  }

  return (
    <div className='min-h-screen bg-[#00564C] text-white relative'>  
      <WhiteNavbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <button
        onClick={() => navigate('/blogs')}
        className="fixed top-24 left-6 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-xl transition-all flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Blogs
      </button>
      
      <div className="pt-32 pb-20 px-4 sm:px-8 lg:px-0 max-w-6xl mx-auto">
        {/* Blog Header */}
        <div className="mb-12">
          <div className="flex-1  mb-2">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight">{currentBlog.title}</h1>
              <p className="text-sm md:text-lg text-gray-200 mb-6 flex items-center ">
                Published by <IoIosPerson className='ml-2'/> {currentBlog.author} on <IoMdTime className='ml-2' /> {currentBlog.date}
              </p>
            </div>
          {currentBlog.link && (
            <img
              src={currentBlog.link}
              alt={currentBlog.title}
              className="w-full max-h-96 object-cover rounded-2xl mb-6 shadow-2xl"
            />
          )}
          <div className="flex flex-col lg:flex-row lg:items-start">
            {currentBlog.isFirestore && user && currentBlog.authorId === user.id && (
              <div className="flex gap-2 mt-4 lg:mt-0">
                <button
                  onClick={openEdit}
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition flex items-center gap-2"
                  title="Edit"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-500/80 hover:bg-red-600 p-3 rounded-xl transition flex items-center"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Blog Content */}
        <div className="prose prose-invert max-w-none mb-12">
          <div className="flex-1 mb-2">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight">{currentBlog.title}</h1>
            </div>
          <div className="text-sm md:text-lg leading-relaxed text-gray-100 whitespace-pre-wrap">
            {currentBlog.content || currentBlog.raw?.content}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-16 border-t border-gray-500 pt-12 ">
          <h2 className="text-xl md:text-2xl font-bold mb-8">Comments ({comments.length})</h2>
          
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-10">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={user ? "Share your thoughts..." : "Log in to comment"}
              disabled={!user}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-gray-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 resize-none disabled:opacity-50"
            />
            <div className="flex items-center justify-between mt-4">
              {!user && (
                <p className="text-sm text-gray-300">
                  <button type="button" onClick={() => navigate('/welcome')} className="text-green-400 hover:underline">Log in</button> to comment
                </p>
              )}
              <button
                type="submit"
                disabled={!user || !commentText.trim() || loadingComments}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
              >
                Post Comment
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {loadingComments ? (
              <p className="text-gray-300">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-gray-400">No comments yet. Be the first to comment!</p>
            ) : (
              <>
                {comments.slice(0, visibleCommentCount).map((comment) => (
                  <div key={comment.id} className="bg-white/5 rounded-lg p-6 border border-gray-600">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-white">{comment.authorName || 'Anonymous'}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {user && (user.id === comment.authorId || user.id === currentBlog.authorId) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-gray-100 leading-relaxed mb-4">{comment.text}</p>

                    {/* Reply Button */}
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-green-400 hover:text-green-300 text-sm font-medium transition mb-4"
                    >
                      {replyingTo === comment.id ? 'Cancel Reply' : 'Reply'}
                    </button>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mb-4">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={user ? "Write a reply..." : "Log in to reply"}
                          disabled={!user}
                          rows={3}
                          className="w-full px-4 py-3 bg-white/10 border border-gray-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 resize-none disabled:opacity-50 mb-3"
                        />
                        <button
                          type="submit"
                          disabled={!user || !replyText.trim()}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50 text-sm"
                        >
                          Post Reply
                        </button>
                      </form>
                    )}

                    {/* Replies Section */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-4 border-l-2 border-gray-600 pl-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400">{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</p>
                          {comment.replies.length > 2 && !expandedComments.has(comment.id) && (
                            <button
                              onClick={() => toggleExpandComment(comment.id)}
                              className="text-green-400 hover:text-green-300 text-xs font-medium"
                            >
                              Show All
                            </button>
                          )}
                        </div>

                        {comment.replies.slice(0, expandedComments.has(comment.id) ? undefined : 2).map((reply) => (
                          <div key={reply.id} className="bg-white/10 rounded p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-white text-sm">{reply.authorName || 'Anonymous'}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(reply.createdAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              {user && (user.id === reply.authorId || user.id === currentBlog.authorId) && (
                                <button
                                  onClick={() => handleDeleteReply(comment.id, reply.id)}
                                  className="text-red-400 hover:text-red-300 text-xs font-medium transition"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <p className="text-gray-200 text-sm leading-relaxed">{reply.text}</p>
                          </div>
                        ))}

                        {comment.replies.length > 2 && expandedComments.has(comment.id) && (
                          <button
                            onClick={() => toggleExpandComment(comment.id)}
                            className="text-green-400 hover:text-green-300 text-xs font-medium"
                          >
                            Hide Replies
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Load More Comments */}
                {visibleCommentCount < comments.length && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setVisibleCommentCount(c => c + 5)}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition"
                    >
                      Read More Comments ({comments.length - visibleCommentCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Suggested Blogs */}
        {suggestions.length > 0 && (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-8">You might also like</h2>
            <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-6">
              {suggestions.map((blog) => (
                <BlogCard
                  key={blog.id}
                  title={blog.title}
                  description={blog.description}
                  author={blog.author}
                  date={blog.date}
                  link={blog.link}
                  onReadMore={() => navigate(`/blogs/${blog.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* ── Edit Blog Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 text-black">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Edit Blog Post</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blog Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter blog title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief preview text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Content *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Write your full blog content here..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blog Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-lg" />}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-[#00564C] hover:bg-[#003d36] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
