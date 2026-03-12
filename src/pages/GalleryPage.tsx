import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { galleryService, GalleryPost } from '../services/galleryService';

// CSS class per column position for wave animation (defined in globals.css)
const waveClasses = [
  'animate-gallery-wave-1',
  'animate-gallery-wave-2',
  'animate-gallery-wave-3',
  'animate-gallery-wave-4',
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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedPostIndex === null) return;
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

  // Lock body scroll when lightbox open
  useEffect(() => {
    if (selectedPostIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedPostIndex]);

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
      <div className="min-h-screen bg-elbfunkeln-beige pt-36 pb-16">
        <div className="container mx-auto px-4 text-center pt-20">
          <h1 className="font-cormorant text-4xl md:text-5xl text-elbfunkeln-green mb-4">Galerie</h1>
          <p className="font-inter text-lg text-elbfunkeln-green/60">Bald findest du hier Einblicke in unsere Welt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elbfunkeln-beige pt-36 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="font-cormorant text-4xl md:text-5xl text-elbfunkeln-green mb-2">Galerie</h1>
          <p className="font-inter text-sm text-elbfunkeln-green/50 max-w-md mx-auto">
            Einblicke in unsere Welt — Handwerk, Momente und Inspiration.
          </p>
        </motion.div>

        {/* Tag filter */}
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

        {/* 4-column grid — CSS animation for smooth wave, no framer motion float */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {filteredPosts.map((post, index) => {
            const colInRow = index % 4;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: colInRow * 0.06 }}
                className={`cursor-pointer group ${waveClasses[colInRow]}`}
                onClick={() => openLightbox(index)}
              >
                <div className="overflow-hidden rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm hover:shadow-xl hover:bg-white/50 transition-all duration-500">
                  {/* Image — fixed aspect */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />

                    {post.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/25 backdrop-blur-md rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                        {post.images.slice(0, 4).map((_, i) => (
                          <Circle key={i} size={3} fill="white" className="text-white/80" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Title — fixed height, always visible */}
                  <div className="px-3 py-2 h-12 flex items-center">
                    <h3 className="font-cormorant text-sm md:text-base text-elbfunkeln-green leading-tight truncate w-full">
                      {post.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredPosts.length === 0 && activeTag && (
          <div className="text-center py-20">
            <p className="font-inter text-elbfunkeln-green/40">
              Keine Beiträge mit dem Tag &bdquo;{activeTag}&ldquo; gefunden.
            </p>
          </div>
        )}
      </div>

      {/* ═══ LIGHTBOX ═══ */}
      {selectedPost && selectedPostIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          {/* Centered content */}
          <div className="lightbox-center" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-card">

              {/* Image */}
              <div className="lightbox-image-wrap">
                <img
                  src={selectedImages[lightboxImageIndex]}
                  alt={selectedPost.title}
                  className="lightbox-image"
                />

                {/* Image nav: previous */}
                {selectedImages.length > 1 && lightboxImageIndex > 0 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setLightboxImageIndex(prev => prev - 1); }}
                    title="Vorheriges Bild"
                    className="lightbox-img-btn lightbox-img-btn--left"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}

                {/* Image nav: next */}
                {selectedImages.length > 1 && lightboxImageIndex < selectedImages.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setLightboxImageIndex(prev => prev + 1); }}
                    title="Nächstes Bild"
                    className="lightbox-img-btn lightbox-img-btn--right"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>

              {/* Dots */}
              {selectedImages.length > 1 && (
                <div className="lightbox-dots">
                  {selectedImages.map((_, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setLightboxImageIndex(i); }}
                      title={`Bild ${i + 1}`}
                      className={`lightbox-dot ${i === lightboxImageIndex ? 'lightbox-dot--active' : ''}`}
                    />
                  ))}
                </div>
              )}

              {/* Info panel */}
              <div className="lightbox-info">
                <div className="lightbox-info-header">
                  <h2 className="font-cormorant lightbox-info-title">
                    {selectedPost.title}
                  </h2>
                  <span className="font-inter lightbox-info-date">
                    {formatDate(selectedPost.createdAt)}
                  </span>
                </div>

                {selectedPost.description && (
                  <p className="font-inter lightbox-info-desc">
                    {selectedPost.description}
                  </p>
                )}

                {(selectedPost.tags.length > 0 || selectedPost.materials.length > 0) && (
                  <div className="lightbox-info-tags">
                    {selectedPost.tags.map(tag => (
                      <span key={tag} className="font-inter lightbox-tag">{tag}</span>
                    ))}
                    {selectedPost.materials.map(mat => (
                      <span key={mat} className="font-inter lightbox-material">{mat}</span>
                    ))}
                  </div>
                )}

                <div className="lightbox-info-footer">
                  <span className="font-inter lightbox-info-counter">
                    {selectedPostIndex + 1} / {filteredPosts.length}
                  </span>
                  {selectedImages.length > 1 && (
                    <span className="font-inter lightbox-info-counter">
                      Bild {lightboxImageIndex + 1} von {selectedImages.length}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            title="Schließen"
            className="lightbox-nav-btn lightbox-close-btn"
          >
            <X size={16} />
          </button>

          {/* Prev post */}
          {selectedPostIndex > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToPrevPost(); }}
              title="Vorheriger Beitrag"
              className="lightbox-nav-btn lightbox-prev-btn"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Next post */}
          {selectedPostIndex < filteredPosts.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToNextPost(); }}
              title="Nächster Beitrag"
              className="lightbox-nav-btn lightbox-next-btn"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
