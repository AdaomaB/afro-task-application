# Afro Task - Freelance Marketplace Platform

A modern, full-stack freelance marketplace connecting African freelancers with clients worldwide.

## 🌟 Features

- **User Authentication**: Secure signup/login with JWT and Firebase
- **Dual User Roles**: Freelancer and Client dashboards
- **Job Marketplace**: Post jobs, browse opportunities, apply with proposals
- **Project Management**: Track ongoing and completed projects
- **Real-time Messaging**: Chat system for freelancers and clients
- **Social Feed**: Share updates, like, comment, and follow users
- **Portfolio Management**: Showcase work and services
- **Analytics Dashboard**: Track views, applications, and engagement
- **File Uploads**: Profile images, portfolios, CVs, and chat attachments
- **Mobile Responsive**: Works seamlessly on all devices

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- React Router v6
- Tailwind CSS
- Framer Motion
- Axios
- Firebase (Client SDK)

### Backend
- Node.js
- Express.js
- Firebase Admin SDK
- Firestore (Database)
- JWT Authentication
- Cloudinary (File Storage)
- Multer (File Uploads)

## 📁 Project Structure

```
afro-task/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   └── config/        # Configuration files
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Backend application
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middlewares/      # Custom middleware
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── package.json
│
└── docs/                 # Documentation
    ├── DEPLOYMENT_GUIDE.md
    ├── DEPLOYMENT_QUICK_START.md
    └── PRODUCTION_CHECKLIST.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project
- Cloudinary account

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/afro-task.git
cd afro-task
```

2. **Setup Backend**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

3. **Setup Frontend**
```bash
cd client
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🌐 Deployment

### Production Deployment

This application is configured for deployment on:
- **Backend**: Render
- **Frontend**: Vercel

See detailed deployment instructions:
- [Complete Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Quick Start Guide](DEPLOYMENT_QUICK_START.md)
- [Production Checklist](PRODUCTION_CHECKLIST.md)

### Quick Deploy

```bash
# Install production dependencies
cd server && npm install helmet compression

# Deploy backend to Render
# (Follow Render dashboard instructions)

# Deploy frontend to Vercel
cd client
vercel --prod
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET=your-secret-key
FIREBASE_PROJECT_ID=your-project-id
# ... (see .env.example for complete list)
```

### Frontend (.env)
```env
VITE_API_URL=https://your-api.onrender.com/api
VITE_FIREBASE_API_KEY=your-api-key
# ... (see .env.example for complete list)
```

## 🔒 Security

- JWT-based authentication
- Firebase security rules
- Helmet.js for security headers
- CORS configuration
- Environment variable protection
- Input validation
- File upload restrictions

## 📊 Features in Detail

### For Freelancers
- Browse and apply for jobs
- Manage applications
- Track project progress
- Build portfolio
- Offer services
- Real-time messaging
- Analytics dashboard

### For Clients
- Post job opportunities
- Review applications
- Hire freelancers
- Manage projects
- Rate and review
- Real-time messaging
- Analytics dashboard

### For Everyone
- Social feed
- Follow system
- Like and comment
- Profile customization
- Notifications
- Search functionality

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📈 Performance

- Optimized builds with Vite
- Lazy loading for routes
- Image optimization
- Compression middleware
- CDN delivery (Vercel)
- Database indexing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Cloudinary for file storage
- Render for hosting
- Vercel for frontend deployment

## 📞 Support

For support, email support@afrotask.com or join our Slack channel.

## 🗺️ Roadmap

- [ ] Payment integration (Stripe/PayPal)
- [ ] Video calls
- [ ] Advanced search filters
- [ ] Mobile apps (iOS/Android)
- [ ] Multi-language support
- [ ] AI-powered job matching
- [ ] Escrow system
- [ ] Dispute resolution

## 📱 Screenshots

[Add screenshots here]

## 🔗 Links

- [Live Demo](https://your-app.vercel.app)
- [API Documentation](https://your-api.onrender.com)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

---

Made with ❤️ for the African freelance community
