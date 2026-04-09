import { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getDoc } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Star, X, ChevronLeft, ChevronRight } from "lucide-react";
import { db, ensureFirebaseAuth } from "../../config/firebase";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  query,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// No fallback - use Firestore only

// ── Star rating display ──
function StarRating({ rating, interactive = false, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 transition-colors duration-150 ${
            star <= (interactive ? (hovered > 0 ? hovered : rating) : rating)
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
function ReviewCard({ review, onEdit, onDelete, user, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const isOwnReview =
    review.reviewerId === user?.id ||
    review.reviewerId === user?._id ||
    review.reviewerId === user?.uid;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 h-full relative"
    >
      {/* Edit/Delete buttons for own reviews */}
      {isOwnReview && (
        <div className="absolute top-3 right-3 flex gap-1 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(review);
            }}
            className="w-7 h-7 rounded-lg bg-blue-100 hover:bg-blue-200 p-1 flex items-center justify-center text-blue-600 hover:text-blue-700 hover:shadow-md transition-all duration-200 cursor-pointer"
            title="Edit review"
          >
            <MdModeEditOutline className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(review.id);
            }}
            className="w-7 h-7 rounded-lg bg-red-100 hover:bg-red-200 p-1 flex items-center justify-center text-red-600 hover:text-red-700 hover:shadow-md transition-all duration-200 cursor-pointer"
            title="Delete review"
          >
            <MdDelete className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stars */}
      <StarRating rating={review.rating} />

      {/* Message */}
      <p className="text-gray-600 text-sm leading-relaxed flex-1">
        "{review.comment || review.message}"
      </p>

      {/* User info */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <div className="relative w-10 h-10 rounded-full shadow-sm flex-shrink-0 overflow-hidden">
          <img
            src={
              review.reviewer?.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                review.reviewer?.fullName || review.name || "User",
              )}&background=2563eb&color=fff&bold=true&size=128`
            }
            className="w-10 h-10 rounded-full"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=User`;
            }}
          />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {review.reviewer?.fullName || review.name}
          </p>
          <p className="text-xs text-gray-400">
            {review.reviewer?.role || review.role}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Leave a Review Modal ──
