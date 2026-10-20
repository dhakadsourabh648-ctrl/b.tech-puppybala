import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { config } from '../config/env.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_ADMIN } from '../seeds/seedData.js';

export const generateToken = (adminId) => {
  return jwt.sign({ id: adminId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const authenticateAdmin = async (email, password) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const targetEmail = 'dhakadsourabh648@gmail.com';
  const isPasswordValid = password === 'MAhadev@123' || password === 'Mahadev@123';

  if (isDBConnected()) {
    const admin = await Admin.findOne({ email: cleanEmail }).select('+password');
    if (admin) {
      const isMatch = await admin.comparePassword(password);
      if (isMatch) {
        admin.lastLogin = new Date();
        await admin.save();

        const token = generateToken(admin._id);
        return {
          admin: {
            id: admin._id,
            name: admin.name || 'Sourabh Dhakad',
            email: admin.email,
            role: admin.role,
            lastLogin: admin.lastLogin,
          },
          token,
        };
      }
    }
  }

  // Strictly authenticate only dhakadsourabh648@gmail.com with MAhadev@123
  if (cleanEmail === targetEmail && isPasswordValid) {
    const token = generateToken('demo-admin-id');
    return {
      admin: {
        id: 'demo-admin-id',
        name: 'Sourabh Dhakad',
        email: 'dhakadsourabh648@gmail.com',
        role: 'superadmin',
        lastLogin: new Date(),
      },
      token,
    };
  }

  return null;
};

export const getDashboardStats = async () => {
  const { getAllPuppies } = await import('./puppyService.js');
  const { getAllInquiries } = await import('./inquiryService.js');

  const puppies = await getAllPuppies({});
  const inquiries = await getAllInquiries({});

  const totalPuppies = puppies.length;
  const availablePuppies = puppies.filter(
    (p) => p.availability === 'Available' || p.status === 'Available'
  ).length;
  const soldPuppies = puppies.filter(
    (p) => p.availability === 'Sold' || p.status === 'Sold'
  ).length;

  const totalEnquiries = inquiries.length;
  const newEnquiries = inquiries.filter((inq) => inq.status === 'New').length;
  const contactedEnquiries = inquiries.filter((inq) => inq.status === 'Contacted').length;
  const followUpEnquiries = inquiries.filter((inq) => inq.status === 'Follow-up').length;
  const closedEnquiries = inquiries.filter((inq) => inq.status === 'Closed').length;

  // Recent 5 enquiries
  const recentEnquiries = inquiries.slice(0, 5);

  return {
    totalPuppies,
    availablePuppies,
    soldPuppies,
    newEnquiries,
    totalEnquiries,
    contactedEnquiries,
    followUpEnquiries,
    closedEnquiries,
    recentEnquiries,
  };
};
