import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryService, GalleryPost } from '../services/galleryService';

export function GalleryPage() {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeTag, setActiveTag] = useState<string>('');

  useEffect(() => {
    setPosts(galleryService.getPublic());
  }, []);

  // Keyboard navigation in lightbox
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight') setSelectedIndex(prev =>
        prev !== null && prev < filteredPosts.length - 1 ? prev + 1 : prev
      );
      if (e.key === 'ArrowLeft') setSelectedIndex(prev =>
        prev !== null && prev > 0 ? prev - 1 : prev
      );
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex]);

  // Curated tags — only show tags used by 1+ posts, max 8
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

  const selectedPost = selectedIndex !== null ? filteredPosts[selectedIndex] : null;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-elbfunkeln-beige pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center pt-20">
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
    <div className="min-h-screen bg-elbfunkeln-beige pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
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

        {/* Tag filter */}
        {topTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            <button
              onClick={() => setActiveTag('')}
              className={`px-4 py-1.5 rounded-full font-inter text-xs tracking-wide transition-all duration-300 ${
                !activeTag
                  ? 'bg-elbfunkeln-green text-white shadow-sm'
                  : 'bg-white/60 text-elbfunkeln-green/60 hover:bg-white/80 backdrop-blur-sm'
              }`}
            >
              Alle
            </button>
            {topTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
                className={`px-4 py-1.5 rounded-full font-inter text-xs tracking-wide transition-all duration-300 ${
                  activeTag === tag
                    ? 'bg-elbfunkeln-green text-white shadow-sm'
                    : 'bg-white/60 text-elbfunkeln-green/60 hover:bg-white/80 backdrop-blur-sm'
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.map((post, index) => {
            const isFeatured = post.featured && index < 3;

            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: 0.05 }}
              >
                <div
                  className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-500"
                  onClick={() => setSelectedIndex(index)}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${isFeatured ? 'aspect-[2/1]' : 'aspect-[16/9]'}`}>
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />

                    {/* Featured badge */}
                    {post.featured && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white p-1.5 rounded-full">
                          <Star size={12} fill="currentColor" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <div className="bg-white/75 backdrop-blur-xl rounded-xl border border-white/60 p-4 shadow-lg transition-all duration-500 group-hover:bg-white/85">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-cormorant text-lg md:text-xl text-elbfunkeln-green leading-tight mb-0.5">
                            {post.title}
                          </h3>
                          {post.description && (
                            <p className="font-inter text-xs text-elbfunkeln-green/50 line-clamp-1 leading-relaxed">
                              {post.description}
                            </p>
                          )}
                        </div>
                        <span className="font-inter text-[10px] text-elbfunkeln-green/30 whitespace-nowrap mt-1 shrink-0">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>

                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {post.tags.slice(0, 4).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full text-[10px] font-inter bg-elbfunkeln-green/5 text-elbfunkeln-green/40 border border-elbfunkeln-green/8"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Empty tag filter */}
        {filteredPosts.length === 0 && activeTag && (
          <div className="text-center py-20">
            <p className="font-inter text-elbfunkeln-green/40">
              Keine Beiträge mit dem Tag &bdquo;{activeTag}&ldquo; gefunden.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPost && selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all"
              title="Schließen"
            >
              <X size={18} />
            </button>

            {/* Nav arrows */}
            {selectedIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex - 1); }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/60 hover:text-white hover:bg-white/20 transition-all"
                title="Vorheriges Bild"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {selectedIndex < filteredPosts.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex + 1); }}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/60 hover:text-white hover:bg-white/20 transition-all"
                title="Nächstes Bild"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Content */}
            <div
              className="w-full max-w-4xl mx-4 md:mx-8"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key={selectedPost.id}
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative overflow-hidden rounded-2xl"
              >
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title}
                  className="w-full max-h-[70vh] object-contain bg-black/40 rounded-2xl"
                />
              </motion.div>

              {/* Info panel */}
              <motion.div
                key={`info-${selectedPost.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                className="mt-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/15 p-4 md:p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <h2 className="font-cormorant text-xl md:text-2xl text-white leading-tight">
                    {selectedPost.title}
                  </h2>
                  <span className="font-inter text-[11px] text-white/30 whitespace-nowrap mt-1.5 shrink-0">
                    {formatDate(selectedPost.createdAt)}
                  </span>
                </div>

                {selectedPost.description && (
                  <p className="font-inter text-sm text-white/50 leading-relaxed mb-3 max-w-2xl">
                    {selectedPost.description}
                  </p>
                )}

                {selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPost.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-inter bg-white/8 text-white/50 border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Counter */}
                <div className="mt-3 pt-2.5 border-t border-white/8">
                  <span className="font-inter text-[11px] text-white/25">
                    {selectedIndex + 1} / {filteredPosts.length}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
