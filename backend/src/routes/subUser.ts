import express from 'express';
import { authenticateToken } from '@/middleware/auth';
import { SubUserService, CreateSubUserData, UpdateSubUserData } from '@/services/subUserService';
import { rateLimiter } from '@/middleware/rateLimit';

const router = express.Router();
const subUserService = new SubUserService();

/**
 * POST /api/sub-user
 * Create a new sub-user (parent user only)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const parentUserId = req.user?.id;
    if (!parentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { email, password, name, permissions }: CreateSubUserData = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const subUser = await subUserService.createSubUser({
      email,
      password,
      name,
      permissions: permissions || {},
      parentUserId,
    });

    res.status(201).json({
      message: 'Sub-user created successfully',
      subUser,
    });
  } catch (error: any) {
    console.error('Error creating sub-user:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Failed to create sub-user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/sub-user
 * Get all sub-users for the authenticated parent user
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const parentUserId = req.user?.id;
    if (!parentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const subUsers = await subUserService.getSubUsersByParent(parentUserId);
    const stats = await subUserService.getSubUserStats(parentUserId);

    res.json({
      subUsers,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching sub-users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sub-users',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/sub-user/stats
 * Get sub-user statistics for the parent user
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const parentUserId = req.user?.id;
    if (!parentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await subUserService.getSubUserStats(parentUserId);

    res.json({ stats });
  } catch (error: any) {
    console.error('Error fetching sub-user stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/sub-user/:id
 * Get a specific sub-user by ID (parent user only)
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const parentUserId = req.user?.id;
    const { id } = req.params;

    if (!parentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Sub-user ID is required' });
    }

    const subUser = await subUserService.getSubUserById(id, parentUserId);

    if (!subUser) {
      return res.status(404).json({ error: 'Sub-user not found' });
    }

    res.json({ subUser });
  } catch (error: any) {
    console.error('Error fetching sub-user:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sub-user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/sub-user/:id
 * Update a sub-user (parent user only)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const parentUserId = req.user?.id;
    const { id } = req.params;

    if (!parentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Sub-user ID is required' });
    }

    const updateData: UpdateSubUserData = req.body;

    // Validate email format if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({ 
          error: 'Invalid email format' 
        });
      }
    }

    // Validate password strength if provided
    if (updateData.password && updateData.password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const subUser = await subUserService.updateSubUser(id, updateData, parentUserId);

    res.json({
      message: 'Sub-user updated successfully',
      subUser,
    });
  } catch (error: any) {
    console.error('Error updating sub-user:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Failed to update sub-user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/sub-user/:id
 * Delete a sub-user (parent user only)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const parentUserId = req.user?.id;
    const { id } = req.params;

    if (!parentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Sub-user ID is required' });
    }

    await subUserService.deleteSubUser(id, parentUserId);

    res.json({
      message: 'Sub-user deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting sub-user:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Failed to delete sub-user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/sub-user/login
 * Authenticate a sub-user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    const result = await subUserService.authenticateSubUser(email, password);

    res.json({
      message: 'Login successful',
      user: result,
    });
  } catch (error: any) {
    console.error('Error authenticating sub-user:', error);
    
    if (error.message.includes('Invalid credentials') || 
        error.message.includes('deactivated')) {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Failed to authenticate',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
