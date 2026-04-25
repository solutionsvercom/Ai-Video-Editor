import React from 'react';
import Link from "next/link";
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Play, MoreVertical, Clock, Eye, Download, Trash2, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function ProjectCard({ project, onDelete, delay = 0 }) {
  const typeColors = {
    'text-to-video': 'from-blue-500 to-cyan-400',
    'voice-to-video': 'from-purple-500 to-pink-400',
    'image-to-video': 'from-orange-500 to-red-400'
  };
  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-400',
    processing: 'bg-yellow-500/20 text-yellow-400',
    completed: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400'
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="group glass-effect rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
      <div className="aspect-video relative overflow-hidden">
        {project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${typeColors[project.type] || 'from-indigo-500 to-purple-500'} opacity-50`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {project.status === 'completed' && (
          <Link href={createPageUrl(`Editor?id=${project.id}`)} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </Link>
        )}
        <div className="absolute top-3 left-3">
          <Badge className={`${statusColors[project.status]} border-0`}>
            {project.status === 'processing' && <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2 animate-pulse" />}
            {project.status}
          </Badge>
        </div>
        {project.duration && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs bg-black/50 backdrop-blur-md px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />{Math.floor(project.duration / 60)}:{(project.duration % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold truncate">{project.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-white/10"><MoreVertical className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/10 text-white">
              <DropdownMenuItem asChild className="hover:bg-white/5 cursor-pointer">
                <Link href={createPageUrl(`Editor?id=${project.id}`)}><Edit className="w-4 h-4 mr-2" />Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-white/5 cursor-pointer"><Download className="w-4 h-4 mr-2" />Export</DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); onDelete?.(project.id); }} className="hover:bg-white/5 cursor-pointer text-red-400">
                <Trash2 className="w-4 h-4 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{project.description || project.prompt || 'No description'}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{project.created_date ? format(new Date(project.created_date), 'MMM d, yyyy') : 'Just now'}</span>
          <div className="flex items-center gap-3">
            {project.views > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{project.views}</span>}
            <span className="capitalize text-gray-400">{project.aspect_ratio || '16:9'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
