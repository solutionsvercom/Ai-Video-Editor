const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { generateImageBase64, editImageBase64, getOpenAIImageModel } = require('../lib/aiClient');

const GPT_IMAGE_SIZES = new Set(['auto', '1024x1024', '1536x1024', '1024x1536']);
const DALLE3_SIZES = new Set(['1024x1024', '1792x1024', '1024x1792']);
const DALLE2_SIZES = new Set(['256x256', '512x512', '1024x1024']);
const GPT_OUTPUT_FORMATS = new Set(['png', 'jpeg', 'webp']);

const MIN_PROMPT_LEN = 3;
const MAX_PROMPT_LEN_GPT = 32000;
const MAX_PROMPT_LEN_DALLE3 = 4000;
const MAX_PROMPT_LEN_DALLE2 = 1000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetriableError(err) {
  const status = err?.status;
  if (status === 429 || status === 503) return true;
  const msg = String(err?.message || '').toLowerCase();
  return /rate limit|timeout|temporarily unavailable|econnreset|socket hang up|503|429/.test(msg);
}

function modelFamily(model) {
  const m = String(model || '').toLowerCase();
  if (m === 'dall-e-3') return 'dalle3';
  if (m === 'dall-e-2') return 'dalle2';
  return 'gpt';
}

/**
 * Map a public `/uploads/<file>` URL (any host) to a trusted on-disk path under UPLOAD_DIR.
 * Prevents SSRF by only accepting basename paths under our uploads folder.
 */
function resolveTrustedUploadFilePath(fileUrlOrPath) {
  const raw = String(fileUrlOrPath || '').trim();
  if (!raw) return null;
  let pathname;
  try {
    if (/^https?:\/\//i.test(raw)) pathname = new URL(raw).pathname;
    else pathname = raw.startsWith('/') ? raw : `/${raw}`;
  } catch {
    return null;
  }
  const m = pathname.match(/^\/uploads\/([^/]+)$/);
  if (!m) return null;
  const basename = m[1];
  if (!basename || basename.includes('..') || basename.includes('/') || basename.includes('\\')) return null;

  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  const base = path.resolve(__dirname, '..', uploadDir);
  const candidate = path.resolve(base, basename);
  const rel = path.relative(base, candidate);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) return null;
  return candidate;
}

function collectReferenceCandidates(body) {
  const out = [];
  const arr = body?.existing_image_urls;
  if (Array.isArray(arr)) {
    for (const u of arr) {
      if (u != null && String(u).trim()) out.push(String(u).trim());
    }
  }
  const single = body?.reference_image_url;
  if (single != null && String(single).trim()) out.push(String(single).trim());
  return out;
}

function maxReferenceImagesForConfiguredModel(model) {
  return modelFamily(model) === 'gpt' ? 16 : 1;
}

/** Resolve every trusted upload path from `reference_image_url` + `existing_image_urls` (deduped, order preserved). */
function resolveAllReferenceUploadPaths(body) {
  const seenPath = new Set();
  const seenUrl = new Set();
  const paths = [];
  for (const url of collectReferenceCandidates(body)) {
    const key = String(url).trim();
    if (!key || seenUrl.has(key)) continue;
    seenUrl.add(key);
    const p = resolveTrustedUploadFilePath(key);
    if (!p || seenPath.has(p)) continue;
    seenPath.add(p);
    paths.push(p);
  }
  return paths;
}

