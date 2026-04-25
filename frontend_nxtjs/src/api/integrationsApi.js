import { apiRequest } from "./httpClient";
import { generateImage as generateImageViaOpenAI } from "./imagesApi";

/** @deprecated Prefer `generateImage` from `@/api/imagesApi` */
export async function generateImage(params) {
  return generateImageViaOpenAI(params);
}

export async function uploadFile({ file }) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest("/integrations/upload", { method: "POST", body: form, isFormData: true });
}
