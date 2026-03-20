"use client";

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { User, Camera, Crown, CreditCard, Video, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Account() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', avatar_url: '' });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setFormData({ full_name: userData.full_name || '', avatar_url: userData.avatar_url || '' });
      } catch (e) {}
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe(formData);
      setUser(prev => ({ ...prev, ...formData }));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, avatar_url: file_url }));
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const subscription = { plan: 'Pro', status: 'active', nextBilling: '2025-02-15', videosUsed: 45, videosLimit: 100, storageUsed: 2.3, storageLimit: 10 };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <style>{`.glass-effect { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }`}</style>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-gray-400">Manage your profile and subscription</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-2xl p-6">
              <h2 className="font-semibold mb-6">Profile Information</h2>
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-2 border-white/10">
                    <AvatarImage src={formData.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl">
                      {formData.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{formData.full_name || 'User'}</h3>
                  <p className="text-gray-400">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black border-0"><Crown className="w-3 h-3 mr-1" />{subscription.plan}</Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-0">Active</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Full Name</Label>
                  <Input value={formData.full_name} onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))} placeholder="Enter your name" className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
                </div>
                <div>
                  <Label className="mb-2 block">Email Address</Label>
                  <Input value={user?.email || ''} disabled className="bg-white/5 border-white/10 text-gray-400" />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-effect rounded-2xl p-6">
              <h2 className="font-semibold mb-6">Usage This Month</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><Video className="w-4 h-4 text-purple-400" /><span>Videos Created</span></div>
                    <span className="text-sm text-gray-400">{subscription.videosUsed} / {subscription.videosLimit}</span>
                  </div>
                  <Progress value={(subscription.videosUsed / subscription.videosLimit) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /><span>Storage Used</span></div>
                    <span className="text-sm text-gray-400">{subscription.storageUsed} GB / {subscription.storageLimit} GB</span>
                  </div>
                  <Progress value={(subscription.storageUsed / subscription.storageLimit) * 100} className="h-2" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-effect rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Current Plan</h2>
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{subscription.plan}</span>
                  <Badge className="bg-green-500/20 text-green-400 border-0">Active</Badge>
                </div>
                <p className="text-gray-400 text-sm">Next billing on {new Date(subscription.nextBilling).toLocaleDateString()}</p>
              </div>
              <div className="space-y-2 text-sm">
                {['100 videos per month', '4K export quality', 'All premium templates', 'Priority support'].map(feat => (
                  <div key={feat} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /><span>{feat}</span></div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 border-white/20 hover:bg-white/10 text-white"><CreditCard className="w-4 h-4 mr-2" />Manage Billing</Button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-effect rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <Crown className="w-10 h-10 text-yellow-400 mb-4" />
                <h3 className="font-semibold mb-2">Upgrade to Team</h3>
                <p className="text-sm text-gray-400 mb-4">Get unlimited videos, custom branding, and team collaboration.</p>
                <Button className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0">Upgrade Now</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
