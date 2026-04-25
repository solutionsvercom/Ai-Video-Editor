"use client";

import React, { useState } from 'react';
import Link from "next/link";
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Video, Home, FolderOpen, Sparkles, Music, Settings, User, LogOut, Menu, X, Plus, ChevronDown, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';

export default function Layout({ children, currentPageName }) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => base44.auth.logout();
  const isOnboarding = currentPageName === 'Welcome';
  if (isOnboarding) return <>{children}</>;

  const navItems = [
    { name: 'Dashboard', icon: Home, page: 'Dashboard' },
    { name: 'Projects', icon: FolderOpen, page: 'Projects' },
    { name: 'Templates', icon: Sparkles, page: 'Templates' },
    { name: 'Image Generator', icon: Zap, page: 'ImageGenerator' },
    { name: 'Music Library', icon: Music, page: 'MusicLibrary' },
  ];

  const isActive = (page) => currentPageName === page;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <style>{`
        :root { --primary: 263.4 70% 50.4%; --primary-foreground: 210 40% 98%; }
        body { background: #0a0a0f; }
        .gradient-border { background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); }
        .glass-effect { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .glow-effect { box-shadow: 0 0 40px rgba(99,102,241,0.15); }
        .text-gradient { background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl gradient-border flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0f]" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight">AI Video Creator</h1>
                <p className="text-[10px] text-gray-500 -mt-0.5 tracking-widest uppercase">Pro Studio</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.page} href={createPageUrl(item.page)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.page) ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  <item.icon className="w-4 h-4" />{item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link href={createPageUrl('CreateProject')}>
                <Button className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0 shadow-lg shadow-purple-500/25">
                  <Plus className="w-4 h-4" />Create Video
                </Button>
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors">
                      <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                          {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#1a1a24] border-white/10 text-white">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-sm font-medium">{user.full_name || 'User'}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild className="hover:bg-white/5 cursor-pointer">
                      <Link href={createPageUrl('Settings')} className="flex items-center gap-2"><Settings className="w-4 h-4" />Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-white/5 cursor-pointer">
                      <Link href={createPageUrl('Account')} className="flex items-center gap-2"><User className="w-4 h-4" />Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={handleLogout} className="hover:bg-white/5 cursor-pointer text-red-400">
                      <LogOut className="w-4 h-4 mr-2" />Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => base44.auth.redirectToLogin()} variant="ghost" className="text-white hover:bg-white/10">Sign In</Button>
              )}

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 hover:bg-white/5 rounded-lg">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed top-16 left-0 right-0 z-40 glass-effect lg:hidden">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link key={item.page} href={createPageUrl(item.page)} onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(item.page) ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  <item.icon className="w-5 h-5" />{item.name}
                </Link>
              ))}
              <Link href={createPageUrl('CreateProject')} onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium">
                <Plus className="w-5 h-5" />Create New Video
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-16 min-h-screen">{children}</main>
    </div>
  );
}
