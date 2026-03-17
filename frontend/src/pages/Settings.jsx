import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Bell, Palette, Globe, Shield, Download, Moon, Sun, Monitor, Save, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: { email: true, push: true, marketing: false },
    appearance: { theme: 'dark', language: 'en' },
    export: { defaultQuality: '1080p', defaultFormat: 'mp4', autoSave: true }
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.settings) setSettings(prev => ({ ...prev, ...userData.settings }));
      } catch (e) {}
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ settings });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <style>{`.glass-effect { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }`}</style>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences and settings</p>
        </motion.div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-effect rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><Bell className="w-5 h-5 text-blue-400" /></div>
              <div><h2 className="font-semibold">Notifications</h2><p className="text-sm text-gray-400">Manage how you receive updates</p></div>
            </div>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                { key: 'push', label: 'Push Notifications', desc: 'Get notified in your browser' },
                { key: 'marketing', label: 'Marketing Updates', desc: 'Tips, tutorials, and product news' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div><p className="font-medium">{item.label}</p><p className="text-sm text-gray-400">{item.desc}</p></div>
                  <Switch checked={settings.notifications[item.key]} onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [item.key]: checked } }))} />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-effect rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center"><Palette className="w-5 h-5 text-purple-400" /></div>
              <div><h2 className="font-semibold">Appearance</h2><p className="text-sm text-gray-400">Customize your workspace</p></div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5">
                <Label className="mb-3 block">Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ value: 'dark', label: 'Dark', icon: Moon }, { value: 'light', label: 'Light', icon: Sun }, { value: 'system', label: 'System', icon: Monitor }].map(theme => (
                    <button key={theme.value} onClick={() => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, theme: theme.value } }))}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${settings.appearance.theme === theme.value ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/30'}`}>
                      <theme.icon className="w-5 h-5" /><span className="text-sm">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <Label className="mb-3 block">Language</Label>
                <Select value={settings.appearance.language} onValueChange={(value) => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, language: value } }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><Globe className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                    <SelectItem value="en">English</SelectItem><SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem><SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem><SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-effect rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center"><Download className="w-5 h-5 text-green-400" /></div>
              <div><h2 className="font-semibold">Export Defaults</h2><p className="text-sm text-gray-400">Set your preferred export settings</p></div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5">
                <Label className="mb-3 block">Default Quality</Label>
                <Select value={settings.export.defaultQuality} onValueChange={(value) => setSettings(prev => ({ ...prev, export: { ...prev.export, defaultQuality: value } }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                    <SelectItem value="4k">4K (3840x2160)</SelectItem><SelectItem value="1080p">1080p (1920x1080)</SelectItem>
                    <SelectItem value="720p">720p (1280x720)</SelectItem><SelectItem value="480p">480p (854x480)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <Label className="mb-3 block">Default Format</Label>
                <Select value={settings.export.defaultFormat} onValueChange={(value) => setSettings(prev => ({ ...prev, export: { ...prev.export, defaultFormat: value } }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                    <SelectItem value="mp4">MP4</SelectItem><SelectItem value="mov">MOV</SelectItem>
                    <SelectItem value="webm">WebM</SelectItem><SelectItem value="gif">GIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div><p className="font-medium">Auto-save Projects</p><p className="text-sm text-gray-400">Automatically save your work</p></div>
                <Switch checked={settings.export.autoSave} onCheckedChange={(checked) => setSettings(prev => ({ ...prev, export: { ...prev.export, autoSave: checked } }))} />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0 h-12 px-8">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
