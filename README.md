# Afro Task Platform

A freelance marketplace platform connecting African freelancers with clients worldwide.

## 🚀 Live Demo
- **Frontend**: [Your Vercel URL]
- **Backend**: https://afro-task.up.railway.app

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Git

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/AdaomaB/afro-task.git
cd afro-task
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd server
npm install
```

**Important**: You MUST run `npm install` after cloning the repository. The `node_modules` folder is not included in Git.

#### Configure Environment Variables

Create a `server/.env` file:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=your_project.appspot.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### Setup Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the downloaded JSON file as `server/serviceAccountKey.json`
6. Enable Firestore Database in your Firebase project
7. Enable Firebase Storage

#### Start Backend Server
```bash
npm run dev
```

Server will run on `http://localhost:3001`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd client
npm install
```

**Important**: You MUST run `npm install` after cloning the repository. The `node_modules` folder is not included in Git.

#### Configure Environment Variables

Create a `client/.env.local` file:
```env
VITE_API_URL=http://localhost:3001/api

# Firebase Configuration (Frontend)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

To get Firebase frontend config:
1. Go to Firebase Console → Project Settings
2. Scroll to "Your apps" section
3. Click the web app icon (</>)
4. Copy the config values

#### Start Frontend Development Server
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

## 🌐 Production Deployment

### Backend Deployment (Railway)

1. Create account on [Railway](https://railway.app)
2. Create new project from GitHub repository
3. Set Root Directory to `server`
4. Add environment variables in Railway dashboard:
   - All variables from `server/.env.example`
   - Firebase credentials (individual variables, not the JSON file)
5. Deploy

### Frontend Deployment (Vercel)

1. Create account on [Vercel](https://vercel.com)
2. Import GitHub repository
3. Configure:
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables:
   - `VITE_API_URL=https://your-railway-url.up.railway.app/api`
   - All Firebase frontend variables
5. Deploy

## 📁 Project Structure

```
afro-task/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── services/      # API services
│   │   └── config/        # Configuration files
│   └── public/            # Static assets
│
├── server/                # Backend (Node.js + Express)
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── routes/           # API routes
│   └── serviceAccountKey.json  # Firebase credentials (not in git)
│
└── README.md
```

## 🔑 Required Services

### Firebase
- Firestore Database
- Firebase Storage
- Firebase Authentication

### Cloudinary
- Image hosting and transformation
- Sign up at [Cloudinary](https://cloudinary.com)

## 👥 Team Collaboration Setup

### Option 1: Shared Firebase Project (Recommended)

For team members working on the same project:

1. **Project Owner**: Add team members to Firebase
   - Go to Firebase Console → Project Settings → Users and Permissions
   - Click "Add Member" and enter their email
   - Assign "Editor" role

2. **Share Credentials Securely**
   - Send `serviceAccountKey.json` via encrypted channel (NOT GitHub)
   - Share `.env` file contents securely
   - Use a team password manager if available

3. **Team Member Setup**
   - Clone the repository
   - Create `server/.env` with shared credentials
   - Create `client/.env.local` with shared Firebase config
   - Start development

**Benefits**: Shared database, real-time collaboration, same user accounts

### Option 2: Separate Development Environments

For independent development/testing:

1. Each developer creates their own Firebase project
2. Each developer gets their own Cloudinary account
3. Everyone has isolated test data

**Benefits**: No risk of breaking shared data, independent testing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Important**: Never commit `.env` files or `serviceAccountKey.json` to GitHub!

## 📝 License

This project is licensed under the MIT License.

## � Troubleshooting

### Error: "npm registry deprecating TLS 1.0 and TLS 1.1"
Your Node.js/npm version is outdated. Update to:
- Node.js v18 or higher
- npm v9 or higher

```bash
# Update npm
npm install -g npm@latest

# Or download latest Node.js from https://nodejs.org
```

### Error: "Cannot find package 'express'"
You forgot to install dependencies:
```bash
cd server
npm install
```

### Firebase connection errors
Make sure you:
1. Created `server/.env` file with correct values
2. Added `server/serviceAccountKey.json` file
3. Enabled Firestore and Storage in Firebase Console

## 👥 Contact

Project Link: [https://github.com/AdaomaB/afro-task](https://github.com/AdaomaB/afro-task)
