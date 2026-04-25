import React from 'react';
import { motion } from 'framer-motion';
import { Settings, MonitorPlay, Smartphone, Type, Layout } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function ProjectSettings({ settings, onSettingsChange }) {
  const handleChange = (key, value) => onSettingsChange({ ...settings, [key]: value });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6"><Settings className="w-5 h-5 text-gray-400" /><h3 className="font-semibold text-lg">Project Settings</h3></div>
      <div className="space-y-6">
        <div>
          <Label className="mb-3 block text-gray-300">Aspect Ratio</Label>
          <div className="grid grid-cols-3 gap-3">
             {[
               { value: '16:9', label: 'Landscape', icon: MonitorPlay, aspect: 'aspect-video' },
               { value: '9:16', label: 'Portrait', icon: Smartphone, aspect: 'aspect-[9/16]' },
               { value: '1:1', label: 'Square', icon: Layout, aspect: 'aspect-square' }
             ].map(ratio => (
               <button key={ratio.value} onClick={() => handleChange('aspectRatio', ratio.value)}
                 className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${settings.aspectRatio === ratio.value ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/30'}`}>
                 <ratio.icon className="w-6 h-6 text-gray-400" /><span className="text-sm font-medium">{ratio.label}</span><span className="text-xs text-gray-500">{ratio.value}</span>
               </button>
             ))}
          </div>
        </div>
        <div>
          <Label className="mb-3 block text-gray-300">Visual Style</Label>
          <Select value={settings.style} onValueChange={(v) => handleChange('style', v)}>
             <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select style" /></SelectTrigger>
             <SelectContent className="bg-[#1a1a24] border-white/10">
               <SelectItem value="realistic">Realistic</SelectItem><SelectItem value="cinematic">Cinematic</SelectItem>
               <SelectItem value="anime">Anime</SelectItem><SelectItem value="3d">3D Animation</SelectItem>
             </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
          <div><Label className="text-base text-gray-300 block mb-1">Add Captions</Label><p className="text-sm text-gray-500">Automatically generate text overlays</p></div>
          <Switch checked={settings.captions} onCheckedChange={(v) => handleChange('captions', v)} />
        </div>
      </div>
    </motion.div>
  );
}
