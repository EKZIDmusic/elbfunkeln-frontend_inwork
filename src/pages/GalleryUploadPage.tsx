import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  X,
  ImagePlus,
  Trash2,
  Star,
  GripVertical,
  Pencil,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  LayoutList,
  Eye,
  Save,
  Search,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { galleryService, GalleryPost } from '../services/galleryService';
import { useRouter } from '../components/Router';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list';
type SortMode = 'order' | 'newest' | 'oldest' | 'featured';
type EditorView = 'overview' | 'create' | 'edit';

// Reusable pill chip with X button for easy removal
function RemovablePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-inter bg-white/60 backdrop-blur-sm text-elbfunkeln-green/70 border border-white/70 group/pill">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="p-0.5 rounded-full hover:bg-elbfunkeln-rose/15 hover:text-elbfunkeln-rose transition-colors"
        title={`${label} entfernen`}
      >
        <X size={10} />
      </button>
    </span>
  );
}

export function GalleryUploadPage() {
  const [editorView, setEditorView] = useState<EditorView>('overview');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('order');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');

  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allMaterials, setAllMaterials] = useState<string[]>([]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [editingPost, setEditingPost] = useState<GalleryPost | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formTagInput, setFormTagInput] = useState('');
  const [formMaterials, setFormMaterials] = useState<string[]>([]);
  const [formMaterialInput, setFormMaterialInput] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formFeatured, setFormFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { navigateTo } = useRouter();

  const refresh = useCallback(() => {
    setPosts(galleryService.getAll());
    setAllTags(galleryService.getAllTags());
    setAllMaterials(galleryService.getAllMaterials());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Form helpers ──
  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormTags([]);
    setFormTagInput('');
    setFormMaterials([]);
    setFormMaterialInput('');
    setFormImages([]);
    setFormFeatured(false);
    setEditingPost(null);
  };

  const openCreate = () => { resetForm(); setEditorView('create'); };

  const openEdit = (post: GalleryPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormDescription(post.description || '');
    setFormTags([...post.tags]);
    setFormTagInput('');
    setFormMaterials([...post.materials]);
    setFormMaterialInput('');
    setFormImages(post.images.length > 0 ? [...post.images] : [post.imageUrl]);
    setFormFeatured(post.featured);
    setEditorView('edit');
  };

  const backToOverview = () => { resetForm(); setEditorView('overview'); };

  // ── Image upload ──
  const handleFormFile = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) { toast.error('Bitte nur Bilddateien auswählen.'); return; }
    setUploading(true);
    try {
      const newImages: string[] = [];
      for (const file of imageFiles) {
        const compressed = await galleryService.compressImage(file);
        newImages.push(compressed);
      }
      setFormImages(prev => [...prev, ...newImages]);
    } catch {
      toast.error('Fehler beim Verarbeiten.');
    } finally {
      setUploading(false);
    }
  };

  const handleFormDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleFormDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleFormDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFormFile(e.dataTransfer.files);
  }, []);

  const removeFormImage = (index: number) => {
    setFormImages(prev => prev.filter((_, i) => i !== index));
  };

  // ── Tag & Material helpers ──
  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !formTags.includes(t)) setFormTags(prev => [...prev, t]);
  };

  const removeTag = (tag: string) => setFormTags(prev => prev.filter(t => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(formTagInput);
      setFormTagInput('');
    }
  };

  const addMaterial = (mat: string) => {
    const m = mat.trim();
    if (m && !formMaterials.includes(m)) setFormMaterials(prev => [...prev, m]);
  };

  const removeMaterial = (mat: string) => setFormMaterials(prev => prev.filter(m => m !== mat));

  const handleMaterialKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addMaterial(formMaterialInput);
      setFormMaterialInput('');
    }
  };

  // ── Save post ──
  const handleSave = () => {
    if (!formTitle.trim()) { toast.error('Bitte gib einen Titel ein.'); return; }
    if (formImages.length === 0) { toast.error('Bitte lade mindestens ein Bild hoch.'); return; }

    if (editorView === 'edit' && editingPost) {
      galleryService.update(editingPost.id, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        tags: formTags,
        materials: formMaterials,
        imageUrl: formImages[0],
        images: formImages,
        featured: formFeatured,
      });
      toast.success('Beitrag aktualisiert');
    } else {
      galleryService.add({
        imageUrl: formImages[0],
        images: formImages,
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        tags: formTags,
        materials: formMaterials,
      });
      toast.success('Beitrag erstellt');
    }
    refresh();
    backToOverview();
  };

  // ── Overview actions ──
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleToggleFeatured = (id: string) => {
    const is = galleryService.toggleFeatured(id);
    refresh();
    toast.success(is ? 'Als Highlight markiert' : 'Highlight entfernt');
  };

  const handleDelete = (id: string) => {
    galleryService.remove(id);
    refresh();
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    setConfirmDeleteId(null);
    toast.success('Beitrag entfernt');
  };

  const handleBulkDelete = () => {
    galleryService.bulkRemove(Array.from(selectedIds));
    refresh();
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
    toast.success(`${selectedIds.size} Beiträge entfernt`);
  };

  const handleMoveUp = (id: string) => {
    const idx = posts.findIndex(p => p.id === id);
    if (idx > 0) { galleryService.moveImage(id, idx - 1); refresh(); }
  };

  const handleMoveDown = (id: string) => {
    const idx = posts.findIndex(p => p.id === id);
    if (idx < posts.length - 1) { galleryService.moveImage(id, idx + 1); refresh(); }
  };

  // Drag reorder
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };
  const handleDragOverItem = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  };
  const handleDropItem = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== targetId) {
      const targetIdx = posts.findIndex(p => p.id === targetId);
      if (targetIdx !== -1) { galleryService.moveImage(sourceId, targetIdx); refresh(); }
    }
    setDragOverId(null);
    setDraggingId(null);
  };
  const handleDragEnd = () => { setDragOverId(null); setDraggingId(null); };

  // ── Filtering & sorting ──
  const filteredPosts = posts
    .filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !(p.description || '').toLowerCase().includes(q)) return false;
      }
      if (filterTag && !p.tags.includes(filterTag)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortMode) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'featured': return (a.featured === b.featured) ? a.order - b.order : a.featured ? -1 : 1;
        default: return a.order - b.order;
      }
    });

  const formatDate = (d: string) => new Date(d).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  // ════════════════════════════════════════
  //  CREATE / EDIT FORM
  // ════════════════════════════════════════
  if (editorView === 'create' || editorView === 'edit') {
    return (
      <div className="min-h-screen bg-elbfunkeln-beige pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <button type="button" onClick={backToOverview} className="flex items-center gap-1.5 font-inter text-sm text-elbfunkeln-green/50 hover:text-elbfunkeln-green mb-3 transition-colors">
              <ArrowLeft size={15} /> Zurück
            </button>
            <h1 className="font-cormorant text-3xl text-elbfunkeln-green">
              {editorView === 'edit' ? 'Beitrag bearbeiten' : 'Neuer Beitrag'}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/70 shadow-sm p-5 md:p-7 space-y-5"
          >
            {/* Image Upload — multi-image */}
            <div>
              <label className="font-inter text-sm font-medium text-elbfunkeln-green block mb-2">Bilder *</label>

              {/* Existing images grid */}
              {formImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                  {formImages.map((img, i) => (
                    <div key={i} className="relative group/img aspect-square rounded-xl overflow-hidden border border-white/60">
                      <img src={img} alt={`Bild ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-inter bg-elbfunkeln-green/80 text-white">Cover</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFormImage(i)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-elbfunkeln-rose"
                        title="Bild entfernen"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Add more */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-elbfunkeln-green/15 flex items-center justify-center hover:border-elbfunkeln-green/30 hover:bg-white/40 transition-all"
                    title="Weitere Bilder hinzufügen"
                  >
                    <Plus size={20} className="text-elbfunkeln-green/30" />
                  </button>
                </div>
              )}

              {/* Upload zone (when no images) */}
              {formImages.length === 0 && (
                <div
                  onDragOver={handleFormDragOver}
                  onDragLeave={handleFormDragLeave}
                  onDrop={handleFormDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragging
                      ? 'border-elbfunkeln-rose bg-elbfunkeln-rose/5'
                      : 'border-elbfunkeln-green/15 hover:border-elbfunkeln-green/30 hover:bg-white/40'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2.5 rounded-full ${isDragging ? 'bg-elbfunkeln-rose/15' : 'bg-white/60'}`}>
                      {uploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-elbfunkeln-green" />
                      ) : (
                        <ImagePlus size={24} className={isDragging ? 'text-elbfunkeln-rose' : 'text-elbfunkeln-green/40'} />
                      )}
                    </div>
                    <p className="font-inter text-xs text-elbfunkeln-green/40">Bilder hierhin ziehen oder klicken</p>
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple aria-label="Bilder auswählen" onChange={e => e.target.files && handleFormFile(e.target.files)} className="hidden" />
            </div>

            {/* Title */}
            <div>
              <label className="font-inter text-sm font-medium text-elbfunkeln-green block mb-1.5">Titel *</label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="z.B. Neue Kollektion, Werkstatt-Einblick..." className="border-white/60 bg-white/40 backdrop-blur-sm h-10" />
            </div>

            {/* Description */}
            <div>
              <label className="font-inter text-sm font-medium text-elbfunkeln-green block mb-1.5">Beschreibung</label>
              <textarea
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="Erzähle die Geschichte hinter diesem Bild..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-white/60 bg-white/40 backdrop-blur-sm font-inter text-sm text-elbfunkeln-green placeholder:text-elbfunkeln-green/30 focus:outline-none focus:ring-2 focus:ring-elbfunkeln-green/15 resize-none"
              />
            </div>

            {/* Tags — pill-based with easy removal */}
            <div>
              <label className="font-inter text-sm font-medium text-elbfunkeln-green block mb-1.5">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formTags.map(tag => (
                  <RemovablePill key={tag} label={tag} onRemove={() => removeTag(tag)} />
                ))}
              </div>
              <Input
                value={formTagInput}
                onChange={e => setFormTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Tag eingeben + Enter"
                className="border-white/60 bg-white/40 backdrop-blur-sm h-9 text-sm"
              />
              {allTags.filter(t => !formTags.includes(t)).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {allTags.filter(t => !formTags.includes(t)).map(tag => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => addTag(tag)}
                      className="px-2 py-0.5 rounded-full text-[10px] font-inter bg-white/40 text-elbfunkeln-green/40 hover:bg-white/60 hover:text-elbfunkeln-green/60 transition-colors border border-white/50"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Materials — pill-based with easy removal */}
            <div>
              <label className="font-inter text-sm font-medium text-elbfunkeln-green block mb-1.5">Materialien</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formMaterials.map(mat => (
                  <RemovablePill key={mat} label={mat} onRemove={() => removeMaterial(mat)} />
                ))}
              </div>
              <Input
                value={formMaterialInput}
                onChange={e => setFormMaterialInput(e.target.value)}
                onKeyDown={handleMaterialKeyDown}
                placeholder="Material eingeben + Enter"
                className="border-white/60 bg-white/40 backdrop-blur-sm h-9 text-sm"
              />
              {allMaterials.filter(m => !formMaterials.includes(m)).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {allMaterials.filter(m => !formMaterials.includes(m)).map(mat => (
                    <button
                      type="button"
                      key={mat}
                      onClick={() => addMaterial(mat)}
                      className="px-2 py-0.5 rounded-full text-[10px] font-inter bg-white/40 text-elbfunkeln-green/40 hover:bg-white/60 hover:text-elbfunkeln-green/60 transition-colors border border-white/50 italic"
                    >
                      + {mat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-3 py-1">
              <button
                type="button"
                onClick={() => setFormFeatured(!formFeatured)}
                title={formFeatured ? 'Highlight entfernen' : 'Als Highlight markieren'}
                className={`p-2 rounded-xl transition-colors ${
                  formFeatured ? 'bg-yellow-50 text-yellow-500' : 'bg-white/40 text-elbfunkeln-green/30 hover:text-yellow-500'
                }`}
              >
                <Star size={18} fill={formFeatured ? 'currentColor' : 'none'} />
              </button>
              <div>
                <p className="font-inter text-sm text-elbfunkeln-green">{formFeatured ? 'Highlight-Beitrag' : 'Als Highlight markieren'}</p>
                <p className="font-inter text-[11px] text-elbfunkeln-green/30">Highlights werden prominent angezeigt</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-3 border-t border-white/40">
              <Button onClick={handleSave} disabled={uploading} className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white flex-1 h-10 rounded-xl">
                {editorView === 'edit' ? (
                  <><Save size={15} className="mr-1.5" /> Speichern</>
                ) : (
                  <><Upload size={15} className="mr-1.5" /> Veröffentlichen</>
                )}
              </Button>
              <Button variant="outline" onClick={backToOverview} className="border-white/60 text-elbfunkeln-green h-10 rounded-xl bg-white/30 backdrop-blur-sm">
                Abbrechen
              </Button>
            </div>

            {/* Meta info */}
            {editorView === 'edit' && editingPost && (
              <div className="pt-2 border-t border-white/40">
                <div className="flex items-center gap-4 font-inter text-[11px] text-elbfunkeln-green/30">
                  <span className="flex items-center gap-1"><Clock size={11} /> Erstellt: {formatDate(editingPost.createdAt)}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 size={11} /> Bearbeitet: {formatDate(editingPost.updatedAt)}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  //  OVERVIEW — same glass design as gallery, no animation
  // ════════════════════════════════════════
  return (
    <div className="min-h-screen bg-elbfunkeln-beige pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="font-cormorant text-3xl md:text-4xl text-elbfunkeln-green mb-1">Galerie-Editor</h1>
              <p className="font-inter text-elbfunkeln-green/50 text-sm">
                {posts.length} {posts.length === 1 ? 'Beitrag' : 'Beiträge'}
                {posts.filter(p => p.featured).length > 0 && (
                  <> &middot; {posts.filter(p => p.featured).length} Highlights</>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigateTo('gallery')} className="border-white/60 bg-white/40 backdrop-blur-sm text-elbfunkeln-green hover:bg-elbfunkeln-green hover:text-white h-9 text-sm rounded-xl">
                <Eye size={15} className="mr-1.5" /> Galerie
              </Button>
              <Button onClick={openCreate} className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white h-9 text-sm rounded-xl">
                <Plus size={15} className="mr-1.5" /> Neuer Beitrag
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Toolbar — glass */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 p-3 mb-5 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-elbfunkeln-green/30" />
              <Input placeholder="Suchen..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 border-white/50 bg-white/40 backdrop-blur-sm text-sm rounded-xl" />
            </div>

            <div className="flex items-center gap-2">
              {allTags.length > 0 && (
                <select value={filterTag} onChange={e => setFilterTag(e.target.value)} aria-label="Tag-Filter" className="h-9 px-2.5 rounded-xl border border-white/50 bg-white/40 backdrop-blur-sm text-sm text-elbfunkeln-green font-inter focus:outline-none focus:ring-2 focus:ring-elbfunkeln-green/15">
                  <option value="">Alle Tags</option>
                  {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              )}

              <select value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)} aria-label="Sortierung" className="h-9 px-2.5 rounded-xl border border-white/50 bg-white/40 backdrop-blur-sm text-sm text-elbfunkeln-green font-inter focus:outline-none focus:ring-2 focus:ring-elbfunkeln-green/15">
                <option value="order">Reihenfolge</option>
                <option value="newest">Neueste</option>
                <option value="oldest">Älteste</option>
                <option value="featured">Highlights</option>
              </select>

              <div className="flex items-center border border-white/50 rounded-xl overflow-hidden bg-white/30 backdrop-blur-sm">
                <button type="button" onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-elbfunkeln-green text-white' : 'text-elbfunkeln-green/35 hover:bg-white/40'}`} title="Rasteransicht">
                  <LayoutGrid size={16} />
                </button>
                <button type="button" onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-elbfunkeln-green text-white' : 'text-elbfunkeln-green/35 hover:bg-white/40'}`} title="Listenansicht">
                  <LayoutList size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk actions */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap items-center gap-2 pt-2.5 mt-2.5 border-t border-white/40">
                  <span className="font-inter text-sm text-elbfunkeln-green mr-1">{selectedIds.size} ausgewählt:</span>
                  <Button
                    size="sm" variant="outline"
                    onClick={() => {
                      selectedIds.forEach(id => {
                        const p = posts.find(x => x.id === id);
                        if (p && !p.featured) galleryService.toggleFeatured(id);
                      });
                      refresh(); setSelectedIds(new Set());
                      toast.success('Als Highlights markiert');
                    }}
                    className="border-white/50 bg-white/30 text-elbfunkeln-green h-7 text-xs px-2.5 rounded-lg"
                  >
                    <Star size={11} className="mr-1" /> Highlight
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmBulkDelete(true)} className="border-elbfunkeln-rose/30 text-elbfunkeln-rose h-7 text-xs px-2.5 rounded-lg hover:bg-elbfunkeln-rose hover:text-white">
                    <Trash2 size={11} className="mr-1" /> Löschen
                  </Button>
                  <button type="button" onClick={() => setSelectedIds(new Set())} className="font-inter text-xs text-elbfunkeln-green/35 hover:text-elbfunkeln-green ml-1">Aufheben</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Grid View — 4 columns matching gallery ── */}
        {viewMode === 'grid' && filteredPosts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: draggingId === post.id ? 0.5 : 1,
                  scale: dragOverId === post.id ? 1.02 : 1,
                  y: 0,
                }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                draggable={sortMode === 'order'}
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, post.id)}
                onDragOver={(e) => handleDragOverItem(e as unknown as React.DragEvent, post.id)}
                onDrop={(e) => handleDropItem(e as unknown as React.DragEvent, post.id)}
                onDragEnd={handleDragEnd}
              >
                <div
                  className={`overflow-hidden rounded-2xl bg-white/40 backdrop-blur-xl border group cursor-pointer transition-all duration-200 ${
                    selectedIds.has(post.id)
                      ? 'border-elbfunkeln-green ring-1 ring-elbfunkeln-green shadow-md'
                      : dragOverId === post.id
                        ? 'border-elbfunkeln-lavender ring-1 ring-elbfunkeln-lavender'
                        : 'border-white/60 hover:shadow-lg hover:bg-white/50'
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden" onClick={() => openEdit(post)}>
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

                    {/* Select & featured */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between">
                      <button type="button" onClick={(e) => { e.stopPropagation(); toggleSelect(post.id); }} title="Auswählen" className={`p-1 rounded-full transition-all ${selectedIds.has(post.id) ? 'bg-elbfunkeln-green text-white' : 'bg-white/70 backdrop-blur-sm text-elbfunkeln-green/40 opacity-0 group-hover:opacity-100'}`}>
                        <CheckCircle2 size={14} />
                      </button>
                      {post.featured && (
                        <div className="bg-yellow-400 text-white p-1 rounded-full shadow-sm"><Star size={10} fill="currentColor" /></div>
                      )}
                    </div>

                    {/* Multi-image dots */}
                    {post.images.length > 1 && (
                      <div className="absolute top-2.5 right-2.5 bg-black/20 backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-0.5">
                        {post.images.slice(0, 4).map((_, i) => (
                          <Circle key={i} size={4} fill="white" className="text-white/80" />
                        ))}
                      </div>
                    )}

                    {/* Hover actions */}
                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleFeatured(post.id); }} className="p-1 bg-white/80 backdrop-blur-sm rounded-full text-elbfunkeln-green hover:bg-white" title={post.featured ? 'Highlight entfernen' : 'Als Highlight'}>
                        <Star size={12} fill={post.featured ? 'currentColor' : 'none'} className={post.featured ? 'text-yellow-500' : ''} />
                      </button>
                      {sortMode === 'order' && (
                        <>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveUp(post.id); }} className="p-1 bg-white/80 backdrop-blur-sm rounded-full text-elbfunkeln-green hover:bg-white" title="Nach oben"><ChevronUp size={12} /></button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveDown(post.id); }} className="p-1 bg-white/80 backdrop-blur-sm rounded-full text-elbfunkeln-green hover:bg-white" title="Nach unten"><ChevronDown size={12} /></button>
                        </>
                      )}
                      <button type="button" onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(post.id); }} className="p-1 bg-white/80 backdrop-blur-sm rounded-full text-elbfunkeln-rose hover:bg-white" title="Löschen">
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {sortMode === 'order' && (
                      <div className="absolute top-1/2 left-1.5 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab">
                        <GripVertical size={16} className="text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>

                  {/* Content — glass bottom bar */}
                  <div className="px-3 py-2.5 bg-white/30 backdrop-blur-sm" onClick={() => openEdit(post)}>
                    <h3 className="font-cormorant text-sm text-elbfunkeln-green leading-snug truncate">{post.title}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex gap-1">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 rounded-full text-[9px] font-inter bg-white/50 text-elbfunkeln-green/40 border border-white/60">{tag}</span>
                        ))}
                      </div>
                      <span className="font-inter text-[9px] text-elbfunkeln-green/25">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── List View ── */}
        {viewMode === 'list' && filteredPosts.length > 0 && (
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 overflow-hidden shadow-sm divide-y divide-white/40">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.2) }}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-white/30 transition-colors ${selectedIds.has(post.id) ? 'bg-white/40' : ''}`}
                onClick={() => openEdit(post)}
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  {sortMode === 'order' && <GripVertical size={14} className="text-elbfunkeln-green/20 cursor-grab" />}
                  <button type="button" onClick={e => { e.stopPropagation(); toggleSelect(post.id); }} title="Auswählen" className={`p-0.5 rounded transition-colors ${selectedIds.has(post.id) ? 'text-elbfunkeln-green' : 'text-elbfunkeln-green/25 hover:text-elbfunkeln-green'}`}>
                    <CheckCircle2 size={15} />
                  </button>
                </div>

                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/50">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="font-cormorant text-base text-elbfunkeln-green truncate">{post.title}</p>
                    {post.featured && <Star size={11} className="text-yellow-500 shrink-0" fill="currentColor" />}
                    {post.images.length > 1 && <span className="font-inter text-[10px] text-elbfunkeln-green/25">{post.images.length} Bilder</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 rounded-full text-[10px] font-inter bg-white/50 text-elbfunkeln-green/35 border border-white/60">{tag}</span>
                    ))}
                    <span className="font-inter text-[10px] text-elbfunkeln-green/25">{formatDate(post.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button type="button" onClick={e => { e.stopPropagation(); openEdit(post); }} className="p-1.5 rounded-lg text-elbfunkeln-green/30 hover:text-elbfunkeln-green hover:bg-white/40 transition-colors" title="Bearbeiten"><Pencil size={14} /></button>
                  <button type="button" onClick={e => { e.stopPropagation(); handleToggleFeatured(post.id); }} className={`p-1.5 rounded-lg transition-colors ${post.featured ? 'text-yellow-500' : 'text-elbfunkeln-green/25 hover:text-yellow-500'}`} title="Highlight"><Star size={14} fill={post.featured ? 'currentColor' : 'none'} /></button>
                  {sortMode === 'order' && (
                    <>
                      <button type="button" onClick={e => { e.stopPropagation(); handleMoveUp(post.id); }} disabled={index === 0} className="p-1.5 rounded-lg text-elbfunkeln-green/30 hover:text-elbfunkeln-green transition-colors disabled:opacity-20" title="Hoch"><ChevronUp size={14} /></button>
                      <button type="button" onClick={e => { e.stopPropagation(); handleMoveDown(post.id); }} disabled={index === filteredPosts.length - 1} className="p-1.5 rounded-lg text-elbfunkeln-green/30 hover:text-elbfunkeln-green transition-colors disabled:opacity-20" title="Runter"><ChevronDown size={14} /></button>
                    </>
                  )}
                  <button type="button" onClick={e => { e.stopPropagation(); setConfirmDeleteId(post.id); }} className="p-1.5 rounded-lg text-elbfunkeln-green/25 hover:text-elbfunkeln-rose transition-colors" title="Löschen"><Trash2 size={14} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty states */}
        {filteredPosts.length === 0 && (searchQuery || filterTag) && (
          <div className="text-center py-14">
            <Search size={28} className="mx-auto text-elbfunkeln-green/15 mb-3" />
            <p className="font-inter text-sm text-elbfunkeln-green/40">Keine Beiträge gefunden.</p>
          </div>
        )}

        {posts.length === 0 && (
          <div className="text-center py-14">
            <ImagePlus size={40} className="mx-auto text-elbfunkeln-green/15 mb-3" />
            <p className="font-inter text-sm text-elbfunkeln-green/40 mb-4">Noch keine Beiträge vorhanden.</p>
            <Button onClick={openCreate} className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white h-9 text-sm rounded-xl">
              <Plus size={15} className="mr-1.5" /> Ersten Beitrag erstellen
            </Button>
          </div>
        )}
      </div>

      {/* Delete confirmation — glass modal */}
      <AnimatePresence>
        {(confirmDeleteId || confirmBulkDelete) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => { setConfirmDeleteId(null); setConfirmBulkDelete(false); }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/60 p-5 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-1.5">
                {confirmBulkDelete ? `${selectedIds.size} Beiträge löschen?` : 'Beitrag löschen?'}
              </h3>
              <p className="font-inter text-sm text-elbfunkeln-green/50 mb-5">
                {confirmBulkDelete ? 'Die ausgewählten Beiträge werden unwiderruflich entfernt.' : 'Dieser Beitrag wird unwiderruflich entfernt.'}
              </p>
              <div className="flex gap-2.5 justify-end">
                <Button variant="outline" onClick={() => { setConfirmDeleteId(null); setConfirmBulkDelete(false); }} className="border-white/60 text-elbfunkeln-green h-9 rounded-xl bg-white/30">
                  Abbrechen
                </Button>
                <Button onClick={() => { if (confirmBulkDelete) handleBulkDelete(); else if (confirmDeleteId) handleDelete(confirmDeleteId); }} className="bg-elbfunkeln-rose hover:bg-elbfunkeln-rose/80 text-white h-9 rounded-xl">
                  <Trash2 size={13} className="mr-1" /> Löschen
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
