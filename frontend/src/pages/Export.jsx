import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, Copy, Check, Monitor, Smartphone, Square, Loader2, Youtube, Instagram, Music2, Link2, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function Export() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState(null);
  const [exportFormat, setExportFormat] = useState('mp4');
  const [quality, setQuality] = useState('1080p');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) setProjectId(id);
  }, []);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }),
    enabled: !!projectId,
    select: (data) => data?.[0]
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.update(projectId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', projectId] })
  });

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + Math.random() * 10;
      });
    }, 300);
    setTimeout(async () => {
      clearInterval(interval);
      setExportProgress(100);
      await updateMutation.mutateAsync({ exports: (project?.exports || 0) + 1, status: 'completed' });
      setTimeout(() => { setIsExporting(false); setExportComplete(true); }, 500);
    }, 4000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://aivideocreator.app/share/${projectId}`);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const formats = [
    { value: 'mp4', label: 'MP4', desc: 'Universal format' },
    { value: 'mov', label: 'MOV', desc: 'Apple devices' },
    { value: 'webm', label: 'WebM', desc: 'Web optimized' },
    { value: 'gif', label: 'GIF', desc: 'Animated image' }
  ];

  const qualities = [
    { value: '4k', label: '4K', desc: '3840x2160', premium: true },
    { value: '1080p', label: '1080p', desc: '1920x1080' },
    { value: '720p', label: '720p', desc: '1280x720' },
    { value: '480p', label: '480p', desc: '854x480' }
  ];

  const socialPlatforms = [
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-500' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400' },
    { id: 'tiktok', name: 'TikTok', icon: Music2, color: 'bg-black' }
  ];

  if (isLoading || !project) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <style>{`.glass-effect { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }`}</style>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate(createPageUrl(`Editor?id=${projectId}`))} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back to Editor
          </button>
          <h1 className="text-3xl font-bold mb-2">Export & Share</h1>
          <p className="text-gray-400">Download your video or share it directly to social media</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-2xl p-6">
              <div className="aspect-video bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-xl flex items-center justify-center mb-4">
                {project.thumbnail_url ? (
                  <img src={project.thumbnail_url} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="text-center"><Monitor className="w-12 h-12 text-gray-500 mx-auto mb-2" /><p className="text-gray-500">Preview</p></div>
                )}
              </div>
              <h3 className="font-semibold">{project.title}</h3>
              <p className="text-sm text-gray-400">{project.aspect_ratio} • {project.duration || 30}s • {project.type?.replace(/-/g, ' ')}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-effect rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Export Format</h3>
              <div className="grid grid-cols-2 gap-2">
                {formats.map(format => (
                  <button key={format.value} onClick={() => setExportFormat(format.value)} className={`p-3 rounded-xl border-2 transition-all ${exportFormat === format.value ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/30'}`}>
                    <p className="font-medium">{format.label}</p>
                    <p className="text-xs text-gray-500">{format.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-effect rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Video Quality</h3>
              <div className="grid grid-cols-2 gap-2">
                {qualities.map(q => (
                  <button key={q.value} onClick={() => setQuality(q.value)} className={`p-3 rounded-xl border-2 transition-all relative ${quality === q.value ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/30'}`}>
                    {q.premium && <span className="absolute top-2 right-2 text-[10px] bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-1.5 py-0.5 rounded-full font-medium">PRO</span>}
                    <p className="font-medium">{q.label}</p>
                    <p className="text-xs text-gray-500">{q.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-effect rounded-2xl p-6">
              {exportComplete ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-400" /></div>
                  <h3 className="text-xl font-semibold mb-2">Export Complete!</h3>
                  <p className="text-gray-400 mb-6">Your video is ready to download</p>
                  <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0 h-12 px-8"><Download className="w-5 h-5 mr-2" />Download Video</Button>
                </div>
              ) : isExporting ? (
                <div className="text-center py-6">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
                    <div className="absolute inset-0 flex items-center justify-center"><span className="text-lg font-bold">{Math.round(exportProgress)}%</span></div>
                  </div>
                  <h3 className="font-semibold mb-2">Exporting Video...</h3>
                  <p className="text-sm text-gray-400 mb-4">This may take a few moments</p>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              ) : (
                <>
                  <h3 className="font-semibold mb-4">Ready to Export</h3>
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Format</span><span className="uppercase">{exportFormat}</span></div>
                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Quality</span><span>{quality}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Est. Size</span><span>~45 MB</span></div>
                  </div>
                  <Button onClick={handleExport} className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0 h-12">
                    <Download className="w-5 h-5 mr-2" />Export Video
                  </Button>
                </>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-effect rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Link2 className="w-5 h-5" />Share Link</h3>
              <div className="flex gap-2">
                <Input value={`https://aivideocreator.app/share/${projectId}`} readOnly className="bg-white/5 border-white/10 text-white" />
                <Button onClick={handleCopyLink} variant="outline" className="border-white/20 hover:bg-white/10 shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-effect rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Share2 className="w-5 h-5" />Share to Social</h3>
              <div className="space-y-2">
                {socialPlatforms.map(platform => (
                  <button key={platform.id} className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center`}><platform.icon className="w-5 h-5 text-white" /></div>
                    <span className="font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-effect rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Mail className="w-5 h-5" />Send via Email</h3>
              <div className="flex gap-2">
                <Input placeholder="Enter email address..." className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
                <Button variant="outline" className="border-white/20 hover:bg-white/10 shrink-0">Send</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
