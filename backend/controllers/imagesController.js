const { generateAndPersistImage } = require('../services/imageGenerationService');

async function generate(req, res) {
  try {
    const result = await generateAndPersistImage(req.body || {});
    res.json(result);
  } catch (e) {
    const message = e?.message || 'Image generation failed';
    console.error('[images/generate]', message);
    if (/Prompt must|Invalid |exceeds maximum|Could not use the reference|Too many reference/i.test(message)) {
      return res.status(400).json({ error: message });
    }
    if (/Missing .*API key/i.test(message)) {
      return res.status(503).json({ error: message });
    }
    res.status(502).json({ error: message });
  }
}

module.exports = { generate };
