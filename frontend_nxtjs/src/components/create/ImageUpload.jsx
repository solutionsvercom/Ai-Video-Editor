import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Plus, X } from 'lucide-react';

export default function ImageUpload({ images, onImagesChange }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      const newImages = files.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }));
      onImagesChange([...images, ...newImages]);
    }
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(images[index].preview);
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-effect rounded-2xl p-6">
        <label className="flex items-center gap-2 text-lg font-semibold mb-6"><ImageIcon className="w-5 h-5 text-orange-400" />Reference Images</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={image.preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => removeImage(index)} className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"><X className="w-4 h-4 text-white" /></button>
              </div>
            </div>
          ))}
          <div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-500/5 transition-all group">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><Plus className="w-6 h-6 text-orange-400" /></div>
            <span className="text-sm text-gray-400 font-medium">Add Image</span>
            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
