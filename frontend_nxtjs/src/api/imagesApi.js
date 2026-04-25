import { apiRequest } from "./httpClient";

/**
 * Text-to-image or image-to-image via backend OpenAI Image API (`images.generate` / `images.edit`).
 * @param {object} opts
 * @param {string} opts.prompt
 * @param {string} [opts.size] — e.g. auto, 1024x1024, 1536x1024, 1024x1536 (GPT Image)
 * @param {string} [opts.quality] — auto | high | medium | low (GPT Image); standard | hd (dall-e-3)
 * @param {string} [opts.output_format] — png | jpeg | webp (GPT Image only)
 * @param {string} [opts.aspect_ratio] — used when size omitted (1:1, 16:9, 9:16)
 * @param {string[]} [opts.existing_image_urls] — URLs from this app’s upload API (all used for edit; GPT Image up to 16)
 * @param {string} [opts.reference_image_url] — single reference URL (same as upload `file_url`)
 * @param {string} [opts.input_fidelity] — high | low (GPT Image edit; how closely to match the reference)
 */
export async function generateImage(opts) {
  return apiRequest("/images/generate", {
    method: "POST",
    body: {
      prompt: opts.prompt,
      size: opts.size,
      quality: opts.quality,
      output_format: opts.output_format,
      aspect_ratio: opts.aspect_ratio,
      existing_image_urls: opts.existing_image_urls,
      reference_image_url: opts.reference_image_url,
      input_fidelity: opts.input_fidelity,
    },
  });
}
