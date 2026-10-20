import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ensure uploads folder exists in working directory
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `puppy_${Date.now()}_${cleanBase}${ext}`);
  },
});

// File filter: images and videos
const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Unsupported file format. Please upload only image files (JPG, PNG, WEBP) or video files (MP4, WEBM, MOV).'
      ),
      false
    );
  }
};

// 50MB file size limit to accommodate puppy videos
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// @desc    Upload photos or videos from device/gallery
// @route   POST /api/upload
// @access  Protected (Admin only)
router.post('/', protect, (req, res) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum allowed size is 50MB per file.',
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No media files were selected for upload.',
      });
    }

    // Return the URLs of uploaded files
    const uploadedMedia = req.files.map((file) => {
      const isVideo = file.mimetype.startsWith('video/');
      const fileUrl = `/uploads/${file.filename}`;
      return {
        url: fileUrl,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        isVideo,
        size: file.size,
      };
    });

    res.status(200).json({
      success: true,
      message: `Successfully uploaded ${req.files.length} file(s) from gallery.`,
      data: uploadedMedia,
      urls: uploadedMedia.map((m) => m.url),
    });
  });
});

export default router;
