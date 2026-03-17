import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Wand2, Video, Sparkles, ArrowRight } from 'lucide-react';

export default function Welcome() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0f] text-white overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-white/10 mb-6" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Next-gen AI Video Creation</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-6 tracking-tight">
            Create Stunning Videos<br />With AI
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Transform text, voice, and images into professional videos in minutes. No editing experience required.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={createPageUrl('Dashboard')}>
            <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0 rounded-xl w-full sm:w-auto shadow-lg shadow-purple-500/25 transition-all hover:scale-105">
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to={createPageUrl('Templates')}>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 hover:bg-white/10 text-white rounded-xl w-full sm:w-auto transition-all bg-black/20 backdrop-blur-sm">
              Browse Templates
            </Button>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="grid md:grid-cols-3 gap-6 mt-20 text-left">
          {[
            { icon: Wand2, title: 'Text to Video', desc: 'Describe your idea and let AI generate the scenes.' },
            { icon: Video, title: 'Image to Video', desc: 'Bring your static images to life with cinematic motion.' },
            { icon: Sparkles, title: 'Voice to Video', desc: 'Sync your voiceover with perfectly matched visuals.' }
          ].map((feature, i) => (
             <div key={i} className="p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-colors group" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
