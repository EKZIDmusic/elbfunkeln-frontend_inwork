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

function RemovablePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-inter bg-elbfunkeln-green/8 text-elbfunkeln-green/70 border border-elbfunkeln-green/10">
      {label}
      <button type="button" onClick={onRemove} className="p-0.5 rounded-full hover:bg-elbfunkeln-rose/15 hover:text-elbfunkeln-rose transition-colors" title={`${label} entfernen`}>
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

  const resetForm = () => {
    setFormTitle(''); setFormDescription(''); setFormTags([]); setFormTagInput('');
    setFormMaterials([]); setFormMaterialInput(''); setFormImages([]);
    setFormFeatured(false); setEditingPost(null);
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

  // Image upload
  const handleFormFile = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) { toast.error('Bitte nur Bilddateien.'); return; }
    setUploading(true);
    try {
      const newImages: string[] = [];
      for (const file of imageFiles) {
        newImages.push(await galleryService.compressImage(file));
      }
      setFormImages(prev => [...prev, ...newImages]);
    } catch { toast.error('Fehler beim Verarbeiten.'); }
    finally { setUploading(false); }
  };

  const handleFormDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleFormDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleFormDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFormFile(e.dataTransfer.files);
  }, []);

  const removeFormImage = (index: number) => setFormImages(prev => prev.filter((_, i) => i !== index));

  // Tags & Materials
  const addTag = (tag: string) => { const t = tag.trim(); if (t && !formTags.includes(t)) setFormTags(prev => [...prev, t]); };
  const removeTag = (tag: string) => setFormTags(prev => prev.filter(t => t !== tag));
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(formTagInput); setFormTagInput(''); }
  };
  const addMaterial = (mat: string) => { const m = mat.trim(); if (m && !formMaterials.includes(m)) setFormMaterials(prev => [...prev, m]); };
  const removeMaterial = (mat: string) => setFormMaterials(prev => prev.filter(m => m !== mat));
  const handleMaterialKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addMaterial(formMaterialInput); setFormMaterialInput(''); }
  };

  // Save
  const handleSave = () => {
    if (!formTitle.trim()) { toast.error('Bitte gib einen Titel ein.'); return; }
    if (formImages.length === 0) { toast.error('Bitte lade mindestens ein Bild hoch.'); return; }

    if (editorView === 'edit' && editingPost) {
      galleryService.update(editingPost.id, {
        title: formTitle.trim(), description: formDescription.trim() || undefined,
        tags: formTags, materials: formMaterials,
        imageUrl: formImages[0], images: formImages, featured: formFeatured,
      });
      toast.success('Beitrag aktualisiert');
    } else {
      galleryService.add({
        imageUrl: formImages[0], images: formImages, title: formTitle.trim(),
        description: formDescription.trim() || undefined, tags: formTags, materials: formMaterials,
      });
      toast.success('Beitrag erstellt');
    }
    refresh(); backToOverview();
  };

  // Delete from edit view
  const handleDeleteFromEdit = () => {
    if (editingPost) {
      galleryService.remove(editingPost.id);
      refresh();
      toast.success('Beitrag entfernt');
      backToOverview();
    }
  };

  // Overview actions
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const handleToggleFeatured = (id: string) => {
    const is = galleryService.toggleFeatured(id); refresh();
    toast.success(is ? 'Highlight markiert' : 'Highlight entfernt');
  };
  const handleDelete = (id: string) => {
    galleryService.remove(id); refresh();
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    setConfirmDeleteId(null); toast.success('Beitrag entfernt');
  };
  const handleBulkDelete = () => {
    galleryService.bulkRemove(Array.from(selectedIds)); refresh();
    setSelectedIds(new Set()); setConfirmBulkDelete(false);
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
  const handleDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; setDraggingId(id); };
  const handleDragOverItem = (e: React.DragEvent, id: string) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverId(id); };
  const handleDropItem = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== targetId) {
      const targetIdx = posts.findIndex(p => p.id === targetId);
      if (targetIdx !== -1) { galleryService.moveImage(sourceId, targetIdx); refresh(); }
    }
    setDragOverId(null); setDraggingId(null);
  };
  const handleDragEnd = () => { setDragOverId(null); setDraggingId(null); };

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

  const formatDate = (d: string) => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // ════════════════════════════════════════
  //  CREATE / EDIT — Modern two-column layout
  // ════════════════════════════════════════
  if (editorView === 'create' || editorView === 'edit') {
    return (
      <div className="min-h-screen bg-elbfunkeln-beige pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header bar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button type="button" onClick={backToOverview} className="p-2 rounded-xl bg-white border border-elbfunkeln-green/10 text-elbfunkeln-green/50 hover:text-elbfunkeln-green hover:border-elbfunkeln-green/20 transition-all" title="Zurück">
                <ArrowLeft size={16} />
              </button>
              <h1 className="font-cormorant text-2xl text-elbfunkeln-green">
                {editorView === 'edit' ? 'Beitrag bearbeiten' : 'Neuer Beitrag'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {editorView === 'edit' && editingPost && (
                <Button variant="outline" onClick={() => setConfirmDeleteId(editingPost.id)} className="border-elbfunkeln-rose/20 text-elbfunkeln-rose hover:bg-elbfunkeln-rose hover:text-white h-9 text-sm rounded-xl">
                  <Trash2 size={14} className="mr-1.5" /> Löschen
                </Button>
              )}
              <Button onClick={handleSave} disabled={uploading} className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white h-9 text-sm rounded-xl">
                {editorView === 'edit' ? <><Save size={14} className="mr-1.5" /> Speichern</> : <><Upload size={14} className="mr-1.5" /> Veröffentlichen</>}
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
              {/* Left column — Images */}
              <div className="md:col-span-3 space-y-4">
                <div className="bg-white rounded-2xl border border-elbfunkeln-green/8 p-4">
                  <label className="font-inter text-xs font-medium text-elbfunkeln-green/60 uppercase tracking-wider block mb-3">Bilder</label>

                  {formImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {formImages.map((img, i) => (
                        <div key={i} className="relative group/img aspect-square rounded-xl overflow-hidden border border-elbfunkeln-green/8">
                          <img src={img} alt={`Bild ${i + 1}`} className="w-full h-full object-cover" />
                          {i === 0 && <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-inter bg-elbfunkeln-green text-white">Cover</span>}
                          <button type="button" onClick={() => removeFormImage(i)} className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-elbfunkeln-rose" title="Entfernen">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-elbfunkeln-green/10 flex items-center justify-center hover:border-elbfunkeln-green/25 transition-colors" title="Weitere Bilder">
                        <Plus size={18} className="text-elbfunkeln-green/25" />
                      </button>
                    </div>
                  )}

                  {formImages.length === 0 && (
                    <div
                      onDragOver={handleFormDragOver} onDragLeave={handleFormDragLeave} onDrop={handleFormDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragging ? 'border-elbfunkeln-rose bg-elbfunkeln-rose/5' : 'border-elbfunkeln-green/10 hover:border-elbfunkeln-green/25'}`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {uploading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-elbfunkeln-green" />
                        ) : (
                          <ImagePlus size={28} className="text-elbfunkeln-green/25" />
                        )}
                        <p className="font-inter text-xs text-elbfunkeln-green/35">Bilder hierhin ziehen oder klicken</p>
                      </div>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" multiple aria-label="Bilder auswählen" onChange={e => e.target.files && handleFormFile(e.target.files)} className="hidden" />
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl border border-elbfunkeln-green/8 p-4">
                  <label className="font-inter text-xs font-medium text-elbfunkeln-green/60 uppercase tracking-wider block mb-2">Beschreibung</label>
                  <textarea
                    value={formDescription} onChange={e => setFormDescription(e.target.value)}
                    placeholder="Erzähle die Geschichte hinter diesem Bild..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl border border-elbfunkeln-green/8 bg-elbfunkeln-beige/30 font-inter text-sm text-elbfunkeln-green placeholder:text-elbfunkeln-green/25 focus:outline-none focus:ring-2 focus:ring-elbfunkeln-green/10 resize-none"
                  />
                </div>
              </div>

              {/* Right column — Meta */}
              <div className="md:col-span-2 space-y-4">
                {/* Title */}
                <div className="bg-white rounded-2xl border border-elbfunkeln-green/8 p-4">
                  <label className="font-inter text-xs font-medium text-elbfunkeln-green/60 uppercase tracking-wider block mb-2">Titel *</label>
                  <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="z.B. Neue Kollektion..." className="border-elbfunkeln-green/8 bg-elbfunkeln-beige/30 h-10 rounded-xl" />
                </div>

                {/* Tags */}
                <div className="bg-white rounded-2xl border border-elbfunkeln-green/8 p-4">
                  <label className="font-inter text-xs font-medium text-elbfunkeln-green/60 uppercase tracking-wider block mb-2">Tags</label>
                  {formTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {formTags.map(tag => <RemovablePill key={tag} label={tag} onRemove={() => removeTag(tag)} />)}
                    </div>
                  )}
                  <Input value={formTagInput} onChange={e => setFormTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Enter zum Hinzufügen" className="border-elbfunkeln-green/8 bg-elbfunkeln-beige/30 h-9 text-sm rounded-xl" />
                  {allTags.filter(t => !formTags.includes(t)).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {allTags.filter(t => !formTags.includes(t)).slice(0, 8).map(tag => (
                        <button type="button" key={tag} onClick={() => addTag(tag)} className="px-2 py-0.5 rounded-full text-[10px] font-inter text-elbfunkeln-green/35 hover:text-elbfunkeln-green/60 hover:bg-elbfunkeln-green/5 transition-colors">
                          + {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Materials */}
                <div className="bg-white rounded-2xl border border-elbfunkeln-green/8 p-4">
                  <label className="font-inter text-xs font-medium text-elbfunkeln-green/60 uppercase tracking-wider block mb-2">Materialien</label>
                  {formMaterials.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {formMaterials.map(mat => <RemovablePill key={mat} label={mat} onRemove={() => removeMaterial(mat)} />)}
                    </div>
                  )}
                  <Input value={formMaterialInput} onChange={e => setFormMaterialInput(e.target.value)} onKeyDown={handleMaterialKeyDown} placeholder="Enter zum Hinzufügen" className="border-elbfunkeln-green/8 bg-elbfunkeln-beige/30 h-9 text-sm rounded-xl" />
                  {allMaterials.filter(m => !formMaterials.includes(m)).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {allMaterials.filter(m => !formMaterials.includes(m)).slice(0, 6).map(mat => (
                        <button type="button" key={mat} onClick={() => addMaterial(mat)} className="px-2 py-0.5 rounded-full text-[10px] font-inter text-elbfunkeln-green/35 hover:text-elbfunkeln-green/60 hover:bg-elbfunkeln-green/5 transition-colors italic">
                          + {mat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Featured & Meta */}
                <div className="bg-white rounded-2xl border border-elbfunkeln-green/8 p-4">
                  <button
                    type="button" onClick={() => setFormFeatured(!formFeatured)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors ${formFeatured ? 'bg-yellow-50' : 'hover:bg-elbfunkeln-beige/30'}`}
                  >
                    <Star size={18} fill={formFeatured ? 'currentColor' : 'none'} className={formFeatured ? 'text-yellow-500' : 'text-elbfunkeln-green/25'} />
                    <div className="text-left">
                      <p className="font-inter text-sm text-elbfunkeln-green">{formFeatured ? 'Highlight aktiv' : 'Als Highlight'}</p>
                      <p className="font-inter text-[10px] text-elbfunkeln-green/30">Wird prominent angezeigt</p>
                    </div>
                  </button>

                  {editorView === 'edit' && editingPost && (
                    <div className="mt-3 pt-3 border-t border-elbfunkeln-green/6">
                      <div className="flex items-center gap-3 font-inter text-[10px] text-elbfunkeln-green/30">
                        <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(editingPost.createdAt)}</span>
                        <span className="flex items-center gap-1"><CheckCircle2 size={10} /> {formatDate(editingPost.updatedAt)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Delete confirmation (shared) */}
        <AnimatePresence>
          {confirmDeleteId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmDeleteId(null)}>
              <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-1.5">Beitrag löschen?</h3>
                <p className="font-inter text-sm text-elbfunkeln-green/50 mb-5">Dieser Beitrag wird unwiderruflich entfernt.</p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setConfirmDeleteId(null)} className="border-elbfunkeln-green/10 text-elbfunkeln-green h-9 rounded-xl">Abbrechen</Button>
                  <Button onClick={() => { if (editorView === 'edit') handleDeleteFromEdit(); else { handleDelete(confirmDeleteId); } }} className="bg-elbfunkeln-rose hover:bg-elbfunkeln-rose/80 text-white h-9 rounded-xl">
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

  // ════════════════════════════════════════
  //  OVERVIEW
  // ════════════════════════════════════════
  return (
    <div className="min-h-screen bg-elbfunkeln-beige pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="font-cormorant text-3xl md:text-4xl text-elbfunkeln-green mb-1">Galerie-Editor</h1>
              <p className="font-inter text-elbfunkeln-green/50 text-sm">
                {posts.length} {posts.length === 1 ? 'Beitrag' : 'Beiträge'}
                {posts.filter(p => p.featured).length > 0 && <> &middot; {posts.filter(p => p.featured).length} Highlights</>}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigateTo('gallery')} className="border-elbfunkeln-green/15 text-elbfunkeln-green hover:bg-elbfunkeln-green hover:text-white h-9 text-sm rounded-xl">
                <Eye size={15} className="mr-1.5" /> Galerie
              </Button>
              <Button onClick={openCreate} className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white h-9 text-sm rounded-xl">
                <Plus size={15} className="mr-1.5" /> Neuer Beitrag
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Toolbar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="bg-white rounded-2xl border border-elbfunkeln-green/8 p-3 mb-5">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-elbfunkeln-green/25" />
              <Input placeholder="Suchen..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 border-elbfunkeln-green/8 text-sm rounded-xl" />
            </div>
            <div className="flex items-center gap-2">
              {allTags.length > 0 && (
                <select value={filterTag} onChange={e => setFilterTag(e.target.value)} aria-label="Tag-Filter" className="h-9 px-2.5 rounded-xl border border-elbfunkeln-green/8 bg-white text-sm text-elbfunkeln-green font-inter">
                  <option value="">Alle Tags</option>
                  {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              )}
              <select value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)} aria-label="Sortierung" className="h-9 px-2.5 rounded-xl border border-elbfunkeln-green/8 bg-white text-sm text-elbfunkeln-green font-inter">
                <option value="order">Reihenfolge</option>
                <option value="newest">Neueste</option>
                <option value="oldest">Älteste</option>
                <option value="featured">Highlights</option>
              </select>
              <div className="flex border border-elbfunkeln-green/8 rounded-xl overflow-hidden">
                <button type="button" onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-elbfunkeln-green text-white' : 'text-elbfunkeln-green/30 hover:bg-elbfunkeln-green/5'}`} title="Raster"><LayoutGrid size={16} /></button>
                <button type="button" onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-elbfunkeln-green text-white' : 'text-elbfunkeln-green/30 hover:bg-elbfunkeln-green/5'}`} title="Liste"><LayoutList size={16} /></button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap items-center gap-2 pt-2.5 mt-2.5 border-t border-elbfunkeln-green/6">
                  <span className="font-inter text-sm text-elbfunkeln-green mr-1">{selectedIds.size} ausgewählt:</span>
                  <Button size="sm" variant="outline" onClick={() => { selectedIds.forEach(id => { const p = posts.find(x => x.id === id); if (p && !p.featured) galleryService.toggleFeatured(id); }); refresh(); setSelectedIds(new Set()); toast.success('Highlights markiert'); }} className="border-elbfunkeln-green/10 text-elbfunkeln-green h-7 text-xs px-2.5 rounded-lg">
                    <Star size={11} className="mr-1" /> Highlight
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmBulkDelete(true)} className="border-elbfunkeln-rose/20 text-elbfunkeln-rose h-7 text-xs px-2.5 rounded-lg hover:bg-elbfunkeln-rose hover:text-white">
                    <Trash2 size={11} className="mr-1" /> Löschen
                  </Button>
                  <button type="button" onClick={() => setSelectedIds(new Set())} className="font-inter text-xs text-elbfunkeln-green/30 hover:text-elbfunkeln-green ml-1">Aufheben</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Grid — 4 columns, uniform cards */}
        {viewMode === 'grid' && filteredPosts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id} layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: draggingId === post.id ? 0.5 : 1, scale: dragOverId === post.id ? 1.02 : 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                draggable={sortMode === 'order'}
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, post.id)}
                onDragOver={(e) => handleDragOverItem(e as unknown as React.DragEvent, post.id)}
                onDrop={(e) => handleDropItem(e as unknown as React.DragEvent, post.id)}
                onDragEnd={handleDragEnd}
              >
                <div className={`overflow-hidden rounded-2xl bg-white border group cursor-pointer transition-all duration-200 ${
                  selectedIds.has(post.id) ? 'border-elbfunkeln-green ring-1 ring-elbfunkeln-green' : dragOverId === post.id ? 'border-elbfunkeln-lavender' : 'border-elbfunkeln-green/8 hover:shadow-md'
                }`}>
                  <div className="relative aspect-square overflow-hidden" onClick={() => openEdit(post)}>
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

                    <div className="absolute top-2 left-2 right-2 flex justify-between">
                      <button type="button" onClick={(e) => { e.stopPropagation(); toggleSelect(post.id); }} title="Auswählen" className={`p-1 rounded-full transition-all ${selectedIds.has(post.id) ? 'bg-elbfunkeln-green text-white' : 'bg-white/80 text-elbfunkeln-green/40 opacity-0 group-hover:opacity-100'}`}>
                        <CheckCircle2 size={14} />
                      </button>
                      {post.featured && <div className="bg-yellow-400 text-white p-1 rounded-full"><Star size={10} fill="currentColor" /></div>}
                    </div>

                    {post.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/25 backdrop-blur-md rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                        {post.images.slice(0, 4).map((_, i) => <Circle key={i} size={3} fill="white" className="text-white/80" />)}
                      </div>
                    )}

                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleFeatured(post.id); }} className="p-1 bg-white/90 rounded-full text-elbfunkeln-green hover:bg-white" title="Highlight"><Star size={12} fill={post.featured ? 'currentColor' : 'none'} className={post.featured ? 'text-yellow-500' : ''} /></button>
                      {sortMode === 'order' && (
                        <>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveUp(post.id); }} className="p-1 bg-white/90 rounded-full text-elbfunkeln-green hover:bg-white" title="Hoch"><ChevronUp size={12} /></button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveDown(post.id); }} className="p-1 bg-white/90 rounded-full text-elbfunkeln-green hover:bg-white" title="Runter"><ChevronDown size={12} /></button>
                        </>
                      )}
                      <button type="button" onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(post.id); }} className="p-1 bg-white/90 rounded-full text-elbfunkeln-rose hover:bg-white" title="Löschen"><Trash2 size={12} /></button>
                    </div>

                    {sortMode === 'order' && <div className="absolute top-1/2 left-1.5 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab"><GripVertical size={16} className="text-white drop-shadow-md" /></div>}
                  </div>

                  {/* Title — fixed height for uniformity */}
                  <div className="px-3 py-2 h-11 flex items-center" onClick={() => openEdit(post)}>
                    <h3 className="font-cormorant text-sm text-elbfunkeln-green leading-tight truncate w-full">{post.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* List */}
        {viewMode === 'list' && filteredPosts.length > 0 && (
          <div className="bg-white rounded-2xl border border-elbfunkeln-green/8 overflow-hidden divide-y divide-elbfunkeln-green/5">
            {filteredPosts.map((post, index) => (
              <motion.div key={post.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.2) }}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-elbfunkeln-beige/30 transition-colors ${selectedIds.has(post.id) ? 'bg-elbfunkeln-beige/40' : ''}`}
                onClick={() => openEdit(post)}
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  {sortMode === 'order' && <GripVertical size={14} className="text-elbfunkeln-green/15 cursor-grab" />}
                  <button type="button" onClick={e => { e.stopPropagation(); toggleSelect(post.id); }} title="Auswählen" className={`p-0.5 rounded ${selectedIds.has(post.id) ? 'text-elbfunkeln-green' : 'text-elbfunkeln-green/20 hover:text-elbfunkeln-green'}`}>
                    <CheckCircle2 size={15} />
                  </button>
                </div>

                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-elbfunkeln-green/6">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-cormorant text-base text-elbfunkeln-green truncate">{post.title}</p>
                    {post.featured && <Star size={11} className="text-yellow-500 shrink-0" fill="currentColor" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {post.tags.slice(0, 2).map(tag => <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-inter bg-elbfunkeln-green/5 text-elbfunkeln-green/35">{tag}</span>)}
                    <span className="font-inter text-[10px] text-elbfunkeln-green/20">{formatDate(post.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button type="button" onClick={e => { e.stopPropagation(); openEdit(post); }} className="p-1.5 rounded-lg text-elbfunkeln-green/25 hover:text-elbfunkeln-green transition-colors" title="Bearbeiten"><Pencil size={14} /></button>
                  <button type="button" onClick={e => { e.stopPropagation(); setConfirmDeleteId(post.id); }} className="p-1.5 rounded-lg text-elbfunkeln-green/20 hover:text-elbfunkeln-rose transition-colors" title="Löschen"><Trash2 size={14} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredPosts.length === 0 && (searchQuery || filterTag) && (
          <div className="text-center py-14">
            <Search size={28} className="mx-auto text-elbfunkeln-green/10 mb-3" />
            <p className="font-inter text-sm text-elbfunkeln-green/35">Keine Beiträge gefunden.</p>
          </div>
        )}

        {posts.length === 0 && (
          <div className="text-center py-14">
            <ImagePlus size={40} className="mx-auto text-elbfunkeln-green/10 mb-3" />
            <p className="font-inter text-sm text-elbfunkeln-green/35 mb-4">Noch keine Beiträge vorhanden.</p>
            <Button onClick={openCreate} className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white h-9 text-sm rounded-xl">
              <Plus size={15} className="mr-1.5" /> Ersten Beitrag erstellen
            </Button>
          </div>
        )}
      </div>

      {/* Delete Modals */}
      <AnimatePresence>
        {(confirmDeleteId || confirmBulkDelete) && editorView === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setConfirmDeleteId(null); setConfirmBulkDelete(false); }}>
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-1.5">
                {confirmBulkDelete ? `${selectedIds.size} Beiträge löschen?` : 'Beitrag löschen?'}
              </h3>
              <p className="font-inter text-sm text-elbfunkeln-green/50 mb-5">
                {confirmBulkDelete ? 'Die ausgewählten Beiträge werden unwiderruflich entfernt.' : 'Dieser Beitrag wird unwiderruflich entfernt.'}
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setConfirmDeleteId(null); setConfirmBulkDelete(false); }} className="border-elbfunkeln-green/10 text-elbfunkeln-green h-9 rounded-xl">Abbrechen</Button>
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
