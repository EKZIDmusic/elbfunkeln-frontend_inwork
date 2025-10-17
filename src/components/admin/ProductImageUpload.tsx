import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon, Star, Trash2, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { ProductImage } from '../../services/apiService';

const API_BASE_URL = 'https://api.elbfunkeln.de/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

interface ProductImageUploadProps {
  productId: string;
  onImagesUpdate?: () => void;
}

interface ImageUploadState {
  file: File | null;
  preview: string | null;
  alt: string;
  isPrimary: boolean;
  uploading: boolean;
  progress: number;
}

export function ProductImageUpload({ productId, onImagesUpdate }: ProductImageUploadProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadState, setUploadState] = useState<ImageUploadState>({
    file: null,
    preview: null,
    alt: '',
    isPrimary: false,
    uploading: false,
    progress: 0
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing images
  useEffect(() => {
    loadImages();
  }, [productId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        toast.error('Nicht authentifiziert');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/images`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Bilder');
      }

      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Fehler beim Laden der Bilder');
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Ungültiges Dateiformat. Erlaubt sind: JPG, PNG, GIF, WebP');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('Datei zu groß. Maximale Größe: 5 MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadState({
        ...uploadState,
        file,
        preview: e.target?.result as string,
        isPrimary: images.length === 0 // Set as primary if it's the first image
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Upload image
  const handleUpload = async () => {
    if (!uploadState.file) {
      toast.error('Bitte wählen Sie eine Datei aus');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error('Nicht authentifiziert');
      return;
    }

    try {
      setUploadState({ ...uploadState, uploading: true, progress: 0 });

      const formData = new FormData();
      formData.append('file', uploadState.file);
      formData.append('alt', uploadState.alt || '');
      formData.append('isPrimary', uploadState.isPrimary ? 'true' : 'false');

      const xhr = new XMLHttpRequest();

      // Progress tracking
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadState(prev => ({ ...prev, progress }));
        }
      });

      // Promise wrapper for XMLHttpRequest
      const uploadPromise = new Promise<ProductImage>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload fehlgeschlagen'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload fehlgeschlagen')));
        xhr.addEventListener('abort', () => reject(new Error('Upload abgebrochen')));

        xhr.open('POST', `${API_BASE_URL}/admin/products/${productId}/images/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      const newImage = await uploadPromise;

      toast.success('Bild erfolgreich hochgeladen!');

      // Reset upload state
      setUploadState({
        file: null,
        preview: null,
        alt: '',
        isPrimary: false,
        uploading: false,
        progress: 0
      });

      // Reload images
      await loadImages();

      // Notify parent component
      if (onImagesUpdate) {
        onImagesUpdate();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Fehler beim Hochladen');
      setUploadState(prev => ({ ...prev, uploading: false, progress: 0 }));
    }
  };

  // Delete image
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Möchten Sie dieses Bild wirklich löschen?')) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error('Nicht authentifiziert');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Bildes');
      }

      toast.success('Bild erfolgreich gelöscht');
      await loadImages();

      if (onImagesUpdate) {
        onImagesUpdate();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Fehler beim Löschen des Bildes');
    }
  };

  // Set primary image
  const handleSetPrimary = async (imageId: string) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Nicht authentifiziert');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/images/${imageId}/primary`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Setzen des Hauptbildes');
      }

      toast.success('Hauptbild erfolgreich gesetzt');
      await loadImages();

      if (onImagesUpdate) {
        onImagesUpdate();
      }
    } catch (error) {
      console.error('Set primary error:', error);
      toast.error('Fehler beim Setzen des Hauptbildes');
    }
  };

  // Cancel upload
  const handleCancelUpload = () => {
    setUploadState({
      file: null,
      preview: null,
      alt: '',
      isPrimary: false,
      uploading: false,
      progress: 0
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6 border-2 border-dashed border-elbfunkeln-green/30 bg-gradient-to-br from-white to-elbfunkeln-beige/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-cormorant text-lg text-elbfunkeln-green flex items-center gap-2">
              <Upload size={20} />
              Bild hochladen
            </h3>
            {images.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {images.length} Bild{images.length !== 1 ? 'er' : ''}
              </Badge>
            )}
          </div>

          {/* File Upload Area */}
          {!uploadState.preview ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive
                  ? 'border-elbfunkeln-lavender bg-elbfunkeln-lavender/10'
                  : 'border-gray-300 hover:border-elbfunkeln-green/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Ziehen Sie eine Datei hierher oder
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                Datei auswählen
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-3">
                JPG, PNG, GIF, WebP • Max. 5 MB
              </p>
            </div>
          ) : (
            // Preview and Upload Form
            <Card className="p-4 bg-white">
              <div className="flex gap-4">
                {/* Image Preview */}
                <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                  <img
                    src={uploadState.preview}
                    alt="Vorschau"
                    className="w-full h-full object-cover"
                  />
                  {uploadState.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-1" />
                        <p className="text-xs">{uploadState.progress}%</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-3">
                  <div>
                    <Label htmlFor="image-alt" className="text-sm">
                      Alt-Text (optional)
                    </Label>
                    <Input
                      id="image-alt"
                      value={uploadState.alt}
                      onChange={(e) => setUploadState({ ...uploadState, alt: e.target.value })}
                      placeholder="Beschreibung des Bildes für SEO und Barrierefreiheit"
                      disabled={uploadState.uploading}
                      className="text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="image-primary"
                      checked={uploadState.isPrimary}
                      onCheckedChange={(checked) =>
                        setUploadState({ ...uploadState, isPrimary: !!checked })
                      }
                      disabled={uploadState.uploading}
                    />
                    <Label htmlFor="image-primary" className="text-sm cursor-pointer">
                      Als Hauptbild setzen
                    </Label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpload}
                      disabled={uploadState.uploading}
                      size="sm"
                      className="bg-elbfunkeln-green hover:bg-elbfunkeln-green/90"
                    >
                      {uploadState.uploading ? (
                        <>
                          <Loader2 size={14} className="mr-2 animate-spin" />
                          Lädt... {uploadState.progress}%
                        </>
                      ) : (
                        <>
                          <Upload size={14} className="mr-2" />
                          Hochladen
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancelUpload}
                      disabled={uploadState.uploading}
                      variant="outline"
                      size="sm"
                    >
                      <X size={14} className="mr-2" />
                      Abbrechen
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Upload Info */}
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              <p>Empfehlungen für beste Qualität:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Mindestgröße: 800x800 Pixel</li>
                <li>Quadratisches Format für einheitliche Darstellung</li>
                <li>Heller Hintergrund für optimale Produktdarstellung</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Existing Images */}
      <div className="space-y-3">
        <h3 className="font-cormorant text-lg text-elbfunkeln-green">
          Hochgeladene Bilder ({images.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-elbfunkeln-green" />
          </div>
        ) : images.length === 0 ? (
          <Card className="p-8 text-center border-2 border-dashed border-gray-300">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-500">Noch keine Bilder hochgeladen</p>
            <p className="text-xs text-gray-400 mt-1">
              Laden Sie oben Ihr erstes Produktbild hoch
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card
                key={image.id}
                className={`p-3 relative group hover:shadow-lg transition-all ${
                  image.isPrimary
                    ? 'ring-2 ring-elbfunkeln-lavender'
                    : 'hover:ring-1 hover:ring-elbfunkeln-green/30'
                }`}
              >
                {/* Primary Badge */}
                {image.isPrimary && (
                  <Badge className="absolute top-2 left-2 z-10 bg-elbfunkeln-lavender text-white flex items-center gap-1">
                    <Star size={12} fill="currentColor" />
                    Hauptbild
                  </Badge>
                )}

                {/* Image */}
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                  <img
                    src={`${API_BASE_URL}/images/${image.id}`}
                    alt={image.alt || 'Produktbild'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=300&q=80';
                    }}
                  />
                </div>

                {/* Image Info */}
                <div className="space-y-2">
                  {image.alt && (
                    <p className="text-xs text-gray-600 line-clamp-2">{image.alt}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!image.isPrimary && (
                      <Button
                        onClick={() => handleSetPrimary(image.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                      >
                        <Star size={12} className="mr-1" />
                        Als Hauptbild
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeleteImage(image.id)}
                      variant="outline"
                      size="sm"
                      className={`text-red-600 hover:bg-red-50 hover:text-red-700 ${
                        image.isPrimary ? 'flex-1' : ''
                      }`}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
