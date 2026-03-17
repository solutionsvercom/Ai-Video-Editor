import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, Pause, Music, Clock, Heart, Plus, Volume2, Zap, Sparkles } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";

export default function MusicLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [playingTrack, setPlayingTrack] = useState(null);
  const [volume, setVolume] = useState(80);

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['music-tracks'],
    queryFn: () => base44.entities.MusicTrack.list()
  });

  const defaultTracks = [
    { id: '1', title: 'Upbeat Corporate', artist: 'AI Studio', mood: 'energetic', genre: 'corporate', duration: 150, bpm: 120, is_premium: false },
    { id: '2', title: 'Calm Piano Dreams', artist: 'Melody AI', mood: 'calm', genre: 'acoustic', duration: 195, bpm: 70, is_premium: false },
    { id: '3', title: 'Epic Cinematic Rise', artist: 'Soundscape', mood: 'dramatic', genre: 'cinematic', duration: 165, bpm: 90, is_premium: true },
    { id: '4', title: 'Happy Summer Vibes', artist: 'Sunny Beats', mood: 'playful', genre: 'pop', duration: 180, bpm: 110, is_premium: false },
    { id: '5', title: 'Inspiring Journey', artist: 'MotivateAI', mood: 'inspiring', genre: 'cinematic', duration: 200, bpm: 85, is_premium: false },
    { id: '6', title: 'Modern Tech Beat', artist: 'Digital Pulse', mood: 'energetic', genre: 'electronic', duration: 140, bpm: 128, is_premium: false },
    { id: '7', title: 'Emotional Strings', artist: 'Orchestra AI', mood: 'emotional', genre: 'cinematic', duration: 220, bpm: 65, is_premium: true },
    { id: '8', title: 'Lo-Fi Chill Study', artist: 'Chill Zone', mood: 'calm', genre: 'ambient', duration: 185, bpm: 75, is_premium: false },
    { id: '9', title: 'Corporate Success', artist: 'Business Audio', mood: 'inspiring', genre: 'corporate', duration: 155, bpm: 95, is_premium: false },
    { id: '10', title: 'Dance Floor Energy', artist: 'Club Mix', mood: 'energetic', genre: 'electronic', duration: 175, bpm: 130, is_premium: true },
    { id: '11', title: 'Acoustic Morning', artist: 'Guitar Dreams', mood: 'calm', genre: 'acoustic', duration: 190, bpm: 80, is_premium: false },
    { id: '12', title: 'Hip Hop Groove', artist: 'Beat Factory', mood: 'playful', genre: 'hip-hop', duration: 160, bpm: 95, is_premium: false }
  ];

  const allTracks = tracks.length > 0 ? tracks : defaultTracks;

  const moods = [
    { value: 'all', label: 'All Moods', color: 'from-gray-500 to-gray-600' },
    { value: 'energetic', label: 'Energetic', color: 'from-orange-500 to-red-500' },
    { value: 'calm', label: 'Calm', color: 'from-cyan-500 to-blue-500' },
    { value: 'inspiring', label: 'Inspiring', color: 'from-purple-500 to-pink-500' },
    { value: 'dramatic', label: 'Dramatic', color: 'from-violet-500 to-purple-600' },
    { value: 'playful', label: 'Playful', color: 'from-yellow-500 to-green-500' },
    { value: 'emotional', label: 'Emotional', color: 'from-rose-500 to-pink-500' }
  ];

  const genres = [
    { value: 'all', label: 'All Genres' }, { value: 'electronic', label: 'Electronic' },
    { value: 'acoustic', label: 'Acoustic' }, { value: 'cinematic', label: 'Cinematic' },
    { value: 'pop', label: 'Pop' }, { value: 'ambient', label: 'Ambient' },
    { value: 'hip-hop', label: 'Hip Hop' }, { value: 'corporate', label: 'Corporate' }
  ];

  const filteredTracks = allTracks.filter(track => {
    const matchesSearch = track.title?.toLowerCase().includes(searchQuery.toLowerCase()) || track.artist?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = moodFilter === 'all' || track.mood === moodFilter;
    const matchesGenre = genreFilter === 'all' || track.genre === genreFilter;
    return matchesSearch && matchesMood && matchesGenre;
  });

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMoodColor = (mood) => moods.find(m => m.value === mood)?.color || 'from-gray-500 to-gray-600';

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <style>{`.glass-effect { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }`}</style>
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4">
            <Music className="w-4 h-4 text-pink-400" /><span className="text-sm">Royalty-free music</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Music Library</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Find the perfect soundtrack for your video. All tracks are royalty-free.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-effect rounded-2xl p-6 mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input placeholder="Search tracks, artists..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14 text-lg" />
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-3">Filter by Mood</p>
            <div className="flex flex-wrap gap-2">
              {moods.map(mood => (
                <button key={mood.value} onClick={() => setMoodFilter(mood.value)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${moodFilter === mood.value ? `bg-gradient-to-r ${mood.color} text-white` : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}>
                  {mood.value !== 'all' && <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${mood.color}`} />}
                  {mood.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-3">Filter by Genre</p>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button key={genre.value} onClick={() => setGenreFilter(genre.value)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${genreFilter === genre.value ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}>
                  {genre.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-effect rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"><Sparkles className="w-6 h-6 text-white" /></div>
            <div>
              <h3 className="font-semibold">AI Music Suggestion</h3>
              <p className="text-sm text-gray-400">Let AI find the perfect track based on your video mood</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white border-0"><Zap className="w-4 h-4 mr-2" />Get Suggestions</Button>
        </motion.div>

        <div className="space-y-3">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="glass-effect rounded-xl p-4 flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-lg bg-white/5" />
                <div className="flex-1 space-y-2"><Skeleton className="h-5 w-48 bg-white/5" /><Skeleton className="h-4 w-32 bg-white/5" /></div>
                <Skeleton className="h-8 w-20 bg-white/5" />
              </div>
            ))
          ) : (
            <AnimatePresence>
              {filteredTracks.map((track, index) => (
                <motion.div key={track.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: index * 0.05 }}
                  className={`glass-effect rounded-xl p-4 flex items-center gap-4 group hover:border-white/20 transition-all ${playingTrack?.id === track.id ? 'border-purple-500/50 bg-purple-500/5' : ''}`}>
                  <button onClick={() => setPlayingTrack(playingTrack?.id === track.id ? null : track)} className={`w-14 h-14 rounded-lg bg-gradient-to-r ${getMoodColor(track.mood)} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    {playingTrack?.id === track.id ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{track.title}</h3>
                      {track.is_premium && <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black border-0 text-[10px]">PRO</Badge>}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
                    <Badge className={`bg-gradient-to-r ${getMoodColor(track.mood)} bg-opacity-20 border-0 capitalize`}>{track.mood}</Badge>
                    <span className="capitalize">{track.genre}</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{track.bpm} BPM</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(track.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"><Heart className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-white/10"><Plus className="w-4 h-4" /></Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {filteredTracks.length === 0 && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-2xl p-12 text-center">
            <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tracks found</h3>
            <p className="text-gray-400">Try adjusting your filters or search query</p>
          </motion.div>
        )}

        <AnimatePresence>
          {playingTrack && (
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-0 right-0 glass-effect border-t border-white/10 p-4 z-50">
              <div className="max-w-[1600px] mx-auto flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getMoodColor(playingTrack.mood)} flex items-center justify-center shrink-0`}><Music className="w-5 h-5 text-white" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{playingTrack.title}</p>
                  <p className="text-sm text-gray-400 truncate">{playingTrack.artist}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button onClick={() => setPlayingTrack(null)} variant="ghost" size="icon" className="hover:bg-white/10"><Pause className="w-5 h-5" /></Button>
                  <div className="hidden sm:flex items-center gap-2 w-32">
                    <Volume2 className="w-4 h-4 text-gray-400" />
                    <Slider value={[volume]} onValueChange={([val]) => setVolume(val)} max={100} className="w-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
