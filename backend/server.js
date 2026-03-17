require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const entitiesRoutes = require('./routes/entities');
const integrationsRoutes = require('./routes/integrations');
const uploadRoutes = require('./routes/upload');
const videosRoutes = require('./routes/videos');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const absoluteUploadDir = path.resolve(__dirname, uploadDir);
if (!fs.existsSync(absoluteUploadDir)) fs.mkdirSync(absoluteUploadDir, { recursive: true });

// Middleware
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (origin === allowedOrigin) return cb(null, true);
      if (/^http:\/\/localhost:517\d$/.test(origin)) return cb(null, true); // Vite may pick 5173+ automatically
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files as static
app.use('/uploads', express.static(absoluteUploadDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entities', entitiesRoutes);
app.use('/api/integrations/upload', uploadRoutes); // Registered before integrations
app.use('/api/integrations', integrationsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/videos', videosRoutes);

// Analytics (simple no-op)
app.post('/api/analytics/track', (req, res) => {
  console.log('[Analytics]', req.body.eventName, req.body.properties);
  res.json({ ok: true });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
