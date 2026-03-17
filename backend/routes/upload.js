const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('./auth');

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const absoluteUploadDir = path.resolve(__dirname, '..', uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, absoluteUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// POST /api/integrations/upload (also used by integrations route above — register here)
router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').toString().split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const fileUrl = `${proto}://${host}/uploads/${req.file.filename}`;
  res.json({ file_url: fileUrl });
});

module.exports = router;
