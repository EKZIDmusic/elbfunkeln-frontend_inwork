import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { galleryService, GalleryImage } from '../services/galleryService';

const driftClasses = [
  'animate-gallery-drift-1',
  'animate-gallery-drift-2',
  'animate-gallery-drift-3',
];

const delayClasses = [
  '',
  'animate-delay-1',
  'animate-delay-2',
  'animate-delay-3',
  'animate-delay-4',
  'animate-delay-5',
  'animate-delay-6',
  'animate-delay-7',
  'animate-delay-8',
];

export function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    setImages(galleryService.getAll());
  }, []);

  // Close lightbox on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-elbfunkeln-beige pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="font-cormorant text-4xl md:text-5xl text-elbfunkeln-green mb-4">
              Galerie
            </h1>
            <p className="font-inter text-lg text-elbfunkeln-green/60">
              Bald findest du hier Einblicke in unsere Welt.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elbfunkeln-beige pt-28 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-cormorant text-4xl md:text-5xl text-elbfunkeln-green mb-4">
            Galerie
          </h1>
          <p className="font-inter text-lg text-elbfunkeln-green/60 max-w-xl mx-auto">
            Einblicke in unsere Welt — handgefertigter Schmuck, Momente und Inspiration.
          </p>
        </motion.div>

        {/* Masonry-like Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {images.map((image, index) => {
            const drift = driftClasses[index % driftClasses.length];
            const delay = delayClasses[index % delayClasses.length];

            return (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: Math.min(index * 0.08, 0.8) }}
                className={`break-inside-avoid ${drift} ${delay}`}
              >
                <div
                  className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-500"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.dataUrl}
                    alt={image.caption || 'Galeriebild'}
                    className="w-full block transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />

                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-elbfunkeln-green/0 group-hover:bg-elbfunkeln-green/10 transition-colors duration-500" />

                  {/* Caption */}
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="font-inter text-sm text-white">
                        {image.caption}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
            >
              <X size={28} />
            </button>

            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={selectedImage.dataUrl}
              alt={selectedImage.caption || 'Galeriebild'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {selectedImage.caption && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-8 text-white/80 font-inter text-sm"
              >
                {selectedImage.caption}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
