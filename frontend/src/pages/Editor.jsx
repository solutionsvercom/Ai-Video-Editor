import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Download, Share2, Undo, Redo, Settings, Wand2, Music, Type, Image, Sparkles, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Timeline from '../components/editor/Timeline';
import ScenePanel from '../components/editor/ScenePanel';
import Preview from '../components/editor/Preview';

export default function Editor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('scenes');

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

  useEffect(() => {
    if (project?.scenes?.length > 0) {
      setScenes(project.scenes);
    } else if (project) {
      setScenes([
        { id: '1', type: 'scene', content: 'Opening scene', duration: 5, transition: 'fade' },
        { id: '2', type: 'scene', content: 'Main content', duration: 10, transition: 'slide' },
        { id: '3', type: 'scene', content: 'Closing scene', duration: 5, transition: 'fade' }
      ]);
    }
  }, [project]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const totalDuration = scenes.reduce((acc, s) => acc + (s.duration || 5), 0);
          if (prev >= totalDuration) { setIsPlaying(false); return 0; }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, scenes]);

  useEffect(() => {
    let accumulatedTime = 0;
    for (let i = 0; i < scenes.length; i++) {
      accumulatedTime += scenes[i].duration || 5;
      if (currentTime < accumulatedTime) { setSelectedSceneIndex(i); break; }
    }
  }, [currentTime, scenes]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.update(projectId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', projectId] })
  });

  const handleSave = async () => {
    setIsSaving(true);
    await updateMutation.mutateAsync({ scenes, status: 'completed' });
    setIsSaving(false);
  };

  const handleSceneChange = (updatedScene) => {
    setScenes(prev => prev.map(s => s.id === updatedScene.id ? updatedScene : s));
  };

  const handleExport = () => {
    navigate(createPageUrl(`Export?id=${projectId}`));
  };

  if (isLoading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <style>{`.glass-effect { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }`}</style>

      <div className="glass-effect border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(createPageUrl('Projects'))} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold">{project.title}</h1>
              <p className="text-xs text-gray-500 capitalize">{project.type?.replace(/-/g, ' ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-white/10"><Undo className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="hover:bg-white/10"><Redo className="w-4 h-4" /></Button>
            <div className="w-px h-6 bg-white/10 mx-2" />
            <Button onClick={handleSave} disabled={isSaving} variant="outline" className="border-white/20 hover:bg-white/10 text-white">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
            <Button onClick={handleExport} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0">
              <Download className="w-4 h-4 mr-2" />Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-80 border-r border-white/10 p-4 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-white/5 mb-4">
              <TabsTrigger value="scenes" className="flex-1 data-[state=active]:bg-white/10"><Sparkles className="w-4 h-4 mr-2" />Scenes</TabsTrigger>
              <TabsTrigger value="style" className="flex-1 data-[state=active]:bg-white/10"><Type className="w-4 h-4 mr-2" />Style</TabsTrigger>
              <TabsTrigger value="music" className="flex-1 data-[state=active]:bg-white/10"><Music className="w-4 h-4 mr-2" />Music</TabsTrigger>
            </TabsList>

            <TabsContent value="scenes" className="mt-0">
              <ScenePanel scene={scenes[selectedSceneIndex]} onSceneChange={handleSceneChange} />
            </TabsContent>

            <TabsContent value="style" className="mt-0">
              <div className="glass-effect rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold">Text Styling</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Bold', 'Modern', 'Elegant', 'Playful'].map(style => (
                    <button key={style} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm">{style}</button>
                  ))}
                </div>
                <h3 className="font-semibold pt-4">Color Theme</h3>
                <div className="flex gap-2">
                  {['#6366f1', '#a855f7', '#ec4899', '#f97316', '#22c55e', '#06b6d4'].map(color => (
                    <button key={color} className="w-8 h-8 rounded-full border-2 border-white/20 hover:border-white/50 transition-colors" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="music" className="mt-0">
              <div className="glass-effect rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold">Background Music</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Upbeat Corporate', mood: 'energetic', duration: '2:30' },
                    { name: 'Calm Piano', mood: 'calm', duration: '3:15' },
                    { name: 'Epic Cinematic', mood: 'dramatic', duration: '2:45' },
                    { name: 'Happy Acoustic', mood: 'playful', duration: '2:00' }
                  ].map(track => (
                    <button key={track.name} className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{track.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{track.mood}</p>
                      </div>
                      <span className="text-xs text-gray-400">{track.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <Preview project={project} scenes={scenes} currentSceneIndex={selectedSceneIndex} isPlaying={isPlaying} onPlayPause={() => setIsPlaying(!isPlaying)} aspectRatio={project.aspect_ratio} />
          </div>
          <div className="mt-4">
            <Timeline scenes={scenes} onScenesChange={setScenes} currentTime={currentTime} onTimeChange={setCurrentTime} isPlaying={isPlaying} onPlayPause={() => setIsPlaying(!isPlaying)} />
          </div>
        </div>

        <div className="w-80 border-l border-white/10 p-4 overflow-y-auto">
          <div className="glass-effect rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Let AI help you enhance your video with smart suggestions.</p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/10 text-white"><Sparkles className="w-4 h-4 mr-2 text-purple-400" />Improve pacing</Button>
              <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/10 text-white"><Type className="w-4 h-4 mr-2 text-blue-400" />Generate captions</Button>
              <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/10 text-white"><Music className="w-4 h-4 mr-2 text-pink-400" />Suggest music</Button>
              <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/10 text-white"><Image className="w-4 h-4 mr-2 text-orange-400" />Enhance visuals</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