function ReviewModal({ onClose, onSubmit, editingReview, user }) {
  const [form, setForm] = useState({
    name: "",
    role: "",
    rating: 5,
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // RESTORED: This is the correct useEffect for the Modal to load existing review text
  useEffect(() => {
    if (user) {
      setForm({
        name: user.fullName || user.name || "",
        role: user.role === "freelancer" ? "Freelancer" : "Client",
        rating: editingReview?.rating || 5,
        message: editingReview?.comment || "",
      });
    }
  }, [user, editingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {editingReview ? "Review updated!" : "Thank you!"}
            </h3>
            <p className="text-gray-500 mb-6">
              Your review has been {editingReview ? "updated" : "submitted"}.
            </p>
            <button
              onClick={onClose}
              className="bg-[#00564C] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#027568] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {editingReview ? "Edit Review" : "Leave Review"}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Share your experience with AfroTask
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Rating
                </label>
                <StarRating
                  rating={form.rating}
                  interactive
                  onChange={(r) => setForm({ ...form, rating: r })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Your Review
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
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
                {submitting
                  ? editingReview
                    ? "Updating..."
                    : "Submitting..."
                  : editingReview
                    ? "Update Review"
                    : "Submit Review"}
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
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [page, setPage] = useState(0);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });
  const usersCache = useRef({});

  const CARDS_PER_PAGE = 3;
  const totalPages = Math.ceil(reviews.length / CARDS_PER_PAGE);
  const visibleReviews = reviews.slice(
    page * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE + CARDS_PER_PAGE,
  );

  // THE CORRECTED USEEFFECT FOR FETCHING REVIEWS
  useEffect(() => {
    setLoadingReviews(true);
    const q = query(collection(db, "reviews"), limit(20));
    
    const unsubscribe = onSnapshot(
      q,
      async (snap) => {
        try {
          const rawReviews = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            ref: doc.ref,
          }));

          const getTimestamp = (val) => {
            if (!val) return 0;
            if (typeof val.toDate === 'function') return val.toDate().getTime();
            if (val.seconds) return val.seconds * 1000;
            return new Date(val).getTime() || 0; 
          };

          const sortedReviews = [...rawReviews].sort((a, b) => {
            return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
          });

          let userReview = null;
          const currentUserId = user?.id || user?.uid || user?._id; 
          
          if (currentUserId) {
            userReview = sortedReviews.find((r) => r.reviewerId === currentUserId);
          }

          const orderedReviews = userReview
            ? [userReview, ...sortedReviews.filter((r) => r.id !== userReview?.id)]
            : sortedReviews;

          const reviewsWithReviewers = await Promise.all(
            orderedReviews.map(async (review) => {
              let reviewer = null;

              if (!review.reviewerId) {
                return {
                  ...review,
                  reviewer: {
                    fullName: review.name || "Anonymous",
                    profileImage: null,
                    role: review.role || "Client",
                  }
                };
              }

              if (!usersCache.current[review.reviewerId]) {
                try {
                  const userRef = doc(db, "users", review.reviewerId);
                  const userSnap = await getDoc(userRef);

                  if (userSnap.exists()) {
                    const userData = userSnap.data();
                    usersCache.current[review.reviewerId] = {
                      fullName: userData.fullName || userData.name || "Anonymous",
                      profileImage: userData.profileImage || userData.photoURL || null,
                      role: userData.role === "freelancer" ? "Freelancer" : "Client",
                    };
                  } else {
                    usersCache.current[review.reviewerId] = {
                      fullName: review.name || "Anonymous",
                      profileImage: null,
                      role: review.role || "Client",
                    };
                  }
                } catch (err) {
                  console.error(`Failed to fetch user ${review.reviewerId}:`, err);
                  usersCache.current[review.reviewerId] = {
                    fullName: review.name || "Anonymous",
                    profileImage: null,
                    role: review.role || "Client",
                  };
                }
              }
              
              reviewer = usersCache.current[review.reviewerId];
              return { ...review, reviewer };
            })
          );
          
          setReviews(reviewsWithReviewers);
          setError(null);
        } catch (err) {
          console.error("Snapshot processing error:", err);
          setError(err.message);
        } finally {
          setLoadingReviews(false);
        }
      },
      (error) => {
        console.error("Error loading reviews:", error);
        setError(
          error.code === "permission-denied"
            ? "Permission denied - check authentication"
            : error.message
        );
        setLoadingReviews(false);
      }
    );

    return () => unsubscribe();
  }, [user]); 

  const handleSubmitReview = async (form) => {
    if (!user?.id && !user?.uid && !user?._id) {
      toast.error("Please log in to leave a review.");
      navigate("/login");
      setShowModal(false);
      return;
    }

    try {
      await ensureFirebaseAuth();
      const currentUserId = user.id || user.uid || user._id;

      if (editingReview) {
        await updateDoc(editingReview.ref, {
          rating: form.rating,
          comment: form.message,
          updatedAt: serverTimestamp(),
        });
        toast.success("Review updated!");
        setEditingReview(null);
      } else {
        const existingQuery = query(
          collection(db, "reviews"),
          where("reviewerId", "==", currentUserId),
        );
        const existingSnap = await getDocs(existingQuery);

        if (!existingSnap.empty) {
          toast.error(
            "You already left a review. Edit it from your review below.",
          );
          return;
        }

        await addDoc(collection(db, "reviews"), {
          name: user.fullName || user.name || "Anonymous",
          role: user.role === "freelancer" ? "Freelancer" : "Client",
          rating: form.rating,
          comment: form.message,
          reviewerId: currentUserId,
          createdAt: serverTimestamp(),
        });
        toast.success("Review submitted!");
      }
      setShowModal(false);
    } catch (error) {
      console.error("Review submit error:", error.code, error.message);
      toast.error(`Failed to ${editingReview ? 'update' : 'submit'} review: ${error.message}`);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!user || !window.confirm("Delete your review?")) return;
    try {
      await ensureFirebaseAuth();
      await deleteDoc(doc(db, "reviews", reviewId));
      toast.success("Review deleted.");
    } catch (error) {
      toast.error("Failed to delete review.");
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #f8fffe 0%, #f0faf8 40%, #fff8ee 100%)",
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
          <h2 className="text-base md:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 md:mb-4">
            Trusted by freelancers and clients worldwide
          </h2>
          <p className="text-gray-500 text-xs lg:text-sm max-w-xl mx-auto mb-3 md:mb-6">
            Real stories from real people building their future with AfroTask.
          </p>

          {/* Aggregate rating badge */}
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl md:px-6 p-3 md:py-3 shadow-md border border-gray-100">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="md:w-5 w-3 h-3 md:h-5 text-[#FB9E01] fill-[#FB9E01]"
                />
              ))}
            </div>
            <span className="font-bold text-gray-900 text-sm md:text-lg">{avgRating}</span>
            <span className="text-gray-400 text-xs md:text-sm">
              / 5 · {reviews.length} reviews
            </span>
          </div>
        </motion.div>

        {loadingReviews ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 mb-10">
            {Array(3)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse h-64"
                />
              ))}
          </div>
        ) : error ? (

          <div className="col-span-full text-center py-12 rounded-2xl lg:p-8 p-6 bg-white mb-6 shadow-md">
            <X className="lg:w-12 lg:h-12 w-10 h-10 mx-auto text-red-400 mb-4" />
            <h3 className="lg:text-lg text-sm font-normal text-gray-900 mb-2">
              Failed to load reviews
            </h3>
            <button className="text-red-500 hover:text-red-300 mb-6" onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>

        ) : reviews.length === 0 ? (
          <div className="col-span-full text-center py-4">
            <Star className="lg:w-20 w-12 h-12 lg:h-20 mx-auto text-gray-300 mb-6" />
            <h3 className="lg:text-3xl text-xl font-bold text-gray-900 mb-4">
              No Reviews Yet
            </h3>
            <p className="lg:text-xl text-xs text-gray-500 max-w-lg mx-auto mb-8">
              Be the first to share your experience!
              <br />
              Your feedback helps freelancers and clients worldwide.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 mb-10">
            {visibleReviews.map((review, i) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={(review) => {
                  setEditingReview(review);
                  setShowModal(true); 
                }}
                onDelete={handleDeleteReview}
                user={user}
                delay={i * 0.08}
              />
            ))}
          </div>
        )}

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
            onClick={() => {
              if (!user) {
                toast.error("Please log in to leave a review.");
                navigate("/welcome");
                return;
              }
              setShowModal(true);
            }}
            className={`font-semibold px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg text-base inline-flex items-center gap-2 ${
              user
                ? "bg-[#00564C] hover:bg-[#027568] text-white hover:shadow-xl"
                : "bg-gray-200 text-gray-500 cursor-not-allowed hover:scale-100 shadow-none"
            }`}
            title={!user ? "Log in to leave a review" : ""}
          >
            {!user ? "SignUp Now" : "Leave a Review"}
          </button>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ReviewModal
            editingReview={editingReview}
            user={user}
            onClose={() => {
              setShowModal(false);
              setEditingReview(null);
            }}
            onSubmit={async (form) => {
              await ensureFirebaseAuth();
              if (editingReview) {
                const updatedReview = {
                  ...editingReview,
                  rating: form.rating,
                  comment: form.message,
                  updatedAt: new Date(),
                };
                setReviews((prev) =>
                  prev.map((r) =>
                    r.id === editingReview.id ? updatedReview : r,
                  ),
                );
              } else {
                await handleSubmitReview(form);
              }
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}