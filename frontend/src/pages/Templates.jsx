import React from 'react';
import { motion } from 'framer-motion';
import { Search, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Templates() {
  const templates = [
    { title: 'Social Media Promo', category: 'Marketing', uses: 1240, gradient: 'from-blue-500 to-cyan-400' },
    { title: 'YouTube Explainer', category: 'Education', uses: 856, gradient: 'from-purple-500 to-pink-400' },
    { title: 'Product Launch', category: 'Commercial', uses: 2310, gradient: 'from-orange-500 to-red-400' },
    { title: 'TikTok Trend', category: 'Social', uses: 4500, gradient: 'from-green-500 to-emerald-400' },
    { title: 'Podcast Highlight', category: 'Content', uses: 920, gradient: 'from-pink-500 to-rose-400' },
    { title: 'Real Estate Tour', category: 'Real Estate', uses: 340, gradient: 'from-indigo-500 to-blue-400' },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <style>{`.glass-effect { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }`}</style>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4 py-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Start With a Template
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gray-400 max-w-2xl mx-auto">
            Choose from professionally designed templates to jumpstart your video creation process.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-xl mx-auto relative mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input placeholder="Search templates..." className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14 rounded-2xl text-lg" />
          </motion.div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {['All', 'Marketing', 'Social', 'Education', 'Commercial'].map((category, i) => (
            <Button key={category} variant={i === 0 ? 'default' : 'outline'} className={i === 0 ? 'bg-purple-600 hover:bg-purple-500 rounded-full' : 'border-white/20 hover:bg-white/10 rounded-full'}>
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="group glass-effect rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
              <div className={`aspect-video w-full bg-gradient-to-br ${template.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-300">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{template.title}</h3>
                  <Badge className="bg-white/10 hover:bg-white/20 text-white border-0">{template.category}</Badge>
                </div>
                <p className="text-sm text-gray-400 mb-4">{template.uses.toLocaleString()} creators used this</p>
                <Link to={createPageUrl('CreateProject')}>
                  <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors">
                    Use Template
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
