"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Download,
  Image as ImageIcon,
  Loader2,
  Wand2,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateImage } from "@/api/imagesApi";
import { uploadFile } from "@/api/integrationsApi";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GPT_SIZES = new Set(["auto", "1024x1024", "1536x1024", "1024x1536"]);
/** Matches GPT Image `images.edit` multi-image limit in our backend */
const MAX_REFERENCE_IMAGES = 16;

const RECENT_PROMPTS_KEY = "aivideo_recent_image_prompts";
const MAX_RECENT = 10;

function loadRecentPrompts() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_PROMPTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function saveRecentPrompts(prompts) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECENT_PROMPTS_KEY, JSON.stringify(prompts.slice(0, MAX_RECENT)));
  } catch {
    /* ignore */
  }
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [formSize, setFormSize] = useState("auto");
  const [formAspect, setFormAspect] = useState("1:1");
  const [formQuality, setFormQuality] = useState("auto");
  const [formFormat, setFormFormat] = useState("png");
  const [formInputFidelity, setFormInputFidelity] = useState("high");
  const [referenceImageUrls, setReferenceImageUrls] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedPromptField, setCopiedPromptField] = useState(false);
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [serverImageModel, setServerImageModel] = useState(null);

  useEffect(() => {
    setRecentPrompts(loadRecentPrompts());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.openaiImageModel) setServerImageModel(data.openaiImageModel);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const examplePrompts = [
    "A luxury modern villa in the mountains at sunset, cinematic wide shot, ultra-detailed architecture",
    "A futuristic cyberpunk cityscape at night with neon lights and subtle rain reflections",
    "Editorial fashion portrait, soft studio lighting, neutral background, 85mm lens look",
    "Whimsical fantasy forest with glowing mushrooms and fireflies, painterly style",
    "Minimalist product hero shot of wireless earbuds on matte concrete, soft gradient backdrop",
  ];

  const pushRecent = useCallback((text) => {
    const t = String(text || "").trim();
    if (t.length < 3) return;
    setRecentPrompts((prev) => {
      const next = [t, ...prev.filter((p) => p !== t)].slice(0, MAX_RECENT);
      saveRecentPrompts(next);
      return next;
    });
  }, []);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []).filter(Boolean);
    if (!files.length) return;
    const remaining = MAX_REFERENCE_IMAGES - referenceImageUrls.length;
    if (remaining <= 0) {
      setError(`You can add at most ${MAX_REFERENCE_IMAGES} reference images (GPT Image models).`);
      event.target.value = "";
      return;
    }
    const slice = files.slice(0, remaining);
    if (files.length > remaining) {
      setError(`Only the first ${remaining} file(s) were added (max ${MAX_REFERENCE_IMAGES} references).`);
    } else {
      setError(null);
    }
    setUploadingImage(true);
    try {
      const results = await Promise.all(slice.map((file) => uploadFile({ file })));
      const urls = results.map((r) => r.file_url).filter(Boolean);
      setReferenceImageUrls((prev) => {
        const next = [...prev];
        for (const u of urls) {
          if (!next.includes(u)) next.push(u);
        }
        return next.slice(0, MAX_REFERENCE_IMAGES);
      });
    } catch (err) {
      console.error("Failed to upload image:", err);
      setError(err?.message || "Failed to upload reference image(s).");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const removeReferenceAt = (index) => {
    setReferenceImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllReferences = () => setReferenceImageUrls([]);

  const runGenerate = async ({
    prompt: p,
    size = formSize,
    quality = formQuality,
    output_format = formFormat,
    aspect_ratio = formAspect,
    reference_image_urls: referenceUrlsOverride,
    input_fidelity = formInputFidelity,
  }) => {
    const trimmed = String(p || "").trim();
    if (trimmed.length < 3) {
      setError("Enter a prompt with at least 3 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const useAuto = !size || size === "auto";
      const refList =
        Array.isArray(referenceUrlsOverride) && referenceUrlsOverride.length
          ? referenceUrlsOverride.map((u) => String(u).trim()).filter(Boolean)
          : referenceImageUrls.filter(Boolean);
      const result = await generateImage({
        prompt: trimmed,
        size: useAuto ? undefined : size,
        quality,
        output_format: output_format === "png" ? undefined : output_format,
        aspect_ratio: useAuto ? aspect_ratio : undefined,
        existing_image_urls: refList.length ? refList : undefined,
        input_fidelity: refList.length ? input_fidelity : undefined,
      });
      const entry = {
        id: Date.now(),
        url: result.url,
        prompt: trimmed,
        size: result.size,
        quality,
        output_format,
        aspectRatio: useAuto ? aspect_ratio : undefined,
        referenceImageUrls: refList.length ? [...refList] : undefined,
        input_fidelity: refList.length ? input_fidelity : undefined,
        mode: result.mode || (refList.length ? "edit" : "generate"),
        referenceCount: result.referenceCount,
        createdAt: new Date().toISOString(),
      };
      setGeneratedImages((prev) => [entry, ...prev]);
      pushRecent(trimmed);
    } catch (err) {
      const msg =
        err?.status === 401
          ? "Please sign in again (session expired)."
          : err?.message || "Image generation failed. Try again in a moment.";
      setError(msg);
      console.error("Failed to generate image:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => runGenerate({ prompt });

  const handleRegenerate = (image) => {
    setPrompt(image.prompt);
    const s = image.size ? String(image.size) : "";
    if (s && GPT_SIZES.has(s)) setFormSize(s);
    else if (s) setFormSize("auto");
    if (image.quality) setFormQuality(image.quality);
    if (image.output_format) setFormFormat(image.output_format);
    if (image.aspectRatio) setFormAspect(image.aspectRatio);
    if (Array.isArray(image.referenceImageUrls) && image.referenceImageUrls.length) {
      setReferenceImageUrls([...image.referenceImageUrls]);
    } else if (image.referenceImageUrl) {
      setReferenceImageUrls([image.referenceImageUrl]);
    } else {
      setReferenceImageUrls([]);
    }
    if (image.input_fidelity) setFormInputFidelity(image.input_fidelity);
    const regenRefs =
      Array.isArray(image.referenceImageUrls) && image.referenceImageUrls.length
        ? [...image.referenceImageUrls]
        : image.referenceImageUrl
          ? [image.referenceImageUrl]
          : [];
    runGenerate({
      prompt: image.prompt,
      size: image.size && GPT_SIZES.has(String(image.size)) ? String(image.size) : "auto",
      quality: image.quality || formQuality,
      output_format: image.output_format || formFormat,
      aspect_ratio: image.aspectRatio || formAspect,
      reference_image_urls: regenRefs.length ? regenRefs : undefined,
      input_fidelity: image.input_fidelity || formInputFidelity,
    });
  };

  const handleDownload = async (imageUrl, index) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-generated-image-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Download failed:", e);
      setError("Could not download this image. Open it in a new tab and save manually.");
    }
  };

  const handleCopyPrompt = (promptText, index) => {
    navigator.clipboard.writeText(promptText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyCurrentPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptField(true);
    setTimeout(() => setCopiedPromptField(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <style>{`
        .gradient-border { background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); }
        .glass-effect { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .text-gradient { background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glow-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="glow-orb w-96 h-96 bg-purple-600 -top-48 right-0" />
        <div className="glow-orb w-64 h-64 bg-pink-600 bottom-0 left-1/4" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl gradient-border flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">AI Image Generator</h1>
              <p className="text-gray-400 text-sm mt-1">
                Text-to-image and optional reference-based edits via OpenAI Image API (key stays on the server)
              </p>
              {serverImageModel && (
                <p className="text-xs text-gray-500 mt-2 font-mono">
                  Active model: <span className="text-gray-400">{serverImageModel}</span>
                  <span className="text-gray-600"> — set in backend </span>
                  <span className="text-gray-500">OPENAI_IMAGE_MODEL</span>
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-effect border-white/10 p-6 mb-8">
            <div className="space-y-4">
              {error && (
                <div
                  className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Reference images (optional, up to {MAX_REFERENCE_IMAGES})
                </label>
                {referenceImageUrls.length > 0 ? (
                  <div className="rounded-lg border border-white/10 bg-black/20 p-3 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {referenceImageUrls.map((url, idx) => (
                        <div key={`${url}-${idx}`} className="relative group shrink-0">
                          <img
                            src={url}
                            alt={`Reference ${idx + 1}`}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-white/10"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-black/70 border border-white/20 p-0 opacity-90 hover:opacity-100"
                            onClick={() => removeReferenceAt(idx)}
                            disabled={loading || uploadingImage}
                            aria-label={`Remove reference ${idx + 1}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-xs text-gray-500">
                        {referenceImageUrls.length} / {MAX_REFERENCE_IMAGES} — sent together to OpenAI{" "}
                        <span className="text-gray-400">images.edit</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-white/15 bg-white/5 text-xs text-gray-300 hover:bg-white/10 cursor-pointer transition-colors">
                          Add more
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleFileUpload}
                            disabled={loading || uploadingImage || referenceImageUrls.length >= MAX_REFERENCE_IMAGES}
                          />
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white h-8"
                          onClick={clearAllReferences}
                          disabled={loading || uploadingImage}
                        >
                          Clear all
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full min-h-[8rem] border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-white/20 transition-colors bg-black/20">
                    <div className="flex flex-col items-center justify-center py-6 px-4">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-10 h-10 text-gray-400 mb-2 animate-spin" />
                          <p className="text-sm text-gray-400">Uploading…</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-300 text-center">Click to upload one or more images</p>
                          <p className="text-xs text-gray-500 mt-1 text-center max-w-md">
                            Hold Ctrl/Cmd to select multiple. GPT Image models accept up to {MAX_REFERENCE_IMAGES}{" "}
                            references; DALL·E uses one.
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      disabled={loading || uploadingImage}
                    />
                  </label>
                )}
              </div>

              {referenceImageUrls.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-2 block">
                    Match reference (GPT Image edit)
                  </label>
                  <Select value={formInputFidelity} onValueChange={setFormInputFidelity} disabled={loading}>
                    <SelectTrigger className="bg-black/20 border-white/10 max-w-xs">
                      <SelectValue placeholder="Input fidelity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High — closer to reference</SelectItem>
                      <SelectItem value="low">Low — more freedom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${formSize === "auto" ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
              >
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-2 block">Size</label>
                  <Select value={formSize} onValueChange={setFormSize} disabled={loading}>
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="1024x1024">1024 × 1024</SelectItem>
                      <SelectItem value="1536x1024">1536 × 1024 (landscape)</SelectItem>
                      <SelectItem value="1024x1536">1024 × 1536 (portrait)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formSize === "auto" && (
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-2 block">Aspect (with auto size)</label>
                    <Select value={formAspect} onValueChange={setFormAspect} disabled={loading}>
                      <SelectTrigger className="bg-black/20 border-white/10">
                        <SelectValue placeholder="Aspect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">1:1 square</SelectItem>
                        <SelectItem value="16:9">16:9 landscape</SelectItem>
                        <SelectItem value="9:16">9:16 portrait</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-2 block">Quality</label>
                  <Select value={formQuality} onValueChange={setFormQuality} disabled={loading}>
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue placeholder="Quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-2 block">Output format</label>
                  <Select value={formFormat} onValueChange={setFormFormat} disabled={loading}>
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Prompt</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-gray-400 hover:text-white"
                    onClick={handleCopyCurrentPrompt}
                    disabled={!prompt.trim() || loading}
                  >
                    {copiedPromptField ? (
                      <>
                        <Check className="w-4 h-4 mr-1 text-green-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy prompt
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    referenceImageUrls.length > 0
                      ? "Describe what to change, combine, or the style you want across your reference images…"
                      : "Describe your image in detail — subject, lighting, style, composition…"
                  }
                  className="min-h-[120px] bg-black/20 border-white/10 text-white placeholder:text-gray-500 resize-none"
                  disabled={loading}
                />
              </div>

              <div>
                <span className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3" />
                  Suggestions
                </span>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPrompt(example)}
                      className="text-left text-xs px-3 py-2 rounded-lg glass-effect hover:bg-white/10 transition-colors text-gray-300 hover:text-white max-w-full sm:max-w-[320px] line-clamp-2"
                      disabled={loading}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {recentPrompts.length > 0 && (
                <div>
                  <span className="text-xs text-gray-400 block mb-2">Recent prompts</span>
                  <div className="flex flex-wrap gap-2">
                    {recentPrompts.map((rp, i) => (
                      <button
                        key={`${rp}-${i}`}
                        type="button"
                        onClick={() => setPrompt(rp)}
                        className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-black/20 hover:bg-white/10 text-gray-300 max-w-[280px] truncate"
                        disabled={loading}
                        title={rp}
                      >
                        {rp.length > 48 ? `${rp.slice(0, 48)}…` : rp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={loading || prompt.trim().length < 3}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0 h-12 text-base font-semibold shadow-lg shadow-purple-500/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate image
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {generatedImages.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Your images
              <span className="text-sm text-gray-500 font-normal">({generatedImages.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {generatedImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="glass-effect border-white/10 overflow-hidden group">
                      <div className="relative aspect-square overflow-hidden bg-black/20">
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="bg-black/50 hover:bg-black/70 backdrop-blur-sm border-white/10 h-9 w-9"
                            onClick={() => handleDownload(image.url, index)}
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="bg-black/50 hover:bg-black/70 backdrop-blur-sm border-white/10 h-9 w-9"
                            onClick={() => handleRegenerate(image)}
                            disabled={loading}
                            title="Regenerate"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="bg-black/50 hover:bg-black/70 backdrop-blur-sm border-white/10 h-9 w-9"
                            onClick={() => setGeneratedImages((prev) => prev.filter((img) => img.id !== image.id))}
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm text-gray-300 line-clamp-3 flex-1">{image.prompt}</p>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => handleCopyPrompt(image.prompt, index)}
                          >
                            {copiedIndex === index ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(image.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {image.size ? ` · ${image.size}` : ""}
                          {image.mode === "edit" ? " · edit" : ""}
                          {image.referenceImageUrls?.length
                            ? ` · ${image.referenceImageUrls.length} ref`
                            : image.referenceCount
                              ? ` · ${image.referenceCount} ref`
                              : ""}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {generatedImages.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full glass-effect flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">No images yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter a detailed prompt, optionally upload a reference image for edits, then generate. The OpenAI
              official SDK runs on the server; results are saved under /uploads for preview and download.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
