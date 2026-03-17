import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Upload, Play, Square, Volume2, Plus, FileAudio } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function VoiceInput({ audioFile, onAudioUpload }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const file = new File([new Blob(chunks, { type: 'audio/webm' })], 'recording.webm', { type: 'audio/webm' });
        onAudioUpload(file);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (e) { console.error('Error accessing microphone:', e); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-effect rounded-2xl p-6">
        <label className="flex items-center gap-2 text-lg font-semibold mb-6"><Mic className="w-5 h-5 text-purple-400" />Audio Source</label>
        {!audioFile ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-400 hover:bg-purple-500/5 transition-all group">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Upload className="w-8 h-8 text-purple-400" /></div>
              <p className="font-semibold mb-2">Upload Audio File</p><p className="text-sm text-gray-400 mb-4">MP3, WAV, M4A up to 50MB</p>
              <Button variant="outline" className="border-white/20 hover:bg-white/10" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}><Plus className="w-4 h-4 mr-2" />Select File</Button>
              <input type="file" accept="audio/*" className="hidden" ref={fileInputRef} onChange={(e) => { const file = e.target.files?.[0]; if (file) onAudioUpload(file); }} />
            </div>
            <div className={`border-2 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${isRecording ? 'border-red-500 bg-red-500/5' : 'border-white/10 bg-white/5'}`}>
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                {isRecording ? <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" /> : <Mic className="w-8 h-8 text-red-400" />}
              </div>
              <p className="font-semibold mb-2">{isRecording ? 'Recording...' : 'Record Voice Header'}</p>
              <p className="text-sm text-gray-400 mb-4 font-mono">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</p>
              <Button variant={isRecording ? 'destructive' : 'outline'} className={isRecording ? 'bg-red-500 hover:bg-red-600' : 'border-white/20 hover:bg-white/10'} onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? <><Square className="w-4 h-4 mr-2" />Stop Recording</> : <><Mic className="w-4 h-4 mr-2" />Start Recording</>}
              </Button>
            </div>
          </div>
        ) : (
          <div className="border border-white/20 bg-white/5 rounded-xl p-6 flex flex-col items-center justify-center text-center">
             <FileAudio className="w-12 h-12 text-purple-400 mb-4" />
             <p className="font-semibold">{audioFile.name || 'Recorded Audio'}</p>
             <p className="text-sm text-gray-400 mb-6">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
             <div className="flex gap-4">
               <Button variant="outline" className="border-white/20 hover:bg-white/10"><Play className="w-4 h-4 mr-2" />Play</Button>
               <Button variant="destructive" onClick={() => onAudioUpload(null)}>Remove</Button>
             </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
