import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star } from 'lucide-react';
import { galleryService, GalleryPost } from '../services/galleryService';

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
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<GalleryPost | null>(null);
  const [activeTag, setActiveTag] = useState<string>('');

  useEffect(() => {
    setPosts(galleryService.getPublic());
  }, []);

  // Close lightbox on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPost(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Collect all tags
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags))).sort();

  const filteredPosts = activeTag
    ? posts.filter(p => p.tags.includes(activeTag))
    : posts;

  if (posts.length === 0) {
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
          className="text-center mb-12"
        >
          <h1 className="font-cormorant text-4xl md:text-5xl text-elbfunkeln-green mb-4">
            Galerie
          </h1>
          <p className="font-inter text-lg text-elbfunkeln-green/60 max-w-xl mx-auto">
            Einblicke in unsere Welt — handgefertigter Schmuck, Momente und Inspiration.
          </p>
        </motion.div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            <button
              onClick={() => setActiveTag('')}
              className={`px-4 py-1.5 rounded-full font-inter text-sm transition-all duration-300 ${
                !activeTag
                  ? 'bg-elbfunkeln-green text-white shadow-md'
                  : 'bg-elbfunkeln-green/5 text-elbfunkeln-green/60 hover:bg-elbfunkeln-green/10'
              }`}
            >
              Alle
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
                className={`px-4 py-1.5 rounded-full font-inter text-sm transition-all duration-300 ${
                  activeTag === tag
                    ? 'bg-elbfunkeln-green text-white shadow-md'
                    : 'bg-elbfunkeln-green/5 text-elbfunkeln-green/60 hover:bg-elbfunkeln-green/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredPosts.map((post, index) => {
            const drift = driftClasses[index % driftClasses.length];
            const delay = delayClasses[index % delayClasses.length];

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: Math.min(index * 0.08, 0.8) }}
                className={`break-inside-avoid ${drift} ${delay}`}
              >
                <div
                  className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-500 bg-white"
                  onClick={() => setSelectedPost(post)}
                >
                  {/* Featured badge */}
                  {post.featured && (
                    <div className="absolute top-3 right-3 z-10 bg-yellow-400 text-white p-1.5 rounded-full shadow-sm">
                      <Star size={12} fill="currentColor" />
                    </div>
                  )}

                  {/* Image */}
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full block transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />

                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-elbfunkeln-green/0 group-hover:bg-elbfunkeln-green/10 transition-colors duration-500" />

                  {/* Content overlay on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <h3 className="font-cormorant text-lg text-white leading-tight mb-1">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="font-inter text-xs text-white/70 line-clamp-2">
                        {post.description}
                      </p>
                    )}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-inter bg-white/20 text-white/80">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* No results for tag */}
        {filteredPosts.length === 0 && activeTag && (
          <div className="text-center py-16">
            <p className="font-inter text-elbfunkeln-green/50">
              Keine Beiträge mit dem Tag "{activeTag}" gefunden.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedPost(null)}
          >
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
              title="Schließen"
            >
              <X size={28} />
            </button>

            <div
              className="flex flex-col items-center max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={selectedPost.imageUrl}
                alt={selectedPost.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />

              {/* Post info below image */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-center max-w-lg"
              >
                <h2 className="font-cormorant text-2xl text-white mb-2">
                  {selectedPost.title}
                </h2>
                {selectedPost.description && (
                  <p className="font-inter text-sm text-white/60 mb-3">
                    {selectedPost.description}
                  </p>
                )}
                {selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedPost.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full text-xs font-inter bg-white/10 text-white/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
