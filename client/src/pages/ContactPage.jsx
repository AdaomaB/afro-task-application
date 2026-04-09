import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle } from 'lucide-react';
import WhiteNavbar from '../components/navbar/WhiteNavbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Error saving contact message:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WhiteNavbar />

      {/* Hero */}
      <div className="bg-[#00564C] text-white py-14 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Contact Us</h1>
        <p className="text-green-200 text-lg">We'd love to hear from you</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          <p className="text-gray-600 mb-8">
            Have a question, feedback, or need support? Reach out to us and our team will get back to you as soon as possible.
          </p>

          <div className="space-y-5">
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
              <div className="bg-[#00564C]/10 p-3 rounded-lg">
                <Mail className="w-5 h-5 text-[#00564C]" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Business Email</p>
                <a href="mailto:business@afrotask.com" className="text-[#00564C] hover:underline text-sm">
                  business@afrotask.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
              <div className="bg-[#00564C]/10 p-3 rounded-lg">
                <Mail className="w-5 h-5 text-[#00564C]" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Support Email</p>
                <a href="mailto:support@afrotask.com" className="text-[#00564C] hover:underline text-sm">
                  support@afrotask.com
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <CheckCircle className="w-16 h-16 text-[#00564C] mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-600 mb-6">Thank you for reaching out. We'll get back to you shortly.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="bg-[#00564C] text-white px-6 py-2 rounded-lg hover:bg-[#027568] transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-5">
              <h2 className="text-xl font-bold text-gray-900">Send a Message</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00564C] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00564C] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00564C] text-sm resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00564C] text-white py-3 rounded-lg font-semibold hover:bg-[#027568] transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
