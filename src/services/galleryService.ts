export interface GalleryImage {
  id: string;
  dataUrl: string;
  caption?: string;
  createdAt: string;
}

const STORAGE_KEY = 'elbfunkeln_gallery';

function loadImages(): GalleryImage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveImages(images: GalleryImage[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

export const galleryService = {
  getAll(): GalleryImage[] {
    return loadImages().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  add(dataUrl: string, caption?: string): GalleryImage {
    const images = loadImages();
    const newImage: GalleryImage = {
      id: crypto.randomUUID(),
      dataUrl,
      caption,
      createdAt: new Date().toISOString(),
    };
    images.unshift(newImage);
    saveImages(images);
    return newImage;
  },

  remove(id: string): void {
    const images = loadImages().filter(img => img.id !== id);
    saveImages(images);
  },

  readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async compressImage(file: File, maxWidth = 1600, quality = 0.85): Promise<string> {
    const dataUrl = await this.readFileAsDataUrl(file);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = dataUrl;
    });
  },
};
