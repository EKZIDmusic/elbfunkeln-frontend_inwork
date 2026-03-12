import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { galleryService, GalleryPost } from '../services/galleryService';

// Floating animation config per position in row (0-3)
// Each image gets different duration & delay to create a wave from left to right
const floatConfigs = [
  { duration: 5, delay: 0, y: 8 },
  { duration: 5.5, delay: 0.6, y: 10 },
  { duration: 6, delay: 1.2, y: 7 },
  { duration: 5.8, delay: 1.8, y: 9 },
];

export function GalleryPage() {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [activeTag, setActiveTag] = useState<string>('');

  useEffect(() => {
    setPosts(galleryService.getPublic());
  }, []);

  const topTags = useMemo(() => {
    const tagCount = new Map<string, number>();
    posts.forEach(p => p.tags.forEach(t => tagCount.set(t, (tagCount.get(t) || 0) + 1)));
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [posts]);

  const filteredPosts = activeTag
    ? posts.filter(p => p.tags.includes(activeTag))
    : posts;

  const selectedPost = selectedPostIndex !== null ? filteredPosts[selectedPostIndex] : null;
  const selectedImages = selectedPost ? (selectedPost.images.length > 0 ? selectedPost.images : [selectedPost.imageUrl]) : [];

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedPostIndex === null || !selectedPost) return;
      if (e.key === 'Escape') { setSelectedPostIndex(null); setLightboxImageIndex(0); }
      if (e.key === 'ArrowRight') {
        if (lightboxImageIndex < selectedImages.length - 1) {
          setLightboxImageIndex(prev => prev + 1);
        } else if (selectedPostIndex < filteredPosts.length - 1) {
          setSelectedPostIndex(prev => prev !== null ? prev + 1 : prev);
          setLightboxImageIndex(0);
        }
      }
      if (e.key === 'ArrowLeft') {
        if (lightboxImageIndex > 0) {
          setLightboxImageIndex(prev => prev - 1);
        } else if (selectedPostIndex > 0) {
          setSelectedPostIndex(prev => prev !== null ? prev - 1 : prev);
          setLightboxImageIndex(0);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedPostIndex, lightboxImageIndex, selectedImages.length, filteredPosts.length]);

  const openLightbox = (postIndex: number) => {
    setSelectedPostIndex(postIndex);
    setLightboxImageIndex(0);
  };

  const closeLightbox = () => {
    setSelectedPostIndex(null);
    setLightboxImageIndex(0);
  };

  const goToPrevPost = () => {
    if (selectedPostIndex !== null && selectedPostIndex > 0) {
      setSelectedPostIndex(selectedPostIndex - 1);
      setLightboxImageIndex(0);
    }
  };

  const goToNextPost = () => {
    if (selectedPostIndex !== null && selectedPostIndex < filteredPosts.length - 1) {
      setSelectedPostIndex(selectedPostIndex + 1);
      setLightboxImageIndex(0);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-elbfunkeln-beige pt-28 pb-16">
        <div className="container mx-auto px-4 text-center pt-20">
          <h1 className="font-cormorant text-4xl md:text-5xl text-elbfunkeln-green mb-4">Galerie</h1>
          <p className="font-inter text-lg text-elbfunkeln-green/60">Bald findest du hier Einblicke in unsere Welt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elbfunkeln-beige pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="font-cormorant text-4xl md:text-5xl text-elbfunkeln-green mb-2">
            Galerie
          </h1>
          <p className="font-inter text-sm text-elbfunkeln-green/50 max-w-md mx-auto">
            Einblicke in unsere Welt — Handwerk, Momente und Inspiration.
          </p>
        </motion.div>

        {/* Tag filter — elegant inline style */}
        {topTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-1.5 mb-12"
          >
            <button
              type="button"
              onClick={() => setActiveTag('')}
              className={`px-4 py-1.5 rounded-full font-inter text-[11px] font-medium tracking-wider uppercase transition-all duration-300 ${
                !activeTag
                  ? 'bg-elbfunkeln-green text-white shadow-sm'
                  : 'text-elbfunkeln-green/50 hover:text-elbfunkeln-green/80'
              }`}
            >
              Alle
            </button>
            {topTags.map(tag => (
              <button
                type="button"
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
                className={`px-4 py-1.5 rounded-full font-inter text-[11px] font-medium tracking-wider uppercase transition-all duration-300 ${
                  activeTag === tag
                    ? 'bg-elbfunkeln-green text-white shadow-sm'
                    : 'text-elbfunkeln-green/50 hover:text-elbfunkeln-green/80'
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}

        {/* 4-column grid with floating wave animation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {filteredPosts.map((post, index) => {
            const colInRow = index % 4;
            const fc = floatConfigs[colInRow];

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: colInRow * 0.08 }}
                animate={{
                  y: [0, -fc.y, 0],
                }}
                // @ts-ignore - motion supports this
                style={{ animationDelay: `${fc.delay}s` }}
                className="cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                {/* Outer wrapper with perpetual float */}
                <motion.div
                  animate={{ y: [0, -fc.y, 0] }}
                  transition={{
                    duration: fc.duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: fc.delay,
                  }}
                >
                  {/* Glass card */}
                  <div className="overflow-hidden rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm hover:shadow-xl hover:bg-white/50 transition-all duration-500">
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />

                      {/* Multi-image indicator */}
                      {post.images.length > 1 && (
                        <div className="absolute top-2.5 right-2.5 bg-black/25 backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-0.5">
                          {post.images.slice(0, 4).map((_, i) => (
                            <Circle key={i} size={4} fill="white" className="text-white/80" />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Title — always visible */}
                    <div className="px-3 py-2.5">
                      <h3 className="font-cormorant text-base md:text-lg text-elbfunkeln-green leading-tight truncate">
                        {post.title}
                      </h3>
                      {post.images.length > 1 && (
                        <p className="font-inter text-[10px] text-elbfunkeln-green/35 mt-0.5">
                          {post.images.length} Bilder
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty filter */}
        {filteredPosts.length === 0 && activeTag && (
          <div className="text-center py-20">
            <p className="font-inter text-elbfunkeln-green/40">
              Keine Beiträge mit dem Tag &bdquo;{activeTag}&ldquo; gefunden.
            </p>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════ */}
      {/*  LIGHTBOX                                */}
      {/* ════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedPost && selectedPostIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Blurred background */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" />

            {/* Close button — glass */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all"
              title="Schließen"
            >
              <X size={18} />
            </button>

            {/* Prev/Next post nav */}
            {selectedPostIndex > 0 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goToPrevPost(); }}
                className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 text-white/50 hover:text-white hover:bg-white/20 transition-all"
                title="Vorheriger Beitrag"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            {selectedPostIndex < filteredPosts.length - 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goToNextPost(); }}
                className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 text-white/50 hover:text-white hover:bg-white/20 transition-all"
                title="Nächster Beitrag"
              >
                <ChevronRight size={22} />
              </button>
            )}

            {/* Content area */}
            <div
              className="relative z-20 w-full max-w-3xl mx-4 md:mx-8 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Main image */}
              <motion.div
                key={`${selectedPost.id}-${lightboxImageIndex}`}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative w-full"
              >
                <img
                  src={selectedImages[lightboxImageIndex]}
                  alt={selectedPost.title}
                  className="w-full max-h-[50vh] object-contain rounded-2xl"
                />

                {/* Image nav arrows (within post images) */}
                {selectedImages.length > 1 && (
                  <>
                    {lightboxImageIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => setLightboxImageIndex(prev => prev - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 text-white/70 hover:bg-white/30 transition-all"
                        title="Vorheriges Bild"
                      >
                        <ChevronLeft size={18} />
                      </button>
                    )}
                    {lightboxImageIndex < selectedImages.length - 1 && (
                      <button
                        type="button"
                        onClick={() => setLightboxImageIndex(prev => prev + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 text-white/70 hover:bg-white/30 transition-all"
                        title="Nächstes Bild"
                      >
                        <ChevronRight size={18} />
                      </button>
                    )}
                  </>
                )}
              </motion.div>

              {/* Image dots (if multi-image) */}
              {selectedImages.length > 1 && (
                <div className="flex items-center gap-2 mt-3">
                  {selectedImages.map((_, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setLightboxImageIndex(i)}
                      title={`Bild ${i + 1}`}
                      className={`rounded-full transition-all duration-300 ${
                        i === lightboxImageIndex
                          ? 'w-6 h-2 bg-white'
                          : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Glass info panel */}
              <motion.div
                key={`info-${selectedPost.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                className="w-full mt-4 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/15 p-5 md:p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="font-cormorant text-2xl md:text-3xl text-white leading-tight">
                    {selectedPost.title}
                  </h2>
                  <span className="font-inter text-[11px] text-white/25 whitespace-nowrap mt-2 shrink-0">
                    {formatDate(selectedPost.createdAt)}
                  </span>
                </div>

                {selectedPost.description && (
                  <p className="font-inter text-sm text-white/50 leading-relaxed mb-4 max-w-2xl">
                    {selectedPost.description}
                  </p>
                )}

                {/* Tags & Materials */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedPost.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-[11px] font-inter bg-white/8 text-white/50 border border-white/10">
                      {tag}
                    </span>
                  ))}
                  {selectedPost.materials.map(mat => (
                    <span key={mat} className="px-3 py-1 rounded-full text-[11px] font-inter bg-white/5 text-white/35 border border-white/8 italic">
                      {mat}
                    </span>
                  ))}
                </div>

                {/* Counter */}
                <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between">
                  <span className="font-inter text-[11px] text-white/20">
                    {selectedPostIndex + 1} / {filteredPosts.length}
                  </span>
                  {selectedImages.length > 1 && (
                    <span className="font-inter text-[11px] text-white/20">
                      Bild {lightboxImageIndex + 1} von {selectedImages.length}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
