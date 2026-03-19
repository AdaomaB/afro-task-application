import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaHeadset, FaCheckCircle } from 'react-icons/fa';
import WhiteNavbar from '../components/navbar/WhiteNavbar';
import Footer from '../components/Footer';
import api from '../services/api';

// ── Recipient emails — easy to update ──
const RECIPIENT_EMAILS = [
  { label: 'Business Enquiries', value: 'adaoma2826@gmail.com' },
  { label: 'Support', value: 'mbatab@gmail.com' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '', recipientEmail: RECIPIENT_EMAILS[0].value });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        recipientEmail: form.recipientEmail,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WhiteNavbar />

      <div className="bg-[#00564C] text-white py-14 px-6 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Contact Us</h1>
        <p className="text-green-100 text-lg max-w-xl mx-auto">
          Have a question or need help? We'd love to hear from you.
        </p>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-gray-600 leading-relaxed">
              Whether you're a client looking for talent or a freelancer with questions,
              our team is here to help. Reach out and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-[#00564C]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <FaEnvelope className="text-[#00564C]" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Business Email</p>
                <a href="mailto:adaoma2826@gmail.com" className="text-[#00564C] hover:underline text-sm">
                  adaoma2826@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-[#00564C]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <FaHeadset className="text-[#00564C]" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Support Email</p>
                <a href="mailto:mbatab@gmail.com" className="text-[#00564C] hover:underline text-sm">
                  mbatab@gmail.com
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-md p-8"
        >
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <FaCheckCircle className="text-5xl text-[#00564C] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Message sent successfully!</h3>
              <p className="text-gray-600">We'll get back to you within 24 hours.</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '', recipientEmail: RECIPIENT_EMAILS[0].value }); }}
                className="mt-6 text-[#00564C] hover:underline text-sm font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Send a Message</h3>

              <input type="checkbox" name="botcheck" style={{ display: 'none' }} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00564C] focus:border-transparent outline-none transition"
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
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00564C] focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Send To</label>
                <select
                  name="recipientEmail"
                  value={form.recipientEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00564C] focus:border-transparent outline-none transition bg-white"
                >
                  {RECIPIENT_EMAILS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label} — {r.value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00564C] focus:border-transparent outline-none transition resize-none"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00564C] hover:bg-[#027568] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
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
