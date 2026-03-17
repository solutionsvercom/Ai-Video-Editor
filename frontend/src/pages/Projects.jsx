import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProjectCard from '@/components/dashboard/ProjectCard';

export default function Projects() {
  const mockProjects = Array.from({ length: 8 }).map((_, i) => ({
    id: i.toString(),
    title: `Project ${i + 1}`,
    status: i % 3 === 0 ? 'processing' : 'completed',
    type: ['text-to-video', 'voice-to-video', 'image-to-video'][i % 3],
    duration: 60 + i * 15,
    views: i * 100,
    created_date: new Date().toISOString()
  }));

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <style>{`.glass-effect { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }`}</style>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-bold mb-2">My Projects</h1>
            <p className="text-gray-400">Manage and organize all your video projects.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Link to={createPageUrl('CreateProject')}>
              <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0 shadow-lg shadow-purple-500/25">
                <Plus className="w-4 h-4 mr-2" /> New Project
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search projects..." className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl" />
          </div>
          <Button variant="outline" className="h-12 border-white/20 hover:bg-white/10 text-white rounded-xl">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mockProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} delay={i * 0.05} />
          ))}
        </div>
      </div>
    </div>
  );
}
