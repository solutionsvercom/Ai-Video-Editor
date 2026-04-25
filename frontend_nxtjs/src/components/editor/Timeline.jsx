import React from 'react';
import { motion, Reorder } from 'framer-motion';
import { GripVertical, Clock, Image, Type, Volume2, Plus } from 'lucide-react';

export default function Timeline({ scenes, activeSceneId, onSceneSelect, onScenesReorder }) {
  const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0);

  return (
    <div className="h-64 glass-effect border-t border-white/10 flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-semibold text-lg">Timeline</h3>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white">Split</button>
            <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white text-red-400">Delete</button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto p-4 relative">
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-500 z-10" />
        <Reorder.Group axis="x" values={scenes} onReorder={onScenesReorder} className="flex gap-2 min-w-max h-full">
          {scenes.map((scene) => (
            <Reorder.Item key={scene.id} value={scene} className={`relative flex-shrink-0 w-48 h-full rounded-xl overflow-hidden cursor-pointer border-2 transition-colors ${activeSceneId === scene.id ? 'border-purple-500' : 'border-white/10 opacity-70 hover:opacity-100'}`} onClick={() => onSceneSelect(scene.id)}>
              {scene.imageUrl ? (
                <img src={scene.imageUrl} alt={scene.prompt} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex flex-col items-center justify-center p-4 text-center">
                  <Image className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-300 line-clamp-2">{scene.prompt}</p>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm flex justify-between items-center z-20">
                <span className="text-xs font-mono">{scene.duration}s</span>
                <span className="text-xs text-gray-400">{(scene.content.length / 10).toFixed(1)}K</span>
              </div>
              <div className="absolute top-2 left-2 cursor-grab active:cursor-grabbing p-1 bg-black/40 rounded-md Z-20" onPointerDown={e => e.preventDefault()}>
                <GripVertical className="w-4 h-4 text-white/70" />
              </div>
            </Reorder.Item>
          ))}
          <div className="w-24 h-full border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
        </Reorder.Group>
      </div>
      <div className="h-8 bg-black/40 border-t border-white/10 flex">
        <div className="w-48 px-4 flex items-center border-r border-white/10 text-xs text-gray-400 gap-2"><Volume2 className="w-3 h-3" />Audio Track</div>
        <div className="flex-1 relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNC0iIGhlaWdodD0iMTAwJSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')]">
           <div className="h-full bg-purple-500/30 rounded-full mx-4 my-1 relative border border-purple-500/50">
             <div className="absolute inset-y-0 left-1/4 right-1/3 bg-purple-500/50 rounded-full border-x-2 border-purple-400" />
           </div>
        </div>
      </div>
    </div>
  );
}