function validateAndNormalizeRequest(body, defaultModel) {
  const prompt = String(body?.prompt ?? '').trim();
  if (prompt.length < MIN_PROMPT_LEN) {
    throw new Error(`Prompt must be at least ${MIN_PROMPT_LEN} characters.`);
  }
  const fam = modelFamily(defaultModel);
  const maxLen =
    fam === 'gpt' ? MAX_PROMPT_LEN_GPT : fam === 'dalle3' ? MAX_PROMPT_LEN_DALLE3 : MAX_PROMPT_LEN_DALLE2;
  if (prompt.length > maxLen) {
    throw new Error(`Prompt exceeds maximum length (${maxLen} characters) for the configured model.`);
  }

  let size = body?.size != null ? String(body.size).trim() : null;
  if (size === '') size = null;
  if (size && fam === 'gpt' && !GPT_IMAGE_SIZES.has(size)) {
    throw new Error(`Invalid size for GPT Image models. Allowed: ${[...GPT_IMAGE_SIZES].join(', ')}.`);
  }
  if (size && fam === 'dalle3' && !DALLE3_SIZES.has(size)) {
    throw new Error(`Invalid size for dall-e-3. Allowed: ${[...DALLE3_SIZES].join(', ')}.`);
  }
  if (size && fam === 'dalle2' && !DALLE2_SIZES.has(size)) {
    throw new Error(`Invalid size for dall-e-2. Allowed: ${[...DALLE2_SIZES].join(', ')}.`);
  }

  const aspectRatio = body?.aspect_ratio != null ? String(body.aspect_ratio).trim() : '1:1';

  let quality = body?.quality != null ? String(body.quality).trim().toLowerCase() : null;
  if (quality && fam === 'gpt') {
    const allowed = new Set(['auto', 'high', 'medium', 'low', 'standard', 'hd']);
    if (!allowed.has(quality)) {
      throw new Error('Invalid quality. For GPT Image use: auto, high, medium, or low.');
    }
  }
  if (quality && fam === 'dalle3') {
    const q = quality;
    if (q === 'high') quality = 'hd';
    else if (['low', 'medium', 'auto'].includes(q)) quality = 'standard';
    const allowed = new Set(['standard', 'hd']);
    if (!allowed.has(quality)) {
      throw new Error('Invalid quality for dall-e-3. Use standard or hd.');
    }
  }

  let output_format = body?.output_format != null ? String(body.output_format).trim().toLowerCase() : null;
  if (output_format === 'jpg') output_format = 'jpeg';
  if (output_format) {
    if (fam !== 'gpt') {
      throw new Error('output_format is only supported for GPT Image models (use response_format on older flows).');
    }
    if (!GPT_OUTPUT_FORMATS.has(output_format)) {
      throw new Error(`Invalid output_format. Allowed: ${[...GPT_OUTPUT_FORMATS].join(', ')}.`);
    }
  }

  let input_fidelity = body?.input_fidelity != null ? String(body.input_fidelity).trim().toLowerCase() : null;
  if (input_fidelity && !['high', 'low'].includes(input_fidelity)) {
    throw new Error('input_fidelity must be high or low.');
  }
  if (input_fidelity && fam !== 'gpt') {
    throw new Error('input_fidelity is only supported for GPT Image models.');
  }

  return {
    prompt,
    size: size || undefined,
    aspectRatio: aspectRatio || '1:1',
    quality: quality || undefined,
    output_format: output_format || undefined,
    input_fidelity: input_fidelity || undefined,
  };
}

async function withRetry(fn, { maxAttempts = 3, baseDelayMs = 1200 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetriableError(err) || attempt === maxAttempts - 1) throw err;
      await sleep(baseDelayMs * (attempt + 1));
    }
  }
  throw lastErr;
}

/**
 * Generates an image via OpenAI Image API, persists bytes under UPLOAD_DIR, returns a public URL path.
 * @param {object} body - Request body (prompt, optional size, quality, output_format, aspect_ratio)
 * @param {string} [modelOverride] - optional model from env is default via aiClient
 */
async function generateAndPersistImage(body) {
  const model = getOpenAIImageModel();
  const normalized = validateAndNormalizeRequest(body, model);
  const refCandidates = collectReferenceCandidates(body);
  const maxRef = maxReferenceImagesForConfiguredModel(model);
  if (refCandidates.length > maxRef) {
    throw new Error(`Too many reference images (max ${maxRef} for model ${model}).`);
  }

  const refPaths = resolveAllReferenceUploadPaths(body);
  const hasRefRequest = refCandidates.length > 0;

  if (hasRefRequest && refPaths.length === 0) {
    throw new Error(
      'Could not use the reference image(s). Upload via this app first, then generate (only /uploads files from this server are accepted).'
    );
  }

  const image = await withRetry(() =>
    refPaths.length
      ? editImageBase64({
          prompt: normalized.prompt,
          imageFilePaths: refPaths,
          aspectRatio: normalized.aspectRatio,
          size: normalized.size,
          quality: normalized.quality,
          output_format: normalized.output_format,
          input_fidelity: normalized.input_fidelity,
        })
      : generateImageBase64({
          prompt: normalized.prompt,
          aspectRatio: normalized.aspectRatio,
          size: normalized.size,
          quality: normalized.quality,
          output_format: normalized.output_format,
        })
  );

  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  const absoluteUploadDir = path.resolve(__dirname, '..', uploadDir);
  if (!fs.existsSync(absoluteUploadDir)) fs.mkdirSync(absoluteUploadDir, { recursive: true });

  const ext =
    image.mime === 'image/jpeg' ? 'jpg' : image.mime === 'image/webp' ? 'webp' : image.mime === 'image/png' ? 'png' : 'png';
  const filename = `${uuidv4()}.${ext}`;
  const filePath = path.join(absoluteUploadDir, filename);
  fs.writeFileSync(filePath, Buffer.from(image.base64, 'base64'));

  return {
    url: `/uploads/${filename}`,
    mimeType: image.mime,
    model: image.model,
    size: image.sizeUsed,
    provider: image.provider,
    mode: refPaths.length ? 'edit' : 'generate',
    referenceCount: refPaths.length,
  };
}

module.exports = {
  generateAndPersistImage,
  validateAndNormalizeRequest,
  MIN_PROMPT_LEN,
  MAX_PROMPT_LEN_GPT,
};
