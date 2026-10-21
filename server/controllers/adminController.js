import {
  authenticateAdmin,
  getDashboardStats,
  logoutAdmin,
} from '../services/adminService.js';
import { getDBStatus } from '../config/db.js';

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
export const loginAdminHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const authResult = await authenticateAdmin(email, password);

    if (!authResult) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin authenticated successfully',
      ...authResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Admin Profile
// @route   GET /api/admin/me
// @access  Private (Admin Protected)
export const getAdminProfileHandler = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.admin,
    database: getDBStatus(),
  });
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin Protected)
export const getDashboardStatsHandler = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json({
      success: true,
      data: stats,
      database: getDBStatus(),
    });
  } catch (error) {
    next(error);
  }
};
export const logoutAdminHandler = async (req, res, next) => {
  try {
    await logoutAdmin(req.admin._id);

    res.status(200).json({
      success: true,
      message: 'Admin logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
