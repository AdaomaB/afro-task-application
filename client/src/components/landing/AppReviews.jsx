import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Star, X, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "../../config/firebase";
import { collection, addDoc, getDocs, orderBy, query, limit } from "firebase/firestore";

// ── Fallback reviews shown when Firestore is unavailable ──
const FALLBACK_REVIEWS = [
  {
    id: "1",
    name: "Amara Osei",
    role: "Freelancer",
    rating: 5,
    message: "AfroTask helped me land my first freelance job within a week. The platform is clean and easy to use.",
    avatar: "A",
    avatarColor: "from-[#00564C] to-[#027568]",
  },
  {
    id: "2",
    name: "Chidi Nwosu",
    role: "Client",
    rating: 5,
    message: "I found a reliable developer within minutes. The video profiles made it so easy to pick the right person.",
    avatar: "C",
    avatarColor: "from-[#FB9E01] to-[#CC8102]",
  },
  {
    id: "3",
    name: "Fatima Al-Hassan",
    role: "Freelancer",
    rating: 4,
    message: "The video feature makes hiring so much easier. Clients can actually see who they're working with.",
    avatar: "F",
    avatarColor: "from-[#00564C] to-[#027568]",
  },
  {
    id: "4",
    name: "Kwame Mensah",
    role: "Client",
    rating: 5,
    message: "Best freelance platform built for Africa. I've hired three designers and all delivered excellent work.",
    avatar: "K",
    avatarColor: "from-[#FB9E01] to-[#CC8102]",
  },
  {
    id: "5",
    name: "Ngozi Adeyemi",
    role: "Freelancer",
    rating: 5,
    message: "AfroTask gave me the visibility I needed. My profile gets seen by real clients every day.",
    avatar: "N",
    avatarColor: "from-[#00564C] to-[#027568]",
  },
  {
    id: "6",
    name: "Seun Balogun",
    role: "User",
    rating: 4,
    message: "Smooth experience from start to finish. The messaging system keeps everything in one place.",
    avatar: "S",
    avatarColor: "from-[#FB9E01] to-[#CC8102]",
  },
];

// ── Star rating display ──
function StarRating({ rating, interactive = false, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 transition-colors duration-150 ${
            star <= (interactive ? hovered || rating : rating)
              ? "text-[#FB9E01] fill-[#FB9E01]"
              : "text-gray-300"
          } ${interactive ? "cursor-pointer" : ""}`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange && onChange(star)}
        />
      ))}
    </div>
  );
}

// ── Review card ──
function ReviewCard({ review, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 h-full"
    >
      {/* Stars */}
      <StarRating rating={review.rating} />

      {/* Message */}
      <p className="text-gray-600 text-sm leading-relaxed flex-1">
        "{review.message}"
      </p>

      {/* User info */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.avatarColor || "from-[#00564C] to-[#027568]"} flex items-center justify-center shadow-sm flex-shrink-0`}
        >
          <span className="text-white font-bold text-sm">
            {review.avatar || review.name?.[0]?.toUpperCase() || "?"}
          </span>
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
          <p className="text-xs text-gray-400">{review.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Leave a Review Modal ──
function ReviewModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", role: "Freelancer", rating: 5, message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
    setDone(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-green-600 fill-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h3>
            <p className="text-gray-500 mb-6">Your review has been submitted.</p>
            <button
              onClick={onClose}
              className="bg-[#00564C] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#027568] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Leave a Review</h3>
            <p className="text-gray-500 text-sm mb-6">Share your experience with AfroTask</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Your Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Amara Osei"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#00564C]/30 focus:border-[#00564C] transition"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#00564C]/30 focus:border-[#00564C] transition"
                >
                  <option>Freelancer</option>
                  <option>Client</option>
                  <option>User</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                <StarRating
                  rating={form.rating}
                  interactive
                  onChange={(r) => setForm({ ...form, rating: r })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Your Review</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your experience..."
                  required
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#00564C]/30 focus:border-[#00564C] transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#00564C] hover:bg-[#027568] text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main AppReviews section ──
export default function AppReviews() {
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const [usingFirestore, setUsingFirestore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(0);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  const CARDS_PER_PAGE = 3;
  const totalPages = Math.ceil(reviews.length / CARDS_PER_PAGE);
  const visibleReviews = reviews.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);

  // Try to load from Firestore
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(20));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const firestoreReviews = snap.docs.map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              name: d.name,
              role: d.role,
              rating: d.rating,
              message: d.message,
              avatar: d.name?.[0]?.toUpperCase() || "?",
              avatarColor: d.role === "Client" ? "from-[#FB9E01] to-[#CC8102]" : "from-[#00564C] to-[#027568]",
            };
          });
          setReviews(firestoreReviews);
          setUsingFirestore(true);
        }
      } catch {
        // Firestore unavailable — keep fallback data silently
      }
    };
    loadReviews();
  }, []);

  const handleSubmitReview = async (form) => {
    const newReview = {
      ...form,
      id: Date.now().toString(),
      avatar: form.name[0]?.toUpperCase() || "?",
      avatarColor: form.role === "Client" ? "from-[#FB9E01] to-[#CC8102]" : "from-[#00564C] to-[#027568]",
      createdAt: new Date().toISOString(),
    };

    // Try Firestore first
    try {
      const docRef = await addDoc(collection(db, "reviews"), {
        name: form.name,
        role: form.role,
        rating: form.rating,
        message: form.message,
        createdAt: new Date().toISOString(),
      });
      newReview.id = docRef.id;
      setUsingFirestore(true);
    } catch {
      // Firestore unavailable — add to local state only
    }

    setReviews((prev) => [newReview, ...prev]);
    setPage(0);
  };

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, #f8fffe 0%, #f0faf8 40%, #fff8ee 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 80%, #00564C 0%, transparent 50%), radial-gradient(circle at 80% 20%, #FB9E01 0%, transparent 50%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <p className="text-[#00564C] font-semibold tracking-widest uppercase text-sm mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted by freelancers and clients worldwide
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-6">
            Real stories from real people building their future with AfroTask.
          </p>

          {/* Aggregate rating badge */}
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-md border border-gray-100">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 text-[#FB9E01] fill-[#FB9E01]" />
              ))}
            </div>
            <span className="font-bold text-gray-900 text-lg">{avgRating}</span>
            <span className="text-gray-400 text-sm">/ 5 · {reviews.length} reviews</span>
          </div>
        </motion.div>

        {/* Review cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {visibleReviews.map((review, i) => (
            <ReviewCard key={review.id} review={review} delay={i * 0.08} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mb-10">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === page ? "bg-[#00564C] scale-125" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}

        {/* Leave a review button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#00564C] hover:bg-[#027568] text-white font-semibold px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-base"
          >
            Leave a Review
          </button>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ReviewModal
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmitReview}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
