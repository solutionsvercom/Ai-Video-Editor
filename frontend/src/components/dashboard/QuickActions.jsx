import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import { Type, Mic, Image, ArrowRight } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    { id: 'text-to-video', icon: Type, title: 'Text to Video', description: 'Create from a prompt', gradient: 'from-blue-500 to-cyan-400', bgGradient: 'from-blue-500/10 to-cyan-400/10' },
    { id: 'voice-to-video', icon: Mic, title: 'Voice to Video', description: 'Upload or record audio', gradient: 'from-purple-500 to-pink-400', bgGradient: 'from-purple-500/10 to-pink-400/10' },
    { id: 'image-to-video', icon: Image, title: 'Image to Video', description: 'Animate your photos', gradient: 'from-orange-500 to-red-400', bgGradient: 'from-orange-500/10 to-red-400/10' }
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <motion.div key={action.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.1 }}>
          <Link to={createPageUrl(`CreateProject?type=${action.id}`)}>
            <div className="glass-effect rounded-2xl p-6 h-full hover:border-white/20 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${action.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{action.description}</p>
                <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                  Start creating<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
