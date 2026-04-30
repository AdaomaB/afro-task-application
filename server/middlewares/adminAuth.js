import jwt from 'jsonwebtoken';
import { db } from '../config/firebase.js';

export const adminOnly = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const userDoc = await db.collection('users').doc(decoded.userId).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = { userId: decoded.userId, role: 'admin' };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};
