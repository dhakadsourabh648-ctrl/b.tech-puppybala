import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { Admin } from '../models/Admin.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_ADMIN } from '../seeds/seedData.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please provide a valid Bearer token.',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    let admin = null;

    if (isDBConnected()) {
      admin = await Admin.findById(decoded.id).select('-password');
    } else if (decoded.id === 'demo-admin-id') {
      admin = {
        _id: 'demo-admin-id',
        id: 'demo-admin-id',
        name: DEMO_ADMIN.name,
        email: DEMO_ADMIN.email,
        role: DEMO_ADMIN.role,
        isActive: true,
      };
    }

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'The admin user associated with this token is inactive or no longer exists.',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or token has expired.',
      error: error.message,
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.admin && (req.admin.role === 'admin' || req.admin.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required.',
    });
  }
};
