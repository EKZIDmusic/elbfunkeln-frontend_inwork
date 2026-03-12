export interface GalleryPost {
  id: string;
  imageUrl: string;
  images: string[];
  title: string;
  description?: string;
  tags: string[];
  materials: string[];
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** Keep old name as alias for backwards-compat in imports */
export type GalleryImage = GalleryPost;

const STORAGE_KEY = 'elbfunkeln_gallery';
const MOCK_VERSION_KEY = 'elbfunkeln_gallery_v';
const CURRENT_MOCK_VERSION = 5;

// ── Placeholder images (reliable Unsplash photos) ──
const MOCK_POSTS: GalleryPost[] = [
  {
    id: 'mock-1',
    imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&q=80',
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=900&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80',
    ],
    title: 'Goldene Wellen',
    description: 'Filigrane Drahtarbeit inspiriert von der Bewegung der Elbe bei Sonnenuntergang. Jeder Bogen erzählt von fließendem Wasser und goldenem Licht.',
    tags: ['Kollektion', 'Gold', 'Neuheit'],
    materials: ['18k Gold', 'Süßwasserperlen'],
    featured: true,
    order: 0,
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'mock-2',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80',
    ],
    title: 'Werkstatt-Einblick',
    description: 'Ein Blick hinter die Kulissen — so entsteht jedes Stück von Hand in unserer kleinen Hamburger Werkstatt.',
    tags: ['Behind the Scenes', 'Handarbeit'],
    materials: [],
    featured: false,
    order: 1,
    createdAt: '2026-02-28T14:30:00.000Z',
    updatedAt: '2026-02-28T14:30:00.000Z',
  },
  {
    id: 'mock-3',
    imageUrl: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=900&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=900&q=80',
    ],
    title: 'Perlentraum in Rosé',
    description: 'Zarte Süßwasserperlen, eingebettet in handgebogenen Silberdraht. Ein Traum für romantische Anlässe.',
    tags: ['Perlen', 'Silber', 'Romantik'],
    materials: ['Sterling Silber', 'Süßwasserperlen', 'Roségold-Beschichtung'],
    featured: true,
    order: 2,
    createdAt: '2026-02-25T09:15:00.000Z',
    updatedAt: '2026-02-25T09:15:00.000Z',
  },
  {
    id: 'mock-4',
    imageUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=900&q=80',
    ],
    title: 'Frühlings-Kollektion 2026',
    description: 'Unsere neue Kollektion feiert die ersten warmen Tage — leichte Formen, pastellige Töne und die Freude am Neuanfang.',
    tags: ['Kollektion', 'Frühling', 'Neuheit'],
    materials: ['Sterling Silber', 'Emaille'],
    featured: false,
    order: 3,
    createdAt: '2026-02-20T11:00:00.000Z',
    updatedAt: '2026-02-20T11:00:00.000Z',
  },
  {
    id: 'mock-5',
    imageUrl: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=900&q=80',
      'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=900&q=80',
    ],
    title: 'Materialien',
    description: 'Wir arbeiten ausschließlich mit hochwertigen Materialien — hier ein Blick auf unsere Draht- und Perlenauswahl.',
    tags: ['Behind the Scenes', 'Material'],
    materials: ['Gold-Draht', 'Silber-Draht', 'Kupfer', 'Halbedelsteine'],
    featured: false,
    order: 4,
    createdAt: '2026-02-18T16:45:00.000Z',
    updatedAt: '2026-02-18T16:45:00.000Z',
  },
  {
    id: 'mock-6',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80',
    ],
    title: 'Kundinnen-Moment',
    description: 'Nichts macht uns glücklicher als strahlende Gesichter. Danke für dieses wunderschöne Foto!',
    tags: ['Community', 'Kundenfoto'],
    materials: [],
    featured: false,
    order: 5,
    createdAt: '2026-02-15T13:20:00.000Z',
    updatedAt: '2026-02-15T13:20:00.000Z',
  },
  {
    id: 'mock-7',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&q=80',
    ],
    title: 'Silberne Eleganz',
    description: 'Minimalismus trifft Handwerkskunst — unser meistverkaufter Ring in Sterlingsilber.',
    tags: ['Silber', 'Ring', 'Bestseller'],
    materials: ['925 Sterling Silber'],
    featured: true,
    order: 6,
    createdAt: '2026-02-12T10:30:00.000Z',
    updatedAt: '2026-02-12T10:30:00.000Z',
  },
  {
    id: 'mock-8',
    imageUrl: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=900&q=80',
    ],
    title: 'Hamburg, unsere Heimat',
    description: 'Der Hafen, die Elbe, das Licht — Hamburg inspiriert jeden einzelnen unserer Entwürfe.',
    tags: ['Hamburg', 'Inspiration'],
    materials: [],
    featured: false,
    order: 7,
    createdAt: '2026-02-10T08:00:00.000Z',
    updatedAt: '2026-02-10T08:00:00.000Z',
  },
  {
    id: 'mock-9',
    imageUrl: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=900&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=900&q=80',
    ],
    title: 'Geschenkideen',
    description: 'Auf der Suche nach dem perfekten Geschenk? Unsere handgefertigten Sets kommen in einer liebevoll gestalteten Box.',
    tags: ['Geschenk', 'Set', 'Verpackung'],
    materials: ['Sterling Silber', 'Geschenkbox aus Birkenholz'],
    featured: false,
    order: 8,
    createdAt: '2026-02-08T15:00:00.000Z',
    updatedAt: '2026-02-08T15:00:00.000Z',
  },
  {
    id: 'mock-10',
    imageUrl: 'https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=900&q=80',
    ],
    title: 'Detailaufnahme: Ohrringe "Elbufer"',
    description: 'Die feinen Drahtschlaufen unserer Ohrringe "Elbufer" — jedes Paar ist ein Unikat mit eigenem Charakter.',
    tags: ['Ohrringe', 'Detail', 'Unikat'],
    materials: ['Sterling Silber', 'Süßwasserperlen'],
    featured: false,
    order: 9,
    createdAt: '2026-02-05T12:00:00.000Z',
    updatedAt: '2026-02-05T12:00:00.000Z',
  },
];

