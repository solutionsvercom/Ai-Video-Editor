const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const { createRecord } = require('../lib/store');

function buildFallbackScenes({ type, prompt }) {
  const base = prompt?.trim() || 'Your video';
  if (type === 'voice-to-video') {
    return [
      { id: '1', type: 'scene', content: `Intro for: ${base}`, duration: 5, transition: 'fade' },
      { id: '2', type: 'scene', content: 'Key points synced to voiceover', duration: 12, transition: 'slide' },
      { id: '3', type: 'scene', content: 'Call to action', duration: 5, transition: 'fade' },
    ];
  }
  if (type === 'image-to-video') {
    return [
      { id: '1', type: 'scene', content: `Opening montage: ${base}`, duration: 6, transition: 'fade' },
      { id: '2', type: 'scene', content: 'Pan/zoom across uploaded images', duration: 10, transition: 'slide' },
      { id: '3', type: 'scene', content: 'Outro title card', duration: 4, transition: 'fade' },
    ];
  }
  return [
    { id: '1', type: 'scene', content: `Hook: ${base}`, duration: 5, transition: 'fade' },
    { id: '2', type: 'scene', content: 'Main story beats', duration: 12, transition: 'slide' },
    { id: '3', type: 'scene', content: 'Wrap-up + CTA', duration: 5, transition: 'fade' },
  ];
}

// POST /api/videos/generate
// Creates a Project entity locally and returns it.
router.post('/generate', authMiddleware, async (req, res) => {
  const {
    type = 'text-to-video',
    prompt = '',
    settings = {},
    audio_url = null,
    image_urls = [],
  } = req.body || {};

  const titleFromPrompt = (prompt || '').trim().slice(0, 60) || 'Untitled Video';
  const aspect_ratio = settings.aspectRatio || settings.aspect_ratio || '16:9';

  const scenes = buildFallbackScenes({ type, prompt });

  const project = createRecord(
    'Project',
    {
      title: titleFromPrompt,
      type,
      aspect_ratio,
      status: 'completed',
      scenes,
      assets: {
        audio_url,
        image_urls,
      },
      settings,
    },
    { created_by: req.user.email }
  );

  res.status(201).json(project);
});

module.exports = router;

