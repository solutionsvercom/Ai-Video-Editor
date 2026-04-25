"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Video, HardDrive, Clock, TrendingUp, Plus } from 'lucide-react';
import Link from "next/link";
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/dashboard/StatsCard';
import ProjectCard from '@/components/dashboard/ProjectCard';
import QuickActions from '@/components/dashboard/QuickActions';

export default function Dashboard() {
  const mockProjects = [
    { id: '1', title: 'Product Demo', status: 'completed', type: 'text-to-video', duration: 120, views: 245, created_date: new Date().toISOString() },
    { id: '2', title: 'Social Media Ad', status: 'processing', type: 'image-to-video', created_date: new Date().toISOString() },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <style>{`.glass-effect { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }`}</style>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-bold mb-2">Welcome Back! 👋</h1>
            <p className="text-gray-400">Here's what's happening with your projects.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Link href={createPageUrl('CreateProject')}>
              <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0 h-11 px-6 shadow-lg shadow-purple-500/25">
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={Video} label="Total Videos" value="42" trend={12} gradient="from-blue-500 to-cyan-400" delay={0.1} />
          <StatsCard icon={Clock} label="Minutes Generated" value="128" trend={8} gradient="from-purple-500 to-pink-400" delay={0.2} />
          <StatsCard icon={HardDrive} label="Storage Used" value="14.2 GB" gradient="from-orange-500 to-red-400" delay={0.3} />
          <StatsCard icon={TrendingUp} label="Total Views" value="12.5k" trend={24} gradient="from-green-500 to-emerald-400" delay={0.4} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <QuickActions />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Link href={createPageUrl('Projects')} className="text-sm text-purple-400 hover:text-purple-300 transition-colors">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockProjects.map((project, i) => (
              <ProjectCard key={project.id} project={project} delay={0.1 * i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
