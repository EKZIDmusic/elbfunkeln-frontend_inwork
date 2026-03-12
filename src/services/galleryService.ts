import { galleryApi, GalleryPostResponse } from './apiService';

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

function toGalleryPost(p: GalleryPostResponse): GalleryPost {
  return {
    id: p.id,
    imageUrl: p.imageUrl || (p.images?.[0] ?? ''),
    images: p.images ?? (p.imageUrl ? [p.imageUrl] : []),
    title: p.title || '',
    description: p.description,
    tags: p.tags ?? [],
    materials: p.materials ?? [],
    featured: p.featured ?? false,
    order: p.order ?? 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt || p.createdAt,
  };
}

export const galleryService = {
  async getAll(): Promise<GalleryPost[]> {
    const posts = await galleryApi.getAll();
    return posts.map(toGalleryPost).sort((a, b) => a.order - b.order);
  },

  async getPublic(): Promise<GalleryPost[]> {
    const posts = await galleryApi.getPublic();
    return posts.map(toGalleryPost);
  },

  async getById(id: string): Promise<GalleryPost | undefined> {
    try {
      const post = await galleryApi.getById(id);
      return toGalleryPost(post);
    } catch {
      return undefined;
    }
  },

  async add(data: {
    title: string;
    description?: string;
    images: string[];
    tags?: string[];
    materials?: string[];
  }): Promise<GalleryPost> {
    const post = await galleryApi.create({
      title: data.title,
      description: data.description,
      images: data.images,
      tags: data.tags ?? [],
      materials: data.materials ?? [],
    });
    return toGalleryPost(post);
  },

  async update(
    id: string,
    data: Partial<Pick<GalleryPost, 'title' | 'description' | 'tags' | 'materials' | 'imageUrl' | 'images' | 'featured'>>,
  ): Promise<void> {
    await galleryApi.update(id, data);
  },

  async remove(id: string): Promise<void> {
    await galleryApi.delete(id);
  },

  async bulkRemove(ids: string[]): Promise<void> {
    await galleryApi.bulkDelete(ids);
  },

  async toggleFeatured(id: string): Promise<boolean> {
    const result = await galleryApi.toggleFeatured(id);
    return result.featured;
  },

  async moveImage(id: string, newIndex: number): Promise<void> {
    await galleryApi.updateOrder(id, newIndex);
  },

  async getAllTags(): Promise<string[]> {
    return galleryApi.getTags();
  },

  async getAllMaterials(): Promise<string[]> {
    return galleryApi.getMaterials();
  },

  async uploadImage(file: File): Promise<string> {
    const result = await galleryApi.uploadImage(file);
    return result.url;
  },
};
