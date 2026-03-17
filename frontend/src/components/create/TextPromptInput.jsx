import React from 'react';
import { motion } from 'framer-motion';
import { Type, Wand2, Sparkles, BookOpen, PenTool } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";

export default function TextPromptInput({ value, onChange }) {
  const templates = [
    { title: 'Product Launch', prompt: 'A cinematic product reveal for a new smartwatch, featuring sleek macro shots and energetic text transitions.', icon: Box },
    { title: 'Educational', prompt: 'An explainer video about how photosynthesis works, using clear diagrams and friendly narration.', icon: BookOpen },
    { title: 'Social Media', prompt: 'A fast-paced TikTok style video highlighting top 3 travel destinations with punchy captions.', icon: Sparkles }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-effect rounded-2xl p-6">
        <label className="flex items-center gap-2 text-lg font-semibold mb-4"><Type className="w-5 h-5 text-blue-400" />Video Description</label>
        <Textarea value={value} onChange={onChange} placeholder="Describe the video you want to create in detail..." className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl resize-none focus:border-blue-500 focus:ring-blue-500/20" />
        <div className="flex justify-between items-center mt-3 text-sm text-gray-400">
          <span>Be descriptive for better results</span>
          <span className={`${value.length > 500 ? 'text-red-400' : ''}`}>{value.length} / 500 characters</span>
        </div>
      </div>
    </motion.div>
  );
}

const Box = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
