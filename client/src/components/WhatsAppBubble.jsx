import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Palette } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

// ── Easy to update: change numbers or labels here ──
const WHATSAPP_CONTACTS = [
  { name: 'Support Team', number: '2348036630578' },
  { name: 'Business Enquiries', number: '2348028973599' },
  { name: 'General Help', number: '2348100000000' }, // ← replace with real number
];

const CONCERNS = [
  'I need help with my account',
  'I have a payment issue',
  'I want to report a problem',
  'I need help finding a freelancer',
  'I have a question about a job',
  'Other (type below)',
];

const COLOR_OPTIONS = [
  { label: 'WhatsApp Green', value: '#25D366' },
  { label: 'AfroTask Teal', value: '#00564C' },
  { label: 'Gold', value: '#FB9E01' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Red', value: '#EF4444' },
];

const STORAGE_KEY = 'afrotask-wa-color';

export default function WhatsAppBubble() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedConcern, setSelectedConcern] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [bubbleColor, setBubbleColor] = useState(
    () => { try { return localStorage.getItem(STORAGE_KEY) || '#25D366'; } catch { return '#25D366'; } }
  );

  // Drag state
  const constraintsRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleColorChange = (color) => {
    setBubbleColor(color);
    try { localStorage.setItem(STORAGE_KEY, color); } catch {}
    setShowColorPicker(false);
  };

  const reset = () => {
    setStep(1);
    setSelectedContact(null);
    setSelectedConcern('');
    setCustomMessage('');
    setShowColorPicker(false);
  };

  const handleClose = () => { setOpen(false); reset(); };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setStep(2);
  };

  const handleSend = () => {
    const message = selectedConcern === 'Other (type below)'
      ? customMessage.trim() || 'Hello, I need help.'
      : selectedConcern;
    const url = `https://wa.me/${selectedContact.number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    handleClose();
  };

  return (
    <>
      {/* Full-screen drag constraint area */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[998]" />

      {/* Draggable floating bubble */}
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0.1}
        onDragEnd={(_, info) => setPosition({ x: info.point.x, y: info.point.y })}
        className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-2"
        style={{ touchAction: 'none' }}
      >
        {/* Color picker toggle */}
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => { e.stopPropagation(); setShowColorPicker(p => !p); }}
              className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200 hover:scale-110 transition"
              title="Customize color"
            >
              <Palette className="w-4 h-4 text-gray-600" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Color picker panel */}
        <AnimatePresence>
          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 w-52"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-semibold text-gray-600 mb-3">Button Color</p>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleColorChange(c.value)}
                    title={c.label}
                    className={`w-full aspect-square rounded-xl border-2 transition hover:scale-110 ${
                      bubbleColor === c.value ? 'border-gray-800 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Tap a color to apply</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main WhatsApp button */}
        <motion.button
          onClick={() => { setOpen(true); reset(); setShowColorPicker(false); }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center relative cursor-grab active:cursor-grabbing"
          style={{ backgroundColor: bubbleColor }}
          aria-label="Chat on WhatsApp"
        >
          <FaWhatsapp className="text-white text-3xl" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        </motion.button>
      </motion.div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-[999] w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: bubbleColor }}>
              <div className="flex items-center gap-3">
                <FaWhatsapp className="text-white text-2xl" />
                <div>
                  <p className="text-white font-bold text-sm">AfroTask Support</p>
                  <p className="text-white/80 text-xs">Chat with us on WhatsApp</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-white/80 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {step === 1 && (
                <>
                  <p className="text-gray-700 font-semibold text-sm mb-4">Who would you like to contact?</p>
                  <div className="space-y-2">
                    {WHATSAPP_CONTACTS.map((c) => (
                      <button
                        key={c.number}
                        onClick={() => handleContactSelect(c)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-green-400 hover:bg-green-50 transition text-left group"
                      >
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition" style={{ backgroundColor: `${bubbleColor}20` }}>
                          <FaWhatsapp style={{ color: bubbleColor }} className="text-lg" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                          <p className="text-xs text-gray-400">+{c.number}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <button onClick={() => setStep(1)} className="text-xs text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1 transition">
                    ← Back
                  </button>
                  <p className="text-gray-700 font-semibold text-sm mb-3">What's your concern?</p>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {CONCERNS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedConcern(c)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition ${
                          selectedConcern === c
                            ? 'border-green-400 bg-green-50 text-[#00564C] font-medium'
                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  {selectedConcern === 'Other (type below)' && (
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:border-transparent outline-none resize-none"
                      style={{ '--tw-ring-color': bubbleColor }}
                    />
                  )}

                  <button
                    onClick={handleSend}
                    disabled={!selectedConcern || (selectedConcern === 'Other (type below)' && !customMessage.trim())}
                    className="mt-4 w-full text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-40"
                    style={{ backgroundColor: bubbleColor }}
                  >
                    <FaWhatsapp className="text-lg" />
                    Send on WhatsApp
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
