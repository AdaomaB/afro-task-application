import { db } from '../config/firebase.js';
import { calculateRankingScore } from './rankingController.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

// Get public profile
export const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();

    // Track profile view (only if viewing someone else's profile)
    if (req.user && req.user.userId !== userId) {
      await db.collection('profileViews').add({
        profileId: userId,
        viewerId: req.user.userId,
        viewedAt: new Date().toISOString()
      });
    }
    
    // Get follow stats
    console.log('Fetching followers for userId:', userId);
    const followersSnapshot = await db.collection('follows')
      .where('followingId', '==', userId)
      .get();
    
    console.log('Fetching following for userId:', userId);
    const followingSnapshot = await db.collection('follows')
      .where('followerId', '==', userId)
      .get();

    console.log('Followers count:', followersSnapshot.size);
    console.log('Following count:', followingSnapshot.size);

    // Get posts count
    const postsSnapshot = await db.collection('posts')
      .where('authorId', '==', userId)
      .get();

    // Get projects count (for freelancers)
    const projectsSnapshot = await db.collection('projects')
      .where('freelancerId', '==', userId)
      .where('status', '==', 'completed')
      .get();

    // Get profile views count
    const profileViewsSnapshot = await db.collection('profileViews')
      .where('profileId', '==', userId)
      .get();

    res.json({
      success: true,
      profile: {
        ...userData,
        uid: userId,
        followersCount: followersSnapshot.size,
        followingCount: followingSnapshot.size,
        postsCount: postsSnapshot.size,
        completedProjectsCount: projectsSnapshot.size,
        profileViews: profileViewsSnapshot.size
      }
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// Get own profile data
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      profile: userDoc.data()
    });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// Update about section
export const updateAbout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bio, skills, experience, education } = req.body;

    await db.collection('users').doc(userId).update({
      'about.bio': bio || '',
      'about.skills': skills || [],
      'about.experience': experience || '',
      'about.education': education || '',
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'About section updated successfully'
    });
  } catch (error) {
    console.error('Update about error:', error);
    res.status(500).json({ message: 'Failed to update about section' });
  }
};

// Add service
export const addService = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, price } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const serviceId = `service_${Date.now()}`;
    const service = {
      id: serviceId,
      title,
      description,
      price,
      createdAt: new Date().toISOString()
    };

    const userDoc = await db.collection('users').doc(userId).get();
    const currentServices = userDoc.data()?.services || [];

    await db.collection('users').doc(userId).update({
      services: [...currentServices, service],
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Add service error:', error);
    res.status(500).json({ message: 'Failed to add service' });
  }
};

// Delete service
export const deleteService = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { serviceId } = req.params;

    const userDoc = await db.collection('users').doc(userId).get();
    const currentServices = userDoc.data()?.services || [];

    const updatedServices = currentServices.filter(s => s.id !== serviceId);

    await db.collection('users').doc(userId).update({
      services: updatedServices,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Failed to delete service' });
  }
};

// Add portfolio item
export const addPortfolioItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, link, image } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const itemId = `portfolio_${Date.now()}`;
    const portfolioItem = {
      id: itemId,
      title,
      description,
      link: link || '',
      image: image || '',
      createdAt: new Date().toISOString()
    };

    const userDoc = await db.collection('users').doc(userId).get();
    const currentPortfolio = userDoc.data()?.portfolio || [];

    await db.collection('users').doc(userId).update({
      portfolio: [...currentPortfolio, portfolioItem],
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      item: portfolioItem
    });
  } catch (error) {
    console.error('Add portfolio item error:', error);
    res.status(500).json({ message: 'Failed to add portfolio item' });
  }
};

// Delete portfolio item
export const deletePortfolioItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;

    const userDoc = await db.collection('users').doc(userId).get();
    const currentPortfolio = userDoc.data()?.portfolio || [];

    const updatedPortfolio = currentPortfolio.filter(p => p.id !== itemId);

    await db.collection('users').doc(userId).update({
      portfolio: updatedPortfolio,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    console.error('Delete portfolio item error:', error);
    res.status(500).json({ message: 'Failed to delete portfolio item' });
  }
};

// Upload image (for portfolio items, etc.)
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    console.log('Uploading image to Cloudinary...');
    const imageUrl = await uploadToCloudinary(
      req.file.buffer,
      'afro-task/portfolio',
      'image'
    );

    console.log('Image uploaded successfully:', imageUrl);

    res.json({
      success: true,
      imageUrl
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
};

// Get profile view stats
export const getProfileViewStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get total views (simple query without index)
    const viewsSnapshot = await db.collection('profileViews')
      .where('profileId', '==', userId)
      .get();

    res.json({
      success: true,
      totalViews: viewsSnapshot.size,
      recentViews: viewsSnapshot.size, // Simplified - same as total for now
      uniqueViewers: viewsSnapshot.size // Simplified - same as total for now
    });
  } catch (error) {
    console.error('Get profile view stats error:', error);
    // Return 0 if there's an error instead of failing
    res.json({
      success: true,
      totalViews: 0,
      recentViews: 0,
      uniqueViewers: 0
    });
  }
};

// Update profile with image upload
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, bio, country, whatsapp, skillCategory, companyName, portfolioWebsite, linkedIn, portfolio, services } = req.body;

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    // Add fields if provided
    if (fullName) updateData.fullName = fullName;
    if (bio) updateData.bio = bio;
    if (country) updateData.country = country;
    if (whatsapp) updateData.whatsapp = whatsapp;
    if (skillCategory) updateData.skillCategory = skillCategory;
    if (companyName) updateData.companyName = companyName;
    if (portfolioWebsite) updateData.portfolioWebsite = portfolioWebsite;
    if (linkedIn) updateData.linkedIn = linkedIn;
    if (portfolio !== undefined) updateData.portfolio = portfolio;
    if (services !== undefined) updateData.services = services;

    // Handle profile image upload
    if (req.file) {
      const { uploadToCloudinary } = await import('../utils/cloudinaryUpload.js');
      const imageUrl = await uploadToCloudinary(req.file.buffer, 'afro-task/profiles', 'image');
      updateData.profileImage = imageUrl;
    }

    await db.collection('users').doc(userId).update(updateData);

    const updatedUser = await db.collection('users').doc(userId).get();

    // Update ranking score if user is a freelancer
    const userData = updatedUser.data();
    if (userData.role === 'freelancer') {
      await calculateRankingScore(userId);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: { uid: userId, ...updatedUser.data() }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};
