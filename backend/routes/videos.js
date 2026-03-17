const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const { createRecord } = require('../lib/store');
const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

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

function clampNumber(n, { min, max, fallback }) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, v));
}

function normalizeScenes(rawScenes, { maxScenes, maxTotalDurationSec }) {
  if (!Array.isArray(rawScenes)) return null;
  const cleaned = rawScenes
    .filter(Boolean)
    .slice(0, maxScenes)
    .map((s, idx) => {
      const duration = clampNumber(s.duration_sec ?? s.duration, { min: 2, max: 20, fallback: 6 });
      return {
        id: String(idx + 1),
        type: 'scene',
        title: typeof s.title === 'string' ? s.title.slice(0, 120) : `Scene ${idx + 1}`,
        narration: typeof s.narration === 'string' ? s.narration : '',
        content: typeof s.on_screen_text === 'string' ? s.on_screen_text : (typeof s.content === 'string' ? s.content : ''),
        visual_description: typeof s.visual_description === 'string' ? s.visual_description : '',
        image_prompt: typeof s.image_prompt === 'string' ? s.image_prompt : '',
        duration,
        transition: ['fade', 'slide', 'cut'].includes(s.transition) ? s.transition : 'fade',
      };
    });

  let total = cleaned.reduce((acc, s) => acc + (s.duration || 0), 0);
  if (total <= maxTotalDurationSec) return cleaned;

  while (cleaned.length > 1 && total > maxTotalDurationSec) {
    const removed = cleaned.pop();
    total -= removed?.duration || 0;
  }

  if (total > maxTotalDurationSec && cleaned.length) {
    const ratio = maxTotalDurationSec / total;
    for (const s of cleaned) {
      s.duration = clampNumber(Math.round(s.duration * ratio), { min: 2, max: 20, fallback: 6 });
    }
  }
  return cleaned;
}

async function generateStoryboardWithOpenAI({ type, prompt, settings, aspect_ratio, maxScenes, maxTotalDurationSec }) {
  if (!openai) return null;

  const model = process.env.VIDEO_STORY_MODEL || 'gpt-4o-mini';

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      scenes: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: true,
          properties: {
            title: { type: 'string' },
            narration: { type: 'string' },
            on_screen_text: { type: 'string' },
            visual_description: { type: 'string' },
            image_prompt: { type: 'string' },
            duration_sec: { type: 'number' },
            transition: { type: 'string' },
          },
          required: ['title', 'visual_description', 'image_prompt', 'duration_sec'],
        },
      },
    },
    required: ['title', 'scenes'],
  };

  const system = [
    'You are a senior video editor and storyboard artist.',
    'Return ONLY valid JSON.',
    'Make image prompts descriptive and consistent in style.',
    'Keep scenes concise and production-ready.',
  ].join(' ');

  const user = [
    `Create a storyboard for a ${type} video.`,
    `Aspect ratio: ${aspect_ratio}.`,
    `Style: ${settings?.style || 'realistic'}.`,
    `Captions: ${settings?.captions ? 'yes' : 'no'}.`,
    `Scene count target: ${maxScenes}. Max total duration: ${maxTotalDurationSec} seconds.`,
    '',
    'Prompt:',
    prompt || '(empty)',
    '',
    `Output JSON matching this schema: ${JSON.stringify(schema)}`,
  ].join('\n');

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content) return null;

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }

  const scenes = normalizeScenes(parsed.scenes, { maxScenes, maxTotalDurationSec });
  if (!scenes?.length) return null;

  const title = typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim().slice(0, 80) : null;
  return { title, scenes };
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

  const maxScenes = clampNumber(settings.sceneCount ?? settings.scene_count, { min: 3, max: 12, fallback: 6 });
  const maxTotalDurationSec = clampNumber(settings.maxDurationSec ?? settings.max_duration_sec, { min: 15, max: 180, fallback: 60 });

  let scenes = null;
  let generatedTitle = null;
  let storyboard_source = 'fallback';
  try {
    const storyboard = await generateStoryboardWithOpenAI({ type, prompt, settings, aspect_ratio, maxScenes, maxTotalDurationSec });
    if (storyboard) {
      scenes = storyboard.scenes;
      generatedTitle = storyboard.title;
      storyboard_source = 'openai';
    }
  } catch (e) {
    console.warn('[videos.generate] OpenAI storyboard generation failed, falling back.', e?.message || e);
  }

  if (!scenes) scenes = buildFallbackScenes({ type, prompt });

  const project = createRecord(
    'Project',
    {
      title: generatedTitle || titleFromPrompt,
      type,
      aspect_ratio,
      status: 'completed',
      storyboard_source,
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

