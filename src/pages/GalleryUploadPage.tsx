import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, ImagePlus, Trash2, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { galleryService, GalleryImage } from '../services/galleryService';
import { useRouter } from '../components/Router';
import { toast } from 'sonner';

interface PendingImage {
  id: string;
  file: File;
  preview: string;
  caption: string;
}

export function GalleryUploadPage() {
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [existingImages, setExistingImages] = useState<GalleryImage[]>(galleryService.getAll());
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { navigateTo } = useRouter();

  const addFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Bitte nur Bilddateien auswählen.');
      return;
    }

    const newPending: PendingImage[] = imageFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      caption: '',
    }));

    setPendingImages(prev => [...prev, ...newPending]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const removePending = (id: string) => {
    setPendingImages(prev => {
      const item = prev.find(p => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(p => p.id !== id);
    });
  };

  const updateCaption = (id: string, caption: string) => {
    setPendingImages(prev =>
      prev.map(p => p.id === id ? { ...p, caption } : p)
    );
  };

  const handleUpload = async () => {
    if (pendingImages.length === 0) return;

    setUploading(true);
    try {
      for (const pending of pendingImages) {
        const compressed = await galleryService.compressImage(pending.file);
        galleryService.add(compressed, pending.caption || undefined);
        URL.revokeObjectURL(pending.preview);
      }

      toast.success(`${pendingImages.length} ${pendingImages.length === 1 ? 'Bild' : 'Bilder'} hochgeladen`);
      setPendingImages([]);
      setExistingImages(galleryService.getAll());
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Fehler beim Hochladen');
    } finally {
      setUploading(false);
    }
  };

  const deleteExisting = (id: string) => {
    galleryService.remove(id);
    setExistingImages(galleryService.getAll());
    toast.success('Bild entfernt');
  };

  return (
    <div className="min-h-screen bg-elbfunkeln-beige pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-cormorant text-4xl text-elbfunkeln-green mb-3">
            Galerie verwalten
          </h1>
          <p className="font-inter text-elbfunkeln-green/60">
            Bilder hochladen, die automatisch in der Galerie erscheinen.
          </p>
        </motion.div>

        {/* Drop Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
              transition-all duration-300
              ${isDragging
                ? 'border-elbfunkeln-rose bg-elbfunkeln-rose/5 scale-[1.01]'
                : 'border-elbfunkeln-green/30 hover:border-elbfunkeln-green/60 hover:bg-elbfunkeln-green/5'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={e => e.target.files && addFiles(e.target.files)}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              <div className={`
                p-4 rounded-full transition-colors duration-300
                ${isDragging ? 'bg-elbfunkeln-rose/20' : 'bg-elbfunkeln-green/10'}
              `}>
                <ImagePlus
                  size={32}
                  className={isDragging ? 'text-elbfunkeln-rose' : 'text-elbfunkeln-green/60'}
                />
              </div>
              <div>
                <p className="font-inter text-elbfunkeln-green font-medium mb-1">
                  Bilder hierhin ziehen
                </p>
                <p className="font-inter text-sm text-elbfunkeln-green/50">
                  oder klicken zum Auswählen — JPG, PNG, WebP
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pending Images */}
        <AnimatePresence>
          {pendingImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-cormorant text-xl text-elbfunkeln-green">
                  {pendingImages.length} {pendingImages.length === 1 ? 'Bild' : 'Bilder'} ausgewählt
                </h2>
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2" />
                  ) : (
                    <Upload size={16} className="mr-2" />
                  )}
                  {uploading ? 'Wird hochgeladen...' : 'Alle hochladen'}
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pendingImages.map((img) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="overflow-hidden bg-white">
                      <div className="relative aspect-square">
                        <img
                          src={img.preview}
                          alt="Vorschau"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removePending(img.id)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-elbfunkeln-rose hover:bg-white transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="p-3">
                        <Input
                          placeholder="Bildunterschrift (optional)"
                          value={img.caption}
                          onChange={e => updateCaption(img.id, e.target.value)}
                          className="text-sm border-elbfunkeln-green/20"
                        />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
                Hochgeladene Bilder
              </h2>
              <Button
                variant="outline"
                onClick={() => navigateTo('gallery')}
                className="border-elbfunkeln-green text-elbfunkeln-green hover:bg-elbfunkeln-green hover:text-white"
              >
                <Check size={16} className="mr-2" />
                Galerie ansehen
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingImages.map((image) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="overflow-hidden bg-white group">
                    <div className="relative aspect-square">
                      <img
                        src={image.dataUrl}
                        alt={image.caption || 'Galeriebild'}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => deleteExisting(image.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-elbfunkeln-rose hover:bg-white opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {image.caption && (
                      <div className="p-2">
                        <p className="font-inter text-xs text-elbfunkeln-green/70 truncate">
                          {image.caption}
                        </p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
