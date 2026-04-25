const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');
const { toFile } = require('openai/uploads');

function normalizeApiKey(raw) {
  if (raw == null || typeof raw !== 'string') return '';
  let key = raw.trim().replace(/^\uFEFF/, '');
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  return key;
}

function getAIProvider() {
  const provider = String(process.env.AI_PROVIDER || 'openai').trim().toLowerCase();
  return provider === 'google' ? 'google' : 'openai';
}

function getApiKeyForProvider(provider = getAIProvider()) {
  if (provider === 'google') {
    return normalizeApiKey(process.env.GEMINI_API_KEY) || normalizeApiKey(process.env.GOOGLE_API_KEY);
  }
  return normalizeApiKey(process.env.OPENAI_API_KEY);
}

function getStoryModel(provider = getAIProvider()) {
  if (provider === 'google') return process.env.GOOGLE_STORY_MODEL || 'gemini-2.0-flash';
  return process.env.OPENAI_STORY_MODEL || 'gpt-4o-mini';
}

/**
 * Single source of truth for OpenAI image **generate** and **edit** (`images.generate` / `images.edit`).
 * Set `OPENAI_IMAGE_MODEL` in `backend/.env` only — no other env var overrides this for images.
 */
function getOpenAIImageModel() {
  const raw = process.env.OPENAI_IMAGE_MODEL;
  if (raw == null || typeof raw !== 'string') return 'gpt-image-2';
  let m = raw.trim().replace(/^\uFEFF/, '');
  if ((m.startsWith('"') && m.endsWith('"')) || (m.startsWith("'") && m.endsWith("'"))) {
    m = m.slice(1, -1).trim();
  }
  return m || 'gpt-image-2';
}

/** OpenAI text-to-video (`POST /v1/videos`) — Sora family (e.g. sora-2, sora-2-pro). Google’s separate product is “Veo”. */
function getOpenAIVideoModel() {
  return process.env.OPENAI_VIDEO_MODEL || 'sora-2';
}

function openAiVideoApiBase() {
  return (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
}

function openAiVideoSizeFromAspect(aspectRatio) {
  const ar = String(aspectRatio || '16:9');
  if (ar === '9:16' || ar === '3:4') return '720x1280';
  return '1280x720';
}

/** OpenAI Videos API allows seconds 4, 8, or 12 only. */
function snapOpenAiVideoSeconds(sec) {
  const n = Number(sec);
  if (!Number.isFinite(n)) return '8';
  const allowed = [4, 8, 12];
  const best = allowed.reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a));
  return String(best);
}

let cachedGoogleClient = null;
let cachedGoogleKey = '';
let cachedOpenAIClient = null;
let cachedOpenAIKey = '';

function getGoogleClient() {
  const key = getApiKeyForProvider('google');
  if (!key) return null;
  if (cachedGoogleClient && cachedGoogleKey === key) return cachedGoogleClient;
  cachedGoogleKey = key;
  cachedGoogleClient = new GoogleGenAI({ apiKey: key });
  return cachedGoogleClient;
}

function getOpenAIClient() {
  const apiKey = getApiKeyForProvider('openai');
  if (!apiKey) return null;
  if (cachedOpenAIClient && cachedOpenAIKey === apiKey) return cachedOpenAIClient;
  cachedOpenAIKey = apiKey;
  cachedOpenAIClient = new OpenAI({ apiKey });
  return cachedOpenAIClient;
}

function dallE3Size(aspectRatio) {
  const ar = String(aspectRatio || '1:1');
  if (ar === '16:9' || ar === '4:3') return '1792x1024';
  if (ar === '9:16' || ar === '3:4') return '1024x1792';
  return '1024x1024';
}

function gptImageSize(aspectRatio) {
  const ar = String(aspectRatio || '1:1');
  if (ar === '16:9') return '1536x1024';
  if (ar === '9:16') return '1024x1536';
  return '1024x1024';
}

/** Map env / legacy DALL·E quality labels to GPT Image API values. */
function normalizeGptImageQuality(raw) {
  const q = String(raw || 'auto').trim().toLowerCase();
  if (['auto', 'high', 'medium', 'low'].includes(q)) return q;
  if (q === 'hd') return 'high';
  if (q === 'standard') return 'medium';
  return 'auto';
}

