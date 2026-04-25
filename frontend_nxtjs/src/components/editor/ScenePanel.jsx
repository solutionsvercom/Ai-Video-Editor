import React from 'react';
import { motion } from 'framer-motion';
import { Image, Type, Settings2, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ScenePanel({ scene, onUpdate }) {
  if (!scene) return null;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-96 glass-effect border-l border-white/10 flex flex-col h-full bg-[#0a0a0f]/80">
      <div className="p-4 border-b border-white/10"><h3 className="font-semibold text-lg">Edit Scene {scene.id}</h3></div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
           <label className="flex items-center gap-2 text-sm font-medium mb-3 text-gray-300"><Image className="w-4 h-4 text-purple-400" />Visual Prompt</label>
           <Textarea value={scene.prompt} onChange={(e) => onUpdate({ prompt: e.target.value })} className="min-h-[120px] bg-white/5 border-white/10 text-white resize-none" placeholder="Describe what should appear in this scene..." />
           <Button variant="outline" className="w-full mt-3 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"><RefreshCw className="w-4 h-4 mr-2" />Regenerate Visual</Button>
        </div>
        <div>
           <label className="flex items-center gap-2 text-sm font-medium mb-3 text-gray-300"><Type className="w-4 h-4 text-blue-400" />Narration / Text</label>
           <Textarea value={scene.content} onChange={(e) => onUpdate({ content: e.target.value })} className="min-h-[120px] bg-white/5 border-white/10 text-white resize-none" placeholder="Enter narration or on-screen text..." />
        </div>
        <div>
           <label className="flex items-center gap-2 text-sm font-medium mb-3 text-gray-300"><Settings2 className="w-4 h-4 text-green-400" />Scene Settings</label>
           <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex justify-between items-center">
                 <span className="text-sm text-gray-400">Duration</span>
                 <div className="flex items-center gap-2 bg-black/40 rounded-lg px-2 py-1">
                   <input type="number" value={scene.duration} onChange={(e) => onUpdate({ duration: Number(e.target.value) })} className="w-12 bg-transparent text-right outline-none text-white text-sm" min="1" max="60" />
                   <span className="text-sm text-gray-500">s</span>
                 </div>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-sm text-gray-400">Transition</span>
                 <select className="bg-black/40 text-sm text-white rounded-lg px-2 py-1 border-none outline-none">
                   <option>Fade</option><option>Cut</option><option>Dissolve</option><option>Slide</option>
                 </select>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-sm text-gray-400">Motion</span>
                 <select className="bg-black/40 text-sm text-white rounded-lg px-2 py-1 border-none outline-none">
                   <option>Zoom In</option><option>Pan Left</option><option>Pan Right</option><option>Static</option>
                 </select>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
