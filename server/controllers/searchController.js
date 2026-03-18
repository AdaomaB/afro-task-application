import { db } from '../config/firebase.js';

export const globalSearch = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const searchQuery = q.toLowerCase();
    const limitNum = Math.min(parseInt(limit), 50);

    // Search posts
    const postsSnapshot = await db.collection('posts').get();
    const posts = postsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        type: 'post',
        ...doc.data()
      }))
      .filter(post => {
        const contentMatch = post.content?.toLowerCase().includes(searchQuery);
        const hashtagMatch = post.hashtags?.some(tag => tag.toLowerCase().includes(searchQuery));
        return contentMatch || hashtagMatch;
      })
      .slice(0, limitNum);

    // Search jobs
    const jobsSnapshot = await db.collection('jobs').get();
    const jobs = jobsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        type: 'job',
        ...doc.data()
      }))
      .filter(job => {
        const titleMatch = job.title?.toLowerCase().includes(searchQuery);
        const descriptionMatch = job.description?.toLowerCase().includes(searchQuery);
        const categoryMatch = job.category?.toLowerCase().includes(searchQuery);
        const skillsMatch = job.requiredSkills?.some(skill => skill.toLowerCase().includes(searchQuery));
        return titleMatch || descriptionMatch || categoryMatch || skillsMatch;
      })
      .slice(0, limitNum);

    // Search projects
    const projectsSnapshot = await db.collection('projects').get();
    const projects = projectsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        type: 'project',
        ...doc.data()
      }))
      .filter(project => {
        const titleMatch = project.title?.toLowerCase().includes(searchQuery);
        const descriptionMatch = project.description?.toLowerCase().includes(searchQuery);
        const statusMatch = project.status?.toLowerCase().includes(searchQuery);
        return titleMatch || descriptionMatch || statusMatch;
      })
      .slice(0, limitNum);

    // Search users (freelancers/clients)
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs
      .map(doc => ({
        id: doc.id,
        type: 'user',
        ...doc.data()
      }))
      .filter(user => {
        const nameMatch = user.fullName?.toLowerCase().includes(searchQuery);
        const emailMatch = user.email?.toLowerCase().includes(searchQuery);
        const bioMatch = user.bio?.toLowerCase().includes(searchQuery);
        const skillsMatch = user.skills?.some(skill => skill.toLowerCase().includes(searchQuery));
        return nameMatch || emailMatch || bioMatch || skillsMatch;
      })
      .slice(0, limitNum)
      .map(user => ({
        ...user,
        email: undefined, // Don't expose email in search results
        password: undefined
      }));

    // Enrich posts with author data
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const userDoc = await db.collection('users').doc(post.authorId).get();
        return {
          ...post,
          author: userDoc.exists ? {
            fullName: userDoc.data().fullName,
            profileImage: userDoc.data().profileImage,
            role: userDoc.data().role
          } : null
        };
      })
    );

    // Enrich jobs with client data
    const enrichedJobs = await Promise.all(
      jobs.map(async (job) => {
        const userDoc = await db.collection('users').doc(job.clientId).get();
        return {
          ...job,
          client: userDoc.exists ? {
            fullName: userDoc.data().fullName,
            profileImage: userDoc.data().profileImage
          } : null
        };
      })
    );

    // Combine and return all results
    const allResults = [
      ...enrichedPosts.map(p => ({
        ...p,
        resultTitle: p.content?.substring(0, 50) || 'Post',
        resultSubtitle: p.author?.fullName || 'Unknown'
      })),
      ...enrichedJobs.map(j => ({
        ...j,
        resultTitle: j.title,
        resultSubtitle: j.client?.fullName || 'Job'
      })),
      ...projects.map(p => ({
        ...p,
        resultTitle: p.title,
        resultSubtitle: p.status || 'Project'
      })),
      ...users.map(u => ({
        ...u,
        resultTitle: u.fullName,
        resultSubtitle: u.role,
        resultImage: u.profileImage
      }))
    ];

    res.json({
      success: true,
      query: q,
      results: allResults,
      counts: {
        posts: enrichedPosts.length,
        jobs: enrichedJobs.length,
        projects: projects.length,
        users: users.length,
        total: allResults.length
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
};