function isGptImageModel(model) {
  const m = String(model || '').toLowerCase();
  if (m === 'dall-e-2' || m === 'dall-e-3') return false;
  return m.startsWith('gpt-image') || m.includes('gpt-image') || m.startsWith('chatgpt-image');
}

async function parseJsonSafely(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function stripJsonCodeFence(text) {
  const raw = String(text || '').trim();
  const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : raw;
}

function extractResponseOutputText(body) {
  if (typeof body?.output_text === 'string' && body.output_text.trim()) return body.output_text;
  const output = Array.isArray(body?.output) ? body.output : [];
  const parts = [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const chunk of content) {
      if (typeof chunk?.text === 'string') parts.push(chunk.text);
    }
  }
  return parts.join('\n').trim();
}

async function parseModelJson(rawText) {
  const direct = await parseJsonSafely(rawText);
  if (direct) return direct;
  return parseJsonSafely(stripJsonCodeFence(rawText));
}

async function generateStructuredText({ system, user, schema, temperature = 0.7 }) {
  const provider = getAIProvider();
  const model = getStoryModel(provider);

  if (provider === 'google') {
    const client = getGoogleClient();
    if (!client) throw new Error('Missing Google API key. Set GEMINI_API_KEY or GOOGLE_API_KEY.');

    const response = await client.models.generateContent({
      model,
      contents: `${system}\n\n${user}`,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: schema,
        temperature,
      },
    });
    const content = response.text || '';
    const parsed = await parseJsonSafely(content);
    if (!parsed) throw new Error('Google model returned invalid JSON.');
    return { provider, model, parsed };
  }

  const client = getOpenAIClient();
  if (!client) throw new Error('Missing OpenAI API key. Set OPENAI_API_KEY in backend/.env.');
  const body = await client.responses.create({
    model,
    temperature,
    input: [
      { role: 'system', content: [{ type: 'input_text', text: system }] },
      { role: 'user', content: [{ type: 'input_text', text: user }] },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'storyboard',
        schema,
        strict: true,
      },
    },
  });

  const content = extractResponseOutputText(body);
  const parsed = await parseModelJson(content);
  if (!parsed) throw new Error('OpenAI model returned invalid JSON.');
  return { provider, model, parsed };
}

/**
 * Image generation: always OpenAI (`client.images.generate`).
 * Supports DALL·E 2/3 and GPT Image models (e.g. gpt-image-2); see OpenAI Image API guide.
 */
