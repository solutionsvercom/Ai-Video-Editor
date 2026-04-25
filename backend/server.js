const path = require('path');
// Always load backend/.env (cwd-independent — fixes wrong/missing key when Node is not started from backend/)
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const entitiesRoutes = require('./routes/entities');
const integrationsRoutes = require('./routes/integrations');
const uploadRoutes = require('./routes/upload');
const videosRoutes = require('./routes/videos');
const imagesRoutes = require('./routes/images');
const { getStartupConfigSummary, getOpenAIImageModel } = require('./lib/aiClient');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const absoluteUploadDir = path.resolve(__dirname, uploadDir);
if (!fs.existsSync(absoluteUploadDir)) fs.mkdirSync(absoluteUploadDir, { recursive: true });

// Middleware — CORS: comma-separated FRONTEND_ORIGIN (Next.js default http://localhost:3000); in non-production, any localhost / 127.0.0.1 is allowed
const rawFrontendOrigins = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const allowedOrigins = rawFrontendOrigins
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const isProduction = process.env.NODE_ENV === 'production';
const localDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (!isProduction && localDevOrigin.test(origin)) return cb(null, true);
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
app.use('/api/images', imagesRoutes);

// Analytics (simple no-op)
app.post('/api/analytics/track', (req, res) => {
  console.log('[Analytics]', req.body.eventName, req.body.properties);
  res.json({ ok: true });
});

// Health check (includes active OpenAI image model from OPENAI_IMAGE_MODEL — same value used for generate/edit)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    openaiImageModel: getOpenAIImageModel(),
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    const config = getStartupConfigSummary();
    if (!config.hasOpenAIKey && !config.hasGoogleKey) {
      console.log('[config] Missing OPENAI_API_KEY (and optional GEMINI_API_KEY for AI_PROVIDER=google).');
    } else {
      console.log(`[config] AI provider (storyboard/LLM): ${config.provider}`);
      console.log(`[config] Story model: ${config.storyModel}`);
      console.log(`[config] Image (OpenAI): ${config.imageModel} — OpenAI key: ${config.hasOpenAIKey ? 'set' : 'missing'}`);
      console.log(`[config] Video (OpenAI): ${config.videoModel} — Google key (optional): ${config.hasGoogleKey ? 'set' : 'missing'}`);
      if (config.keyHint) console.log(`[config] Active provider key: ${config.keyHint}`);
    }
  }
});
