import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ icon: Icon, label, value, trend, gradient, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="glass-effect rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity`} />
      <div className="relative">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold">{value}</span>
          {trend && <span className={`text-sm font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'} mb-1`}>{trend > 0 ? '+' : ''}{trend}%</span>}
        </div>
      </div>
    </motion.div>
  );
}
