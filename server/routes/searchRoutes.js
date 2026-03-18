import express from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, globalSearch);

export default router;
