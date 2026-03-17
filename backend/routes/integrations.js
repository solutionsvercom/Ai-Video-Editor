const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/integrations/llm - InvokeLLM
router.post('/llm', authMiddleware, async (req, res) => {
  const { prompt, response_json_schema, add_context_from_internet, model } = req.body;

  const systemPrompt = response_json_schema
    ? 'You are a helpful AI assistant. Respond ONLY with valid JSON matching the provided schema.'
    : 'You are a helpful AI assistant.';

  const userPrompt = response_json_schema
    ? `${prompt}\n\nRespond with JSON matching this schema: ${JSON.stringify(response_json_schema)}`
    : prompt;

  const gptModel = model === 'claude_sonnet_4_6' ? 'gpt-4o' : 'gpt-4o-mini';

  const completion = await openai.chat.completions.create({
    model: gptModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: response_json_schema ? { type: 'json_object' } : undefined,
  });

  const content = completion.choices[0].message.content;

  if (response_json_schema) {
    res.json(JSON.parse(content));
  } else {
    res.json(content);
  }
});

// POST /api/integrations/generate-image - GenerateImage
router.post('/generate-image', authMiddleware, async (req, res) => {
  const { prompt, existing_image_urls } = req.body;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
  });

  res.json({ url: response.data[0].url });
});

// POST /api/integrations/send-email - SendEmail
router.post('/send-email', authMiddleware, async (req, res) => {
  const { to, subject, body, from_name } = req.body;

  // Requires nodemailer configured with SMTP env vars
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
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
