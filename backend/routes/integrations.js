const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const { invokeLLM } = require('../lib/aiClient');
const { generateAndPersistImage } = require('../services/imageGenerationService');

// POST /api/integrations/llm - InvokeLLM
router.post('/llm', authMiddleware, async (req, res) => {
  try {
    const { prompt, response_json_schema, model } = req.body;
    const output = await invokeLLM({
      prompt,
      responseJsonSchema: response_json_schema,
      model,
    });
    res.json(output);
  } catch (e) {
    const message = e?.message || 'LLM request failed';
    const status = /Missing .*API key|Prompt is required/i.test(message) ? 400 : 502;
    res.status(status).json({ error: message });
  }
});

// POST /api/integrations/generate-image — legacy path; same pipeline as POST /api/images/generate
router.post('/generate-image', authMiddleware, async (req, res) => {
  const { prompt, size, quality, output_format, aspect_ratio } = req.body || {};
  console.log('[generate-image] incoming prompt:', prompt);
  if (!prompt || !String(prompt).trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const { existing_image_urls, reference_image_url, input_fidelity } = req.body || {};
    const result = await generateAndPersistImage({
      prompt: String(prompt).trim(),
      size,
      quality,
      output_format,
      aspect_ratio,
      existing_image_urls,
      reference_image_url,
      input_fidelity,
    });
    res.json({ url: result.url });
  } catch (e) {
    const message = e?.message || 'Image generation failed';
    console.error('[generate-image]', message);
    if (/Prompt must|Invalid |exceeds maximum|Could not use the reference|Too many reference/i.test(message)) {
      return res.status(400).json({ error: message });
    }
    const status = /Missing .*API key/i.test(message) ? 503 : 502;
    res.status(status).json({ error: message });
  }
});

// POST /api/integrations/send-email - SendEmail
router.post('/send-email', authMiddleware, async (req, res) => {
  const { to, subject, body, from_name } = req.body;

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${from_name || 'AI Video Creator'}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: body,
  });

  res.json({ ok: true });
});

module.exports = router;