function loadPosts(): GalleryPost[] {
  try {
    const version = Number(localStorage.getItem(MOCK_VERSION_KEY) || '0');
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored || version < CURRENT_MOCK_VERSION) {
      savePosts(MOCK_POSTS);
      localStorage.setItem(MOCK_VERSION_KEY, String(CURRENT_MOCK_VERSION));
      return [...MOCK_POSTS];
    }
    const posts: GalleryPost[] = JSON.parse(stored);
    return posts.map((p, i) => ({
      ...p,
      title: p.title || '',
      description: p.description ?? (p as any).caption ?? '',
      tags: p.tags ?? [],
      materials: p.materials ?? [],
      images: p.images ?? (p.imageUrl ? [p.imageUrl] : []),
      featured: p.featured ?? false,
      order: p.order ?? i,
      updatedAt: p.updatedAt || p.createdAt,
      imageUrl: p.imageUrl || (p as any).dataUrl || '',
    }));
  } catch {
    return [];
  }
}

function savePosts(posts: GalleryPost[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export const galleryService = {
  getAll(): GalleryPost[] {
    return loadPosts().sort((a, b) => a.order - b.order);
  },

  getPublic(): GalleryPost[] {
    const posts = loadPosts().sort((a, b) => a.order - b.order);
    const featured = posts.filter(p => p.featured);
    const rest = posts.filter(p => !p.featured);
    return [...featured, ...rest];
  },

  getById(id: string): GalleryPost | undefined {
    return loadPosts().find(p => p.id === id);
  },

  add(data: { imageUrl: string; images: string[]; title: string; description?: string; tags?: string[]; materials?: string[] }): GalleryPost {
    const posts = loadPosts();
    const maxOrder = posts.length > 0 ? Math.max(...posts.map(p => p.order)) + 1 : 0;
    const now = new Date().toISOString();
    const newPost: GalleryPost = {
      id: crypto.randomUUID(),
      imageUrl: data.imageUrl,
      images: data.images,
      title: data.title,
      description: data.description,
      tags: data.tags ?? [],
      materials: data.materials ?? [],
      featured: false,
      order: maxOrder,
      createdAt: now,
      updatedAt: now,
    };
    posts.push(newPost);
    savePosts(posts);
    return newPost;
  },

  update(id: string, data: Partial<Pick<GalleryPost, 'title' | 'description' | 'tags' | 'materials' | 'imageUrl' | 'images' | 'featured'>>): void {
    const posts = loadPosts();
    const post = posts.find(p => p.id === id);
    if (post) {
      if (data.title !== undefined) post.title = data.title;
      if (data.description !== undefined) post.description = data.description;
      if (data.tags !== undefined) post.tags = data.tags;
      if (data.materials !== undefined) post.materials = data.materials;
      if (data.imageUrl !== undefined) post.imageUrl = data.imageUrl;
      if (data.images !== undefined) post.images = data.images;
      if (data.featured !== undefined) post.featured = data.featured;
      post.updatedAt = new Date().toISOString();
      savePosts(posts);
    }
  },

  remove(id: string): void {
    const posts = loadPosts().filter(p => p.id !== id);
    posts.sort((a, b) => a.order - b.order).forEach((p, i) => { p.order = i; });
    savePosts(posts);
  },

  bulkRemove(ids: string[]): void {
    const idSet = new Set(ids);
    const posts = loadPosts().filter(p => !idSet.has(p.id));
    posts.sort((a, b) => a.order - b.order).forEach((p, i) => { p.order = i; });
    savePosts(posts);
  },

  toggleFeatured(id: string): boolean {
    const posts = loadPosts();
    const post = posts.find(p => p.id === id);
    if (post) {
      post.featured = !post.featured;
      post.updatedAt = new Date().toISOString();
      savePosts(posts);
      return post.featured;
    }
    return false;
  },

  moveImage(id: string, newIndex: number): void {
    const posts = this.getAll();
    const currentIndex = posts.findIndex(p => p.id === id);
    if (currentIndex === -1 || currentIndex === newIndex) return;
    const [moved] = posts.splice(currentIndex, 1);
    posts.splice(newIndex, 0, moved);
    posts.forEach((p, i) => { p.order = i; });
    savePosts(posts);
  },

  resetToMocks(): void {
    savePosts(MOCK_POSTS.map(p => ({ ...p })));
  },

  getAllTags(): string[] {
    const posts = loadPosts();
    const tagSet = new Set<string>();
    posts.forEach(p => p.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  },

  getAllMaterials(): string[] {
    const posts = loadPosts();
    const matSet = new Set<string>();
    posts.forEach(p => p.materials.forEach(m => matSet.add(m)));
    return Array.from(matSet).sort();
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
