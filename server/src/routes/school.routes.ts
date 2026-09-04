import { Router } from 'express';
import {
  getVerifiedSchools,
  getSchoolProfile,
  updateSchoolProfile,
  getVerifiedTeachersForSchool,
} from '../controllers/school.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// Public: list of verified schools for student signup dropdown
router.get('/verified', getVerifiedSchools);
router.get('/:schoolId/teachers', getVerifiedTeachersForSchool);

// Protected: profile management
router.get('/profile/:id?', authenticate, getSchoolProfile);
router.put('/profile', authenticate, requireRole('PRINCIPAL'), updateSchoolProfile);

export default router;
