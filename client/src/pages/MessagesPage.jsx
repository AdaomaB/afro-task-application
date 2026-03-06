import { useState, useEffect, useContext, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Smile, Search, MoreVertical } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

const MessagesPage = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const isFreelancer = user?.role === 'freelancer';

  useEffect(() => {
    fetchConversations();
    // Poll for new conversations every 5 seconds
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-select chat from URL params
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId && conversations.length > 0) {
      const chat = conversations.find(c => c.id === chatId);
      if (chat) {
        setSelectedChat(chat);
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      // Poll for new messages every 2 seconds
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/pre-project-chats/my-chats');
      setConversations(response.data.chats || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat?.id) return;
    
    try {
      console.log('Fetching messages for chat:', selectedChat.id);
      const response = await api.get(`/pre-project-chats/${selectedChat.id}/messages?limit=50`);
      console.log('Messages received:', response.data.messages?.length || 0);
      const msgs = response.data.messages || [];
      setMessages(msgs);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const formData = new FormData();
      formData.append('text', newMessage);

      await api.post(`/pre-project-chats/${selectedChat.id}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Message sent successfully');
      toast.success('Message sent!');

      setNewMessage('');
      setShowEmojiPicker(false);
      
      // Immediately fetch messages to show the new one
      await fetchMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('text', '');
      formData.append('file', file);

      await api.post(`/pre-project-chats/${selectedChat.id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('File uploaded');
      
      // Immediately fetch messages to show the new one
      await fetchMessages();
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        <Navbar />
        
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row">
          {/* Conversations List */}
          <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-80 bg-white border-r border-gray-200 flex flex-col`}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => {
                // Safely extract last message text
                const lastMessageText = conv.lastMessage?.text || 
                                       (conv.lastMessage?.fileUrl ? '📎 File' : 'No messages yet');
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedChat(conv)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition ${
                      selectedChat?.id === conv.id ? 'bg-green-50' : ''
                    }`}
                  >
                    <img
                      src={conv.otherUser?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherUser?.fullName || 'User')}`}
                      alt={conv.otherUser?.fullName || 'User'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">{conv.otherUser?.fullName || 'Unknown User'}</p>
                      <p className="text-sm text-gray-500 truncate">{lastMessageText}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
              {conversations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>No conversations yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <img
                      src={selectedChat.otherUser?.profileImage || `https://ui-avatars.com/api/?name=${selectedChat.otherUser?.fullName}`}
                      alt={selectedChat.otherUser?.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{selectedChat.otherUser?.fullName}</p>
                      <p className="text-sm text-gray-500">{selectedChat.otherUser?.role}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => {
                      // Compare with user.id to check if message is from current user
                      const isOwn = message.senderId === user?.id;
                      
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            <img
                              src={
                                isOwn 
                                  ? (user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'You')}`)
                                  : (selectedChat.otherUser?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.otherUser?.fullName || 'User')}`)
                              }
                              alt={isOwn ? 'You' : selectedChat.otherUser?.fullName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              {message.text && (
                                <div className={`px-4 py-2 rounded-2xl ${
                                  isOwn 
                                    ? isFreelancer ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                                    : 'bg-gray-200 text-gray-900'
                                }`}>
                                  <p className="text-sm">{String(message.text)}</p>
                                </div>
                              )}
                              {message.fileUrl && (
                                <a
                                  href={message.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`block px-4 py-3 rounded-2xl ${
                                    isOwn ? 'bg-green-100' : 'bg-gray-200'
                                  } hover:opacity-80 transition`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="w-4 h-4" />
                                    <div>
                                      <p className="text-sm font-medium">{message.fileName || 'File'}</p>
                                      {message.fileSize && (
                                        <p className="text-xs text-gray-600">{formatFileSize(message.fileSize)}</p>
                                      )}
                                    </div>
                                  </div>
                                </a>
                              )}
                              <p className="text-xs text-gray-500 mt-1">{formatTime(message.createdAt)}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                    >
                      <Paperclip className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
                      >
                        <Smile className="w-5 h-5 text-gray-600" />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full right-0 mb-2">
                          <EmojiPicker
                            onEmojiClick={(emojiData) => {
                              setNewMessage(prev => prev + emojiData.emoji);
                              setShowEmojiPicker(false);
                            }}
                            width={300}
                            height={400}
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className={`p-3 rounded-full transition disabled:opacity-50 ${
                        isFreelancer 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-yellow-600 hover:bg-yellow-700'
                      } text-white`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