async function generateImageBase64({
  prompt,
  aspectRatio = '1:1',
  size: sizeOverride,
  quality: qualityOverride,
  output_format,
} = {}) {
  const client = getOpenAIClient();
  if (!client) throw new Error('Missing OPENAI_API_KEY (required for OpenAI image generation).');

  const model = getOpenAIImageModel();
  const normalizedPrompt = String(prompt || '').trim();
  if (!normalizedPrompt) throw new Error('Prompt is required');

  const isDalle3 = model === 'dall-e-3';
  const isDalle2 = model === 'dall-e-2';
  const isGpt = isGptImageModel(model);

  let size = sizeOverride || null;
  if (!size) {
    if (isDalle3) size = dallE3Size(aspectRatio);
    else if (isDalle2) size = '1024x1024';
    else size = gptImageSize(aspectRatio);
  }

  const body = {
    model,
    prompt: normalizedPrompt,
    n: 1,
    size,
  };

  if (isDalle3) {
    body.response_format = 'b64_json';
    const q = qualityOverride || process.env.OPENAI_IMAGE_QUALITY || 'standard';
    body.quality = q === 'hd' ? 'hd' : 'standard';
  } else if (isDalle2) {
    body.response_format = 'b64_json';
  } else if (isGpt) {
    const q = normalizeGptImageQuality(qualityOverride || process.env.OPENAI_IMAGE_QUALITY);
    body.quality = q;
    if (output_format) body.output_format = output_format;
  }

  let resBody;
  try {
    resBody = await client.images.generate(body);
  } catch (err) {
    const msg = err?.error?.message || err?.message || String(err);
    const wrapped = new Error(msg);
    wrapped.status = err?.status ?? err?.statusCode;
    throw wrapped;
  }

  const d0 = resBody?.data?.[0];
  if (d0?.b64_json) {
    return {
      provider: 'openai',
      model,
      mime: mimeFromOutputFormat(output_format),
      base64: d0.b64_json,
      sizeUsed: size,
    };
  }
  if (d0?.url) {
    const imgRes = await fetch(d0.url);
    if (!imgRes.ok) throw new Error(`Failed to fetch generated image URL (${imgRes.status}).`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const mime = (imgRes.headers.get('content-type') || 'image/png').split(';')[0].trim();
    return { provider: 'openai', model, mime, base64: buf.toString('base64'), sizeUsed: size };
  }

  throw new Error('OpenAI image API returned no image data (no b64_json or url).');
}

function mimeFromOutputFormat(output_format) {
  if (output_format === 'jpeg' || output_format === 'jpg') return 'image/jpeg';
  if (output_format === 'webp') return 'image/webp';
  return 'image/png';
}

async function filePathToOpenAIUpload(imageFilePath) {
  const st = fs.statSync(imageFilePath);
  const maxBytes = 50 * 1024 * 1024;
  if (st.size > maxBytes) throw new Error('A reference image exceeds 50MB (OpenAI limit).');

  const basename = path.basename(imageFilePath);
  const ext = path.extname(basename).toLowerCase();
  const typeGuess =
    ext === '.png'
      ? 'image/png'
      : ext === '.webp'
        ? 'image/webp'
        : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : 'image/png';
  const buf = fs.readFileSync(imageFilePath);
  return toFile(buf, basename, { type: typeGuess });
}

/**
 * Image edit: OpenAI `client.images.edit` (GPT Image or dall-e-2).
 * GPT Image models accept up to 16 reference images; dall-e-2 / dall-e-3 accept one.
 * @param {object} opts
 * @param {string|string[]} opts.imageFilePath - One path or multiple absolute paths under uploads (trusted).
 */
async function editImageBase64({
  prompt,
  imageFilePath,
  imageFilePaths,
  aspectRatio = '1:1',
  size: sizeOverride,
  quality: qualityOverride,
  output_format,
  input_fidelity,
} = {}) {
  const client = getOpenAIClient();
  if (!client) throw new Error('Missing OPENAI_API_KEY (required for OpenAI image editing).');

  const model = getOpenAIImageModel();
  const normalizedPrompt = String(prompt || '').trim();
  if (!normalizedPrompt) throw new Error('Prompt is required');

  const rawPaths = Array.isArray(imageFilePaths)
    ? imageFilePaths
    : imageFilePaths
      ? [imageFilePaths]
      : imageFilePath
        ? [imageFilePath]
        : [];
  const paths = rawPaths.filter(Boolean);
  if (!paths.length) throw new Error('At least one reference image is required for edit.');

  const isDalle3 = model === 'dall-e-3';
  const isDalle2 = model === 'dall-e-2';
  const isGpt = isGptImageModel(model);
  const maxRefs = isGpt ? 16 : 1;
  if (paths.length > maxRefs) {
    throw new Error(`Too many reference images for ${model} (maximum ${maxRefs}).`);
  }

  const uploadParts = [];
  for (const p of paths) {
    uploadParts.push(await filePathToOpenAIUpload(p));
  }
  const imagePayload = uploadParts.length === 1 ? uploadParts[0] : uploadParts;

  let size = sizeOverride || null;
  if (!size) {
    if (isDalle3) size = dallE3Size(aspectRatio);
    else if (isDalle2) size = '1024x1024';
    else size = gptImageSize(aspectRatio);
  }

  const body = {
    model,
    prompt: normalizedPrompt,
    image: imagePayload,
    n: 1,
    size,
  };

  if (isDalle3) {
    body.response_format = 'b64_json';
    const q = qualityOverride || process.env.OPENAI_IMAGE_QUALITY || 'standard';
    body.quality = q === 'hd' ? 'hd' : 'standard';
  } else if (isDalle2) {
    body.response_format = 'b64_json';
    if (!['256x256', '512x512', '1024x1024'].includes(String(size))) body.size = '1024x1024';
  } else if (isGpt) {
    const q = normalizeGptImageQuality(qualityOverride || process.env.OPENAI_IMAGE_QUALITY);
    body.quality = q;
    if (output_format) body.output_format = output_format;
    const fid = input_fidelity || process.env.OPENAI_IMAGE_INPUT_FIDELITY;
    if (fid === 'high' || fid === 'low') body.input_fidelity = fid;
  }

  let resBody;
  try {
    resBody = await client.images.edit(body);
  } catch (err) {
    const msg = err?.error?.message || err?.message || String(err);
    const wrapped = new Error(msg);
    wrapped.status = err?.status ?? err?.statusCode;
    throw wrapped;
  }

  const d0 = resBody?.data?.[0];
  if (d0?.b64_json) {
    return {
      provider: 'openai',
      model,
      mime: mimeFromOutputFormat(output_format),
      base64: d0.b64_json,
      sizeUsed: body.size,
    };
  }
  if (d0?.url) {
    const imgRes = await fetch(d0.url);
    if (!imgRes.ok) throw new Error(`Failed to fetch edited image URL (${imgRes.status}).`);
    const outBuf = Buffer.from(await imgRes.arrayBuffer());
    const mime = (imgRes.headers.get('content-type') || 'image/png').split(';')[0].trim();
    return { provider: 'openai', model, mime, base64: outBuf.toString('base64'), sizeUsed: body.size };
  }

  throw new Error('OpenAI image edit API returned no image data (no b64_json or url).');
}

function resolveGenericModel(provider, requestedModel) {
  if (provider === 'google') return requestedModel || process.env.GOOGLE_CHAT_MODEL || 'gemini-2.0-flash';
  if (requestedModel === 'claude_sonnet_4_6') return 'gpt-4o';
  return requestedModel || process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
}

async function invokeLLM({ prompt, responseJsonSchema, model }) {
  const provider = getAIProvider();
  const resolvedModel = resolveGenericModel(provider, model);
  const userPrompt = String(prompt || '').trim();
  if (!userPrompt) throw new Error('Prompt is required');

  if (provider === 'google') {
    const client = getGoogleClient();
    if (!client) throw new Error('Missing Google API key. Set GEMINI_API_KEY or GOOGLE_API_KEY.');

    const response = await client.models.generateContent({
      model: resolvedModel,
      contents: responseJsonSchema
        ? `Respond ONLY with valid JSON matching this schema: ${JSON.stringify(responseJsonSchema)}\n\n${userPrompt}`
        : userPrompt,
      config: responseJsonSchema
        ? {
            responseMimeType: 'application/json',
            responseJsonSchema: responseJsonSchema,
          }
        : undefined,
    });

    const text = response.text || '';
    if (responseJsonSchema) {
      const parsed = await parseJsonSafely(text);
      if (!parsed) throw new Error('Model returned invalid JSON.');
      return parsed;
    }
    return text;
  }

  const client = getOpenAIClient();
  if (!client) throw new Error('Missing OpenAI API key. Set OPENAI_API_KEY in backend/.env.');

  const payload = {
    model: resolvedModel,
    input: userPrompt,
  };

  if (responseJsonSchema) {
    payload.text = {
      format: {
        type: 'json_schema',
        name: 'schema_response',
        schema: responseJsonSchema,
        strict: true,
      },
    };
  }

  const body = await client.responses.create(payload);

  if (responseJsonSchema) {
    const parsed = await parseModelJson(extractResponseOutputText(body));
    if (!parsed) throw new Error('Model returned invalid JSON.');
    return parsed;
  }
  return extractResponseOutputText(body);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildVideoPrompt({ prompt, title, scenes }) {
  const parts = [];
  if (title) parts.push(`Title: ${title}.`);
  if (prompt?.trim()) parts.push(`Concept: ${prompt.trim()}.`);
  if (Array.isArray(scenes) && scenes.length) {
    const beat = scenes
      .slice(0, 4)
      .map((s) => (s.visual_description || s.content || s.title || '').trim())
      .filter(Boolean)
      .join(' ');
    if (beat) parts.push(`Visual beats: ${beat}`);
  }
  const combined = parts.join(' ').replace(/\s+/g, ' ').trim();
  return combined.slice(0, 1000) || 'Cinematic short video, high production value, smooth camera motion.';
}

/**
 * Text-to-video via OpenAI Videos API (Sora models: sora-2, sora-2-pro, …).
 * @see https://platform.openai.com/docs/api-reference/videos
 * Saves MP4 under UPLOAD_DIR and returns a URL path served by Express static.
 */
async function generateVideoWithOpenAI({ prompt, aspectRatio = '16:9', durationSeconds = 8 }) {
  const apiKey = normalizeApiKey(process.env.OPENAI_API_KEY);
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY (required for OpenAI video generation).');

  const base = openAiVideoApiBase();
  const model = getOpenAIVideoModel();
  const size = openAiVideoSizeFromAspect(aspectRatio);
  const seconds = snapOpenAiVideoSeconds(durationSeconds);
  const textPrompt = String(prompt || '').trim();
  if (!textPrompt) throw new Error('Video prompt is required');

  const createRes = await fetch(`${base}/videos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt: textPrompt,
      seconds,
      size,
    }),
  });

  const created = await createRes.json();
  if (!createRes.ok) {
    const message = created?.error?.message || `OpenAI video create failed (${createRes.status})`;
    throw new Error(message);
  }

  const videoId = created?.id;
  if (!videoId) throw new Error('OpenAI video create returned no id.');

  const pollMs = Number(process.env.VIDEO_POLL_MS || 5000);
  const maxWaitMs = Number(process.env.VIDEO_MAX_WAIT_MS || 600000);
  const deadline = Date.now() + maxWaitMs;

  let job = created;
  while (job?.status === 'queued' || job?.status === 'in_progress') {
    if (Date.now() > deadline) {
      throw new Error('OpenAI video generation timed out. Increase VIDEO_MAX_WAIT_MS or try again.');
    }
    await sleep(pollMs);
    const pollRes = await fetch(`${base}/videos/${encodeURIComponent(videoId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    job = await pollRes.json();
    if (!pollRes.ok) {
      const message = job?.error?.message || `OpenAI video poll failed (${pollRes.status})`;
      throw new Error(message);
    }
  }

  if (job?.status === 'failed') {
    const msg = job?.error?.message || job?.error?.code || JSON.stringify(job?.error || {});
    throw new Error(`OpenAI video generation failed: ${msg}`);
  }

  if (job?.status !== 'completed') {
    throw new Error(`OpenAI video ended in unexpected status: ${job?.status || 'unknown'}`);
  }

  const contentRes = await fetch(`${base}/videos/${encodeURIComponent(videoId)}/content`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!contentRes.ok) {
    const errText = await contentRes.text();
    throw new Error(`OpenAI video download failed (${contentRes.status}): ${errText.slice(0, 200)}`);
  }

  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  const absoluteUploadDir = path.resolve(__dirname, '..', uploadDir);
  if (!fs.existsSync(absoluteUploadDir)) fs.mkdirSync(absoluteUploadDir, { recursive: true });

  const filename = `${uuidv4()}.mp4`;
  const filePath = path.join(absoluteUploadDir, filename);
  fs.writeFileSync(filePath, Buffer.from(await contentRes.arrayBuffer()));

  const publicUrl = `/uploads/${filename}`;
  return { provider: 'openai', model: job?.model || model, publicUrl, mimeType: 'video/mp4' };
}

function getStartupConfigSummary() {
  const provider = getAIProvider();
  const openaiKey = normalizeApiKey(process.env.OPENAI_API_KEY);
  const googleKey = getApiKeyForProvider('google');
  return {
    provider,
    hasOpenAIKey: Boolean(openaiKey),
    hasGoogleKey: Boolean(googleKey),
    keyHint: (provider === 'google' ? googleKey : openaiKey)
      ? `${(provider === 'google' ? googleKey : openaiKey).slice(0, 4)}... (${(provider === 'google' ? googleKey : openaiKey).length} chars)`
      : null,
    storyModel: getStoryModel(provider),
    imageModel: getOpenAIImageModel(),
    videoModel: getOpenAIVideoModel(),
  };
}

module.exports = {
  getAIProvider,
  getApiKeyForProvider,
  getStoryModel,
  getOpenAIImageModel,
  getOpenAIVideoModel,
  generateStructuredText,
  generateImageBase64,
  editImageBase64,
  generateVideoWithOpenAI,
  invokeLLM,
  getStartupConfigSummary,
  buildVideoPrompt,
  /** @deprecated use buildVideoPrompt */
  buildVeoPrompt: buildVideoPrompt,
};
