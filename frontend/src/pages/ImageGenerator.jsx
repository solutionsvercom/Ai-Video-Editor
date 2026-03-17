import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, Image as ImageIcon, Loader2, Wand2, Copy, Check, Trash2, Upload, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const examplePrompts = [
    "A futuristic cyberpunk cityscape at night with neon lights and flying vehicles",
    "Majestic mountain landscape at golden hour with a serene lake reflection",
    "Abstract digital art with vibrant geometric patterns and fluid shapes",
    "Professional portrait of a person in a modern minimalist office space",
    "Whimsical fantasy forest with glowing mushrooms and magical creatures"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: referenceImage ? [referenceImage] : undefined
      });
      setGeneratedImages([{ id: Date.now(), url: result.url, prompt, createdAt: new Date().toISOString() }, ...generatedImages]);
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setReferenceImage(result.file_url);
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDownload = async (imageUrl, index) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-generated-image-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleCopyPrompt = (promptText, index) => {
    navigator.clipboard.writeText(promptText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
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
            <div className="w-12 h-12 rounded-2xl gradient-border flex items-center justify-center"><Wand2 className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-4xl font-bold">AI Image Generator</h1>
              <p className="text-gray-400 text-sm mt-1">Create stunning images with AI in seconds</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-effect border-white/10 p-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Upload Reference Image (Optional)</label>
                {referenceImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/20 p-2">
                    <div className="flex items-center gap-3">
                      <img src={referenceImage} alt="Reference" className="w-24 h-24 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-300 mb-1">Reference image uploaded</p>
                        <p className="text-xs text-gray-500">AI will use this as inspiration</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => setReferenceImage(null)} className="text-gray-400 hover:text-white" disabled={loading}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-white/20 transition-colors bg-black/20">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadingImage ? (
                        <><Loader2 className="w-10 h-10 text-gray-400 mb-2 animate-spin" /><p className="text-sm text-gray-400">Uploading...</p></>
                      ) : (
                        <><Upload className="w-10 h-10 text-gray-400 mb-2" /><p className="text-sm text-gray-300">Click to upload an image</p><p className="text-xs text-gray-500 mt-1">Use for editing, style reference, or inspiration</p></>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={loading || uploadingImage} />
                  </label>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{referenceImage ? 'Describe what to change or how to modify' : 'Describe your image'}</label>
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={referenceImage ? "e.g., 'Change the background to a sunset beach'" : "Be detailed and creative... e.g., 'A serene Japanese garden with cherry blossoms at sunset'"} className="min-h-[120px] bg-black/20 border-white/10 text-white placeholder:text-gray-500 resize-none" disabled={loading} />
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-400 flex items-center gap-1"><Sparkles className="w-3 h-3" />Try these:</span>
                {examplePrompts.map((example, index) => (
                  <button key={index} onClick={() => setPrompt(example)} className="text-xs px-3 py-1.5 rounded-full glass-effect hover:bg-white/10 transition-colors text-gray-300 hover:text-white" disabled={loading}>
                    {example.substring(0, 40)}...
                  </button>
                ))}
              </div>
              <Button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0 h-12 text-base font-semibold shadow-lg shadow-purple-500/25">
                {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating... (this may take 5-10 seconds)</> : <><Wand2 className="w-5 h-5 mr-2" />Generate Image</>}
              </Button>
            </div>
          </Card>
        </motion.div>

        {generatedImages.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />Your Generated Images<span className="text-sm text-gray-500 font-normal">({generatedImages.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {generatedImages.map((image, index) => (
                  <motion.div key={image.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
                    <Card className="glass-effect border-white/10 overflow-hidden group">
                      <div className="relative aspect-square overflow-hidden bg-black/20">
                        <img src={image.url} alt={image.prompt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="secondary" className="bg-black/50 hover:bg-black/70 backdrop-blur-sm border-white/10 h-9 w-9" onClick={() => handleDownload(image.url, index)}><Download className="w-4 h-4" /></Button>
                          <Button size="icon" variant="secondary" className="bg-black/50 hover:bg-black/70 backdrop-blur-sm border-white/10 h-9 w-9" onClick={() => setGeneratedImages(generatedImages.filter(img => img.id !== image.id))}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm text-gray-300 line-clamp-2 flex-1">{image.prompt}</p>
                          <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={() => handleCopyPrompt(image.prompt, index)}>
                            {copiedIndex === index ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">{new Date(image.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {generatedImages.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-full glass-effect flex items-center justify-center mx-auto mb-4"><ImageIcon className="w-10 h-10 text-gray-400" /></div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">No images yet</h3>
            <p className="text-gray-500">Enter a detailed prompt above to generate your first AI image</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
