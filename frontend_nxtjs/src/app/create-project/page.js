"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import TypeSelector from '@/components/create/TypeSelector';
import TextPromptInput from '@/components/create/TextPromptInput';
import VoiceInput from '@/components/create/VoiceInput';
import ImageUpload from '@/components/create/ImageUpload';
import ProjectSettings from '@/components/create/ProjectSettings';

export default function CreateProject() {
  const [projectType, setProjectType] = useState('text-to-video');
  const [prompt, setPrompt] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [images, setImages] = useState([]);
  const [settings, setSettings] = useState({ aspectRatio: '16:9', style: 'realistic', captions: true });
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let audio_url = null;
      let image_urls = [];

      if (projectType === 'voice-to-video') {
        if (!audioFile) {
          toast.error('Please upload an audio file first');
          return;
        }
        const uploaded = await base44.integrations.Core.UploadFile({ file: audioFile });
        audio_url = uploaded.file_url;
      }

      if (projectType === 'image-to-video') {
        if (!images?.length) {
          toast.error('Please upload at least one image first');
          return;
        }
        const uploads = await Promise.all(images.map((file) => base44.integrations.Core.UploadFile({ file })));
        image_urls = uploads.map((u) => u.file_url);
      }

      const project = await base44.videos.generate({
        type: projectType,
        prompt,
        settings,
        audio_url,
        image_urls,
      });

      toast.success('Project created successfully!');
      router.push(createPageUrl(`Editor?id=${project.id}`));
    } catch (e) {
      toast.error('Failed to generate project');
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <style>{`.glass-effect { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }`}</style>
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
          <p className="text-gray-400">Choose a method and provide details to generate your video.</p>
        </motion.div>

        <TypeSelector selectedType={projectType} onSelect={setProjectType} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {projectType === 'text-to-video' && <TextPromptInput value={prompt} onChange={(e) => setPrompt(e.target.value)} />}
            {projectType === 'voice-to-video' && <VoiceInput audioFile={audioFile} onAudioUpload={setAudioFile} />}
            {projectType === 'image-to-video' && <ImageUpload images={images} onImagesChange={setImages} />}
          </div>
          <div className="space-y-6">
            <ProjectSettings settings={settings} onSettingsChange={setSettings} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full h-14 text-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0 shadow-lg shadow-purple-500/25">
                {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : <><Wand2 className="w-5 h-5 mr-2" /> Generate Video</>}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
