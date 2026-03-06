import bcrypt from 'bcryptjs';
import { db } from '../config/firebase.js';
import { generateToken } from '../utils/generateToken.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

export const register = async (req, res) => {
  try {
    const { 
      fullName, email, password, role, whatsapp, country, 
      skillCategory, portfolioWebsite, linkedIn, 
      companyName, companyType 
    } = req.body;

    // Check if user already exists
    const usersRef = db.collection('users');
    const existingUser = await usersRef.where('email', '==', email).get();
    
    if (!existingUser.empty) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Profile image is required' });
    }

    // Upload image to Cloudinary
    const profileImageUrl = await uploadToCloudinary(req.file.buffer);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine account type
    const accountType = companyName ? 'company' : 'individual';

    // Create user document
    const userData = {
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      whatsapp,
      profileImage: profileImageUrl,
      country: country || null,
      skillCategory: skillCategory || null,
      portfolioWebsite: portfolioWebsite || null,
      linkedIn: linkedIn || null,
      companyName: companyName || null,
      companyType: companyType || null,
      accountType,
      createdAt: new Date().toISOString()
    };

    const userDoc = await usersRef.add(userData);

    // Generate JWT
    const token = generateToken(userDoc.id, role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userDoc.id,
        fullName,
        email,
        role,
        profileImage: profileImageUrl
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email.toLowerCase()).get();

    if (snapshot.empty) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    delete userData.password;

    res.json({ 
      success: true, 
      user: {
        id: userDoc.id,
        ...userData
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
};
