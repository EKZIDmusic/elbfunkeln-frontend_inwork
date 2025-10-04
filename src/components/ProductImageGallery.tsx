import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  isNew?: boolean;
  isSale?: boolean;
  inStock?: boolean;
}

export function ProductImageGallery({ 
  images, 
  productName, 
  isNew, 
  isSale, 
  inStock 
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 }); // Prozentuale Position für transform-origin
  const imageRef = useRef<HTMLDivElement>(null);

  const ZOOM_LEVELS = [1, 1.5, 2, 3, 4];
  const currentZoomIndex = ZOOM_LEVELS.indexOf(zoomLevel);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
    resetZoom();
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    resetZoom();
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setZoomPosition({ x: 0, y: 0 });
    setZoomOrigin({ x: 50, y: 50 });
    setIsDragging(false);
  };

  const zoomIn = (mouseX?: number, mouseY?: number) => {
    const nextIndex = Math.min(currentZoomIndex + 1, ZOOM_LEVELS.length - 1);
    const newZoomLevel = ZOOM_LEVELS[nextIndex];
    
    if (mouseX !== undefined && mouseY !== undefined && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const relativeX = ((mouseX - rect.left) / rect.width) * 100;
      const relativeY = ((mouseY - rect.top) / rect.height) * 100;
      
      setZoomOrigin({ 
        x: Math.max(0, Math.min(100, relativeX)), 
        y: Math.max(0, Math.min(100, relativeY))
      });
    }
    
    setZoomLevel(newZoomLevel);
  };

  const zoomOut = () => {
    const prevIndex = Math.max(currentZoomIndex - 1, 0);
    const newZoomLevel = ZOOM_LEVELS[prevIndex];
    setZoomLevel(newZoomLevel);
    
    if (newZoomLevel === 1) {
      setZoomPosition({ x: 0, y: 0 });
      setZoomOrigin({ x: 50, y: 50 });
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    
    if (isDragging && zoomLevel > 1) {
      // Drag mode: bewege das Bild basierend auf Mausbewegung
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      setZoomPosition(prev => {
        const sensitivity = 0.8;
        const newX = prev.x + deltaX * sensitivity;
        const newY = prev.y + deltaY * sensitivity;
        
        // Begrenze die Bewegung basierend auf Zoom-Level
        const maxOffset = 150 * (zoomLevel - 1);
        
        return {
          x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
          y: Math.max(-maxOffset, Math.min(maxOffset, newY))
        };
      });
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (zoomLevel === 1) {
      // Bei normalem Zoom: setze den Zoom-Origin basierend auf Mausposition
      const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
      const relativeY = ((e.clientY - rect.top) / rect.height) * 100;
      
      setZoomOrigin({ 
        x: Math.max(0, Math.min(100, relativeX)), 
        y: Math.max(0, Math.min(100, relativeY))
      });
    }
  }, [zoomLevel, isDragging, lastMousePos]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel === 1) {
      // Zoom zum Cursor
      zoomIn(e.clientX, e.clientY);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.deltaY < 0) {
      // Zoom in at cursor position
      const rect = imageRef.current?.getBoundingClientRect();
      if (rect) {
        zoomIn(e.clientX, e.clientY);
      }
    } else {
      zoomOut();
    }
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'Escape') resetZoom();
    if (e.key === '+' || e.key === '=') zoomIn();
    if (e.key === '-') zoomOut();
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleKeyPress]);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-elbfunkeln-beige/20 to-elbfunkeln-lavender/20">
        <div 
          ref={imageRef}
          className="relative w-full h-96 md:h-[500px] overflow-hidden select-none"
          style={{ 
            cursor: zoomLevel === 1 ? 'zoom-in' : isDragging ? 'grabbing' : 'grab'
          }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseLeave={() => {
            setIsDragging(false);
          }}
          onWheel={handleWheel}
          onClick={handleClick}
        >
          <motion.div
            className="w-full h-full"
            animate={{
              scale: zoomLevel,
              x: zoomPosition.x,
              y: zoomPosition.y,
            }}
            transition={{ 
              type: "tween",
              duration: isDragging ? 0 : 0.4,
              ease: "easeOut"
            }}
            style={{
              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
            }}
          >
            <ImageWithFallback
              src={images[selectedImage]}
              alt={`${productName} ${selectedImage + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </motion.div>

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/90 backdrop-blur-sm border-elbfunkeln-lavender/30 hover:bg-elbfunkeln-lavender hover:text-white animate-float-gentle"
              onClick={(e) => {
                e.stopPropagation();
                const rect = imageRef.current?.getBoundingClientRect();
                if (rect) {
                  const centerX = rect.left + rect.width / 2;
                  const centerY = rect.top + rect.height / 2;
                  zoomIn(centerX, centerY);
                }
              }}
              disabled={currentZoomIndex === ZOOM_LEVELS.length - 1}
            >
              <ZoomIn size={16} className="text-elbfunkeln-green" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/90 backdrop-blur-sm border-elbfunkeln-lavender/30 hover:bg-elbfunkeln-lavender hover:text-white animate-float-gentle animate-delay-1"
              onClick={(e) => {
                e.stopPropagation();
                zoomOut();
              }}
              disabled={currentZoomIndex === 0}
            >
              <ZoomOut size={16} className="text-elbfunkeln-green" />
            </Button>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm border-elbfunkeln-lavender/30 hover:bg-elbfunkeln-lavender hover:text-white z-20 animate-float-gentle animate-delay-2"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
              >
                <ChevronLeft size={16} className="text-elbfunkeln-green" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm border-elbfunkeln-lavender/30 hover:bg-elbfunkeln-lavender hover:text-white z-20 mr-16 animate-float-gentle animate-delay-3"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
              >
                <ChevronRight size={16} className="text-elbfunkeln-green" />
              </Button>
            </>
          )}

          {/* Zoom Level Indicator */}
          {zoomLevel > 1 && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {Math.round(zoomLevel * 100)}%
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
            {!inStock && (
              <Badge variant="destructive">
                Ausverkauft
              </Badge>
            )}
            {isNew && (
              <Badge className="bg-elbfunkeln-lavender text-white">
                Neu
              </Badge>
            )}
            {isSale && (
              <Badge className="bg-elbfunkeln-rose text-white">
                Sale
              </Badge>
            )}
          </div>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm z-10">
              {selectedImage + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <motion.button
              key={index}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedImage === index 
                  ? 'border-elbfunkeln-lavender shadow-lg scale-105' 
                  : 'border-transparent hover:border-elbfunkeln-lavender/50'
              }`}
              onClick={() => {
                setSelectedImage(index);
                resetZoom();
              }}
              whileHover={{ scale: selectedImage === index ? 1.05 : 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ImageWithFallback
                src={image}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {selectedImage === index && (
                <div className="absolute inset-0 bg-elbfunkeln-lavender/20" />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-elbfunkeln-green/60 font-inter">
          {zoomLevel > 1 ? (
            'Ziehen zum Verschieben • Scrollen oder Buttons zum Zoomen • ESC zum Zurücksetzen'
          ) : (
            'Klicken oder Scrollen zum Zoomen am Cursor'
          )}
          {images.length > 1 && ' • Pfeiltasten zur Navigation'}
        </p>
      </div>
    </div>
  );
}