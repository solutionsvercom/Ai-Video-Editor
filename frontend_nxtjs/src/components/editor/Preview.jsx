import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Maximize, Volume2 } from 'lucide-react';

export default function Preview({ scene, isPlaying, onPlayPause }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden relative shadow-2xl ring-1 ring-white/10">
        <AnimatePresence mode="wait">
          <motion.div key={scene?.id || 'empty'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
            {scene?.imageUrl ? (
              <img src={scene.imageUrl} alt={scene.prompt} className={`w-full h-full object-cover origin-center ${isPlaying ? 'scale-110' : 'scale-100'} transition-transform duration-[10000ms] ease-linear`} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <p className="text-gray-500 font-medium">No Scene Selected</p>
              </div>
            )}
            {scene?.content && (
               <div className="absolute bottom-12 left-0 right-0 px-12 text-center z-10">
                  <span className="inline-block bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-xl text-lg md:text-xl font-medium shadow-lg max-w-2xl mx-auto transform translate-y-0 opacity-100 transition-all">
                     {scene.content}
                  </span>
               </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white z-20">
          <div className="flex items-center gap-4">
            <button className="hover:text-purple-400 transition-colors"><SkipBack className="w-5 h-5" /></button>
            <button onClick={onPlayPause} className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-colors shadow-lg">
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            <button className="hover:text-purple-400 transition-colors"><SkipForward className="w-5 h-5" /></button>
            <div className="flex items-center gap-2 ml-4">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"><div className="w-2/3 h-full bg-white rounded-full" /></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-gray-300">00:00 / 01:24</span>
            <button className="text-gray-400 hover:text-white transition-colors"><Maximize className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
