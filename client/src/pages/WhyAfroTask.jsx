import { IoSearch, IoClose } from 'react-icons/io5'
import { useState, useMemo, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import WhiteNavbar from '../components/navbar/WhiteNavbar'
import WhyAfroTaskBoard from '../components/WhyAfroTaskBoard'
import BlogCard from '../components/BlogCard'
import staticBlogs from '../data/blogs.json'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { X, Trash2, Pencil } from 'lucide-react'

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

export default function WhyAfroTask() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [firestoreBlogs, setFirestoreBlogs] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showReadModal, setShowReadModal] = useState(null)
  const [editBlog, setEditBlog] = useState(null) // blog being edited
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null) // { message, type }
  const [visibleCount, setVisibleCount] = useState(3)

  const suggestions = ["Freelancing in Nigeria", "Afro task freelancer", "Nigerian freelancer"]

  const showToast = (message, type = 'success') => setToast({ message, type })

  const fetchBlogs = async () => {
    try {
      const res = await api.get('/profile/blogs')
      setFirestoreBlogs(res.data.blogs || [])
    } catch {
      setFirestoreBlogs([])
    }
  }

  useEffect(() => { fetchBlogs() }, [])

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
    const stat = staticBlogs.map(b => ({ ...b, isFirestore: false }))
    return [...dynamic, ...stat]
  }, [firestoreBlogs])

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) return suggestions
    return suggestions.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [searchTerm])

  const filteredBlogs = useMemo(() => {
    return allBlogs.filter(blog =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (blog.author || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [allBlogs, searchTerm])

  useEffect(() => { setVisibleCount(3) }, [searchTerm])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const openCreate = () => {
    setEditBlog(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview(null)
    setShowCreateModal(true)
  }

  const openEdit = (blog) => {
    setEditBlog(blog)
    setForm({ title: blog.title, description: blog.description, content: blog.raw?.content || '' })
    setImageFile(null)
    setImagePreview(blog.link || null)
    setShowCreateModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/welcome'); return }
    if (!form.title.trim() || !form.description.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      const data = new FormData()
      data.append('title', form.title.trim())
      data.append('description', form.description.trim())
      data.append('content', form.content.trim())
      data.append('authorName', user.fullName || user.name || 'Anonymous')
      if (imageFile) data.append('image', imageFile)

      if (editBlog) {
        await api.put(`/profile/blogs/${editBlog.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
        showToast('Blog updated successfully!')
      } else {
        await api.post('/profile/blogs', data, { headers: { 'Content-Type': 'multipart/form-data' } })
        showToast('Blog published successfully!')
      }

      await fetchBlogs()
      setForm(emptyForm)
      setImageFile(null)
      setImagePreview(null)
      setShowCreateModal(false)
      setEditBlog(null)
    } catch (err) {
      console.error('Blog save error:', err.response?.data || err.message)
      showToast(err.response?.data?.message || 'Failed to save blog', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"?`)) return
    try {
      await api.delete(`/profile/blogs/${blog.id}`)
      showToast('Blog deleted.')
      await fetchBlogs()
      if (showReadModal?.id === blog.id) setShowReadModal(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete blog', 'error')
    }
  }

  return (
    <div className='min-h-screen bg-[#00564C] relative text-black'>
      <WhiteNavbar />
      <WhyAfroTaskBoard />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Search + Create button row */}
      <div className='flex flex-col gap-4 justify-center items-center text-white my-8 px-4 sm:px-8'>
        <div className="w-full max-w-2xl flex gap-3 items-center">
          <div className="relative flex-1">
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 pointer-events-none" />
            <input
              type='text'
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full bg-white pl-12 pr-12 text-gray-900 rounded-2xl text-xl py-4 border-2 border-gray-300 focus:border-green-500 focus:outline-none shadow-lg'
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <IoClose className="text-xl" />
              </button>
            )}
          </div>
          <button
            onClick={openCreate}
            className="bg-white text-[#00564C] font-semibold px-5 py-4 rounded-2xl hover:bg-green-50 transition whitespace-nowrap shadow-lg"
          >
            + Create Blog
          </button>
        </div>

        {filteredSuggestions.length > 0 && (
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl">
            {filteredSuggestions.map((sug, index) => (
              <button
                key={index}
                onClick={() => setSearchTerm(sug)}
                className='flex items-center py-4 px-6 text-lg text-gray-900 hover:bg-gray-50 focus:outline-none transition-colors border-l-4 border-transparent hover:border-green-500 w-full text-left'
              >
                <IoSearch className="text-lg text-gray-400 mr-3 flex-shrink-0" />
                {sug}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Blog list */}
      <div className="px-4 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="max-w-6xl mx-auto lg:space-y-16 space-y-6">
          {filteredBlogs.slice(0, visibleCount).map((blog) => (
            <div key={blog.id} className="relative group">
              <BlogCard
                title={blog.title}
                description={blog.description}
                author={blog.author}
                date={blog.date}
                link={blog.link}
                onReadMore={blog.isFirestore ? () => setShowReadModal(blog) : undefined}
              />
              {/* Edit / Delete — only for the blog's author */}
              {blog.isFirestore && user && blog.authorId === user.id && (
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(blog)}
                    className="bg-white/90 hover:bg-white text-[#00564C] p-2 rounded-lg shadow-md transition"
                    title="Edit blog"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(blog)}
                    className="bg-white/90 hover:bg-white text-red-600 p-2 rounded-lg shadow-md transition"
                    title="Delete blog"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {visibleCount < filteredBlogs.length && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setVisibleCount(c => c + 5)}
              className="bg-white text-[#00564C] font-semibold px-8 py-4 rounded-2xl hover:bg-green-50 transition shadow-lg text-lg"
            >
              View More
            </button>
          </div>
        )}
      </div>

      <Footer />

      {/* ── Create / Edit Blog Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">{editBlog ? 'Edit Blog Post' : 'Create Blog Post'}</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input type="text" value={user?.fullName || user?.name || ''} disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-6 py-3 bg-[#00564C] hover:bg-[#027568] disabled:opacity-60 text-white rounded-lg font-medium transition">
                  {saving ? (editBlog ? 'Saving...' : 'Publishing...') : (editBlog ? 'Save Changes' : 'Publish Blog')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Read More Modal ── */}
      {showReadModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 pr-4">{showReadModal.title}</h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {user && showReadModal.authorId === user.id && (
                  <>
                    <button onClick={() => { setShowReadModal(null); openEdit(showReadModal) }}
                      className="p-2 hover:bg-gray-100 rounded-full transition text-[#00564C]" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(showReadModal)}
                      className="p-2 hover:bg-gray-100 rounded-full transition text-red-600" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button onClick={() => setShowReadModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {showReadModal.link && (
                <img src={showReadModal.link} alt={showReadModal.title} className="w-full h-64 object-cover rounded-xl" />
              )}
              <p className="text-sm text-gray-500">{showReadModal.author} · {showReadModal.date}</p>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{showReadModal.raw?.content || showReadModal.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
