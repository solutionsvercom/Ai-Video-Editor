import React from 'react';
import { motion } from 'framer-motion';
import { Type, Mic, Image, CheckCircle2 } from 'lucide-react';

export default function TypeSelector({ selectedType, onSelect }) {
  const types = [
    { id: 'text-to-video', icon: Type, title: 'Text to Video', description: 'Describe your video idea and AI will generate scenes, visuals, and animations', gradient: 'from-blue-500 to-cyan-400', features: ['AI scene generation', 'Auto storyboarding', 'Smart transitions'] },
    { id: 'voice-to-video', icon: Mic, title: 'Voice to Video', description: 'Upload audio or record your voice, AI matches visuals to your narration', gradient: 'from-purple-500 to-pink-400', features: ['Voice sync', 'Auto captions', 'Pacing detection'] },
    { id: 'image-to-video', icon: Image, title: 'Image to Video', description: 'Upload images and AI animates them with motion, transitions, and effects', gradient: 'from-orange-500 to-red-400', features: ['Ken Burns effect', 'Parallax motion', 'Dynamic zoom'] }
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {types.map((type, index) => (
        <motion.div key={type.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
          <button onClick={() => onSelect(type.id)} className={`w-full text-left glass-effect rounded-2xl p-6 transition-all duration-300 relative overflow-hidden group ${selectedType === type.id ? 'border-2 border-white/30' : 'hover:border-white/20'}`}>
            {selectedType === type.id && <div className="absolute top-4 right-4"><CheckCircle2 className="w-6 h-6 text-green-400" /></div>}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${type.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <type.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{type.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{type.description}</p>
            <div className="space-y-2">
              {type.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${type.gradient}`} />{feature}
                </div>
              ))}
            </div>
          </button>
        </motion.div>
      ))}
    </div>
  );
}
