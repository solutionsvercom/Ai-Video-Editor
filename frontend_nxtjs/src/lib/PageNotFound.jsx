import React from 'react';
import Link from "next/link";
import { Video } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
          <Video className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-gray-400 mb-8 text-lg">This page doesn't exist yet.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
          Go Home
        </Link>
      </div>
    </div>
  );
}
