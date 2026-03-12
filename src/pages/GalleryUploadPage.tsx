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
  Filter,
  Plus,
  ArrowLeft,
  Tag,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { galleryService, GalleryPost } from '../services/galleryService';
import { useRouter } from '../components/Router';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list';
type SortMode = 'order' | 'newest' | 'oldest' | 'featured';
type EditorView = 'overview' | 'create' | 'edit';

export function GalleryUploadPage() {
  // Navigation & view state
  const [editorView, setEditorView] = useState<EditorView>('overview');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('order');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');

  // Posts
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // Drag reorder
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Editor form
  const [editingPost, setEditingPost] = useState<GalleryPost | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImagePreview, setFormImagePreview] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { navigateTo } = useRouter();

  const refresh = useCallback(() => {
    setPosts(galleryService.getAll());
    setAllTags(galleryService.getAllTags());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // --- Form helpers ---
  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormTags('');
    setFormImageUrl('');
    setFormImagePreview('');
    setFormFeatured(false);
    setEditingPost(null);
  };

  const openCreate = () => {
    resetForm();
    setEditorView('create');
  };

  const openEdit = (post: GalleryPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormDescription(post.description || '');
    setFormTags(post.tags.join(', '));
    setFormImageUrl(post.imageUrl);
    setFormImagePreview(post.imageUrl);
    setFormFeatured(post.featured);
    setEditorView('edit');
  };

  const backToOverview = () => {
    resetForm();
    setEditorView('overview');
  };

  // --- Image upload in form ---
  const handleFormFile = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Bitte nur Bilddateien auswählen.');
      return;
    }
    setUploading(true);
    try {
      const compressed = await galleryService.compressImage(imageFiles[0]);
      setFormImageUrl(compressed);
      setFormImagePreview(compressed);
    } catch {
      toast.error('Fehler beim Verarbeiten des Bildes.');
    } finally {
      setUploading(false);
    }
  };

  const handleFormDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleFormDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFormDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFormFile(e.dataTransfer.files);
    }
  }, []);

  // --- Save post ---
  const parseTags = (raw: string): string[] =>
    raw.split(',').map(t => t.trim()).filter(Boolean);

  const handleSave = () => {
    if (!formTitle.trim()) {
      toast.error('Bitte gib einen Titel ein.');
      return;
    }
    if (!formImageUrl) {
      toast.error('Bitte lade ein Bild hoch.');
      return;
    }

    if (editorView === 'edit' && editingPost) {
      galleryService.update(editingPost.id, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        tags: parseTags(formTags),
        imageUrl: formImageUrl,
        featured: formFeatured,
      });
      toast.success('Beitrag aktualisiert');
    } else {
      galleryService.add(formImageUrl, formTitle.trim(), formDescription.trim() || undefined, parseTags(formTags));
      toast.success('Beitrag erstellt');
    }

    refresh();
    backToOverview();
  };

  // --- Overview actions ---
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredPosts.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredPosts.map(p => p.id)));
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

  // --- Filtering ---
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

  // ────────────────────────────────────────────
  // RENDER: Create / Edit Form
  // ────────────────────────────────────────────
  if (editorView === 'create' || editorView === 'edit') {
    return (
      <div className="min-h-screen bg-elbfunkeln-beige pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={backToOverview}
              className="flex items-center gap-2 font-inter text-sm text-elbfunkeln-green/60 hover:text-elbfunkeln-green mb-4 transition-colors"
            >
              <ArrowLeft size={16} /> Zurück zur Übersicht
            </button>
            <h1 className="font-cormorant text-3xl text-elbfunkeln-green">
              {editorView === 'edit' ? 'Beitrag bearbeiten' : 'Neuer Beitrag'}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white p-6 md:p-8 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="font-inter text-sm font-medium text-elbfunkeln-green block mb-2">
                  Bild *
                </label>
                {formImagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-elbfunkeln-green/10">
                    <img
                      src={formImagePreview}
                      alt="Vorschau"
                      className="w-full max-h-[400px] object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white/90 rounded-full text-elbfunkeln-green hover:bg-white transition-colors shadow-sm"
                        title="Bild ändern"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => { setFormImageUrl(''); setFormImagePreview(''); }}
                        className="p-2 bg-white/90 rounded-full text-elbfunkeln-rose hover:bg-white transition-colors shadow-sm"
                        title="Bild entfernen"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleFormDragOver}
                    onDragLeave={handleFormDragLeave}
                    onDrop={handleFormDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300
                      ${isDragging
                        ? 'border-elbfunkeln-rose bg-elbfunkeln-rose/5'
                        : 'border-elbfunkeln-green/30 hover:border-elbfunkeln-green/60 hover:bg-elbfunkeln-green/5'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-3 rounded-full ${isDragging ? 'bg-elbfunkeln-rose/20' : 'bg-elbfunkeln-green/10'}`}>
                        {uploading ? (
                          <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-elbfunkeln-green" />
                        ) : (
                          <ImagePlus size={28} className={isDragging ? 'text-elbfunkeln-rose' : 'text-elbfunkeln-green/60'} />
                        )}
                      </div>
                      <p className="font-inter text-sm text-elbfunkeln-green/60">
                        Bild hierhin ziehen oder klicken
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  aria-label="Bild auswählen"
                  onChange={e => e.target.files && handleFormFile(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Title */}
              <div>
                <label className="font-inter text-sm font-medium text-elbfunkeln-green block mb-2">
                  Titel *
                </label>
                <Input
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="z.B. Neue Kollektion, Werkstatt-Einblick..."
                  className="border-elbfunkeln-green/20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-inter text-sm font-medium text-elbfunkeln-green block mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Erzähle die Geschichte hinter diesem Bild..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-elbfunkeln-green/20 bg-white font-inter text-sm text-elbfunkeln-green placeholder:text-elbfunkeln-green/40 focus:outline-none focus:ring-2 focus:ring-elbfunkeln-green/20 resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="font-inter text-sm font-medium text-elbfunkeln-green block mb-2">
                  Tags
                </label>
                <div className="relative">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-elbfunkeln-green/40" />
                  <Input
                    value={formTags}
                    onChange={e => setFormTags(e.target.value)}
                    placeholder="Kollektion, Neuheit, Silber (kommagetrennt)"
                    className="pl-9 border-elbfunkeln-green/20"
                  />
                </div>
                {allTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          const current = parseTags(formTags);
                          if (!current.includes(tag)) {
                            setFormTags(current.length > 0 ? `${formTags}, ${tag}` : tag);
                          }
                        }}
                        className="px-2 py-0.5 rounded-full text-xs font-inter bg-elbfunkeln-green/5 text-elbfunkeln-green/60 hover:bg-elbfunkeln-green/10 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFormFeatured(!formFeatured)}
                  title={formFeatured ? 'Highlight entfernen' : 'Als Highlight markieren'}
                  className={`p-2 rounded-lg transition-colors ${
                    formFeatured
                      ? 'bg-yellow-50 text-yellow-500'
                      : 'bg-elbfunkeln-green/5 text-elbfunkeln-green/40 hover:text-yellow-500'
                  }`}
                >
                  <Star size={20} fill={formFeatured ? 'currentColor' : 'none'} />
                </button>
                <div>
                  <p className="font-inter text-sm text-elbfunkeln-green">
                    {formFeatured ? 'Highlight-Beitrag' : 'Als Highlight markieren'}
                  </p>
                  <p className="font-inter text-xs text-elbfunkeln-green/40">
                    Highlights werden in der Galerie prominent angezeigt
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-elbfunkeln-green/10">
                <Button
                  onClick={handleSave}
                  disabled={uploading}
                  className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white flex-1"
                >
                  {editorView === 'edit' ? (
                    <><Save size={16} className="mr-2" /> Änderungen speichern</>
                  ) : (
                    <><Upload size={16} className="mr-2" /> Beitrag veröffentlichen</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={backToOverview}
                  className="border-elbfunkeln-green/20 text-elbfunkeln-green"
                >
                  Abbrechen
                </Button>
              </div>

              {/* Meta info for editing */}
              {editorView === 'edit' && editingPost && (
                <div className="pt-3 border-t border-elbfunkeln-green/10">
                  <div className="flex items-center gap-4 font-inter text-xs text-elbfunkeln-green/40">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> Erstellt: {formatDate(editingPost.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} /> Bearbeitet: {formatDate(editingPost.updatedAt)}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────
  // RENDER: Overview
  // ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-elbfunkeln-beige pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="font-cormorant text-4xl text-elbfunkeln-green mb-2">
                Galerie-Editor
              </h1>
              <p className="font-inter text-elbfunkeln-green/60 text-sm">
                {posts.length} {posts.length === 1 ? 'Beitrag' : 'Beiträge'}
                {posts.filter(p => p.featured).length > 0 && (
                  <> &middot; {posts.filter(p => p.featured).length} Highlights</>
                )}
              </p>
            </div>
            <div className="flex gap-2 self-start md:self-auto">
              <Button
                variant="outline"
                onClick={() => navigateTo('gallery')}
                className="border-elbfunkeln-green text-elbfunkeln-green hover:bg-elbfunkeln-green hover:text-white"
              >
                <Eye size={16} className="mr-2" />
                Galerie ansehen
              </Button>
              <Button
                onClick={openCreate}
                className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white"
              >
                <Plus size={16} className="mr-2" />
                Neuer Beitrag
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-elbfunkeln-green/40" />
              <Input
                placeholder="Beiträge durchsuchen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 border-elbfunkeln-green/20 text-sm"
              />
            </div>

            {/* Tag filter */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-elbfunkeln-green/40 shrink-0" />
                <select
                  value={filterTag}
                  onChange={e => setFilterTag(e.target.value)}
                  aria-label="Tag-Filter"
                  className="h-9 px-3 rounded-lg border border-elbfunkeln-green/20 bg-white text-sm text-elbfunkeln-green font-inter focus:outline-none focus:ring-2 focus:ring-elbfunkeln-green/20"
                >
                  <option value="">Alle Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-elbfunkeln-green/40 shrink-0" />
              <select
                value={sortMode}
                onChange={e => setSortMode(e.target.value as SortMode)}
                aria-label="Sortierung"
                className="h-9 px-3 rounded-lg border border-elbfunkeln-green/20 bg-white text-sm text-elbfunkeln-green font-inter focus:outline-none focus:ring-2 focus:ring-elbfunkeln-green/20"
              >
                <option value="order">Reihenfolge</option>
                <option value="newest">Neueste zuerst</option>
                <option value="oldest">Älteste zuerst</option>
                <option value="featured">Highlights zuerst</option>
              </select>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-elbfunkeln-green text-white' : 'text-elbfunkeln-green/50 hover:bg-elbfunkeln-green/10'
                }`}
                title="Rasteransicht"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-elbfunkeln-green text-white' : 'text-elbfunkeln-green/50 hover:bg-elbfunkeln-green/10'
                }`}
                title="Listenansicht"
              >
                <LayoutList size={18} />
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="flex flex-wrap items-center gap-2 p-3 bg-elbfunkeln-green/5 rounded-xl border border-elbfunkeln-green/10"
              >
                <span className="font-inter text-sm text-elbfunkeln-green mr-2">
                  {selectedIds.size} ausgewählt:
                </span>
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
                  className="border-elbfunkeln-lavender text-elbfunkeln-green h-8 text-xs"
                >
                  <Star size={12} className="mr-1" /> Als Highlight
                </Button>
                <Button
                  size="sm" variant="outline"
                  onClick={() => setConfirmBulkDelete(true)}
                  className="border-elbfunkeln-rose/40 text-elbfunkeln-rose h-8 text-xs hover:bg-elbfunkeln-rose hover:text-white"
                >
                  <Trash2 size={12} className="mr-1" /> Löschen
                </Button>
                <Button
                  size="sm" variant="ghost"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-elbfunkeln-green/50 h-8 text-xs"
                >
                  Aufheben
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Grid View ── */}
        {viewMode === 'grid' && filteredPosts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: draggingId === post.id ? 0.5 : 1,
                  scale: dragOverId === post.id ? 1.02 : 1,
                  y: 0,
                }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
                draggable={sortMode === 'order'}
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, post.id)}
                onDragOver={(e) => handleDragOverItem(e as unknown as React.DragEvent, post.id)}
                onDrop={(e) => handleDropItem(e as unknown as React.DragEvent, post.id)}
                onDragEnd={handleDragEnd}
              >
                <Card className={`overflow-hidden bg-white group cursor-pointer transition-all duration-200 ${
                  selectedIds.has(post.id) ? 'ring-2 ring-elbfunkeln-green shadow-lg' : 'hover:shadow-lg'
                } ${dragOverId === post.id ? 'ring-2 ring-elbfunkeln-lavender' : ''}`}>
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden" onClick={() => openEdit(post)}>
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                    {/* Top badges */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(post.id); }}
                        title="Auswählen"
                        className={`p-1.5 rounded-full transition-all ${
                          selectedIds.has(post.id)
                            ? 'bg-elbfunkeln-green text-white'
                            : 'bg-white/90 text-elbfunkeln-green/50 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                      </button>
                      {post.featured && (
                        <div className="bg-yellow-400 text-white p-1.5 rounded-full shadow-sm">
                          <Star size={12} fill="currentColor" />
                        </div>
                      )}
                    </div>

                    {/* Bottom actions on hover */}
                    <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleFeatured(post.id); }}
                        className="p-1.5 bg-white/90 rounded-full text-elbfunkeln-green hover:bg-white transition-colors"
                        title={post.featured ? 'Highlight entfernen' : 'Als Highlight'}
                      >
                        <Star size={14} fill={post.featured ? 'currentColor' : 'none'} className={post.featured ? 'text-yellow-500' : ''} />
                      </button>
                      {sortMode === 'order' && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleMoveUp(post.id); }} className="p-1.5 bg-white/90 rounded-full text-elbfunkeln-green hover:bg-white transition-colors" title="Nach oben"><ChevronUp size={14} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleMoveDown(post.id); }} className="p-1.5 bg-white/90 rounded-full text-elbfunkeln-green hover:bg-white transition-colors" title="Nach unten"><ChevronDown size={14} /></button>
                        </>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(post.id); }}
                        className="p-1.5 bg-white/90 rounded-full text-elbfunkeln-rose hover:bg-white transition-colors"
                        title="Löschen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Drag handle */}
                    {sortMode === 'order' && (
                      <div className="absolute top-1/2 left-2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab">
                        <GripVertical size={18} className="text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4" onClick={() => openEdit(post)}>
                    <h3 className="font-cormorant text-lg text-elbfunkeln-green leading-tight mb-1 line-clamp-1">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="font-inter text-xs text-elbfunkeln-green/50 line-clamp-2 mb-2">
                        {post.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-inter bg-elbfunkeln-green/5 text-elbfunkeln-green/50">
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-[10px] font-inter text-elbfunkeln-green/30">+{post.tags.length - 3}</span>
                        )}
                      </div>
                      <span className="font-inter text-[10px] text-elbfunkeln-green/30">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── List View ── */}
        {viewMode === 'list' && filteredPosts.length > 0 && (
          <div className="space-y-2">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
              >
                <Card
                  className={`bg-white overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedIds.has(post.id) ? 'ring-2 ring-elbfunkeln-green shadow-md' : ''
                  }`}
                  onClick={() => openEdit(post)}
                >
                  <div className="flex items-center gap-4 p-3">
                    {/* Left controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {sortMode === 'order' && (
                        <GripVertical size={16} className="text-elbfunkeln-green/30 cursor-grab" />
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); toggleSelect(post.id); }}
                        title="Auswählen"
                        className={`p-1 rounded transition-colors ${
                          selectedIds.has(post.id) ? 'text-elbfunkeln-green' : 'text-elbfunkeln-green/30 hover:text-elbfunkeln-green'
                        }`}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-cormorant text-base text-elbfunkeln-green truncate">{post.title}</p>
                        {post.featured && <Star size={12} className="text-yellow-500 shrink-0" fill="currentColor" />}
                      </div>
                      <p className="font-inter text-xs text-elbfunkeln-green/40 truncate">
                        {post.description || 'Keine Beschreibung'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 rounded-full text-[10px] font-inter bg-elbfunkeln-green/5 text-elbfunkeln-green/40">
                            {tag}
                          </span>
                        ))}
                        <span className="font-inter text-[10px] text-elbfunkeln-green/30">{formatDate(post.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={e => { e.stopPropagation(); openEdit(post); }} className="p-1.5 rounded-lg text-elbfunkeln-green/40 hover:text-elbfunkeln-green hover:bg-elbfunkeln-green/5 transition-colors" title="Bearbeiten">
                        <Pencil size={16} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleToggleFeatured(post.id); }} className={`p-1.5 rounded-lg transition-colors ${post.featured ? 'text-yellow-500 bg-yellow-50' : 'text-elbfunkeln-green/30 hover:text-yellow-500'}`} title="Highlight">
                        <Star size={16} fill={post.featured ? 'currentColor' : 'none'} />
                      </button>
                      {sortMode === 'order' && (
                        <>
                          <button onClick={e => { e.stopPropagation(); handleMoveUp(post.id); }} disabled={index === 0} className="p-1.5 rounded-lg text-elbfunkeln-green/40 hover:text-elbfunkeln-green hover:bg-elbfunkeln-green/5 transition-colors disabled:opacity-20" title="Hoch"><ChevronUp size={16} /></button>
                          <button onClick={e => { e.stopPropagation(); handleMoveDown(post.id); }} disabled={index === filteredPosts.length - 1} className="p-1.5 rounded-lg text-elbfunkeln-green/40 hover:text-elbfunkeln-green hover:bg-elbfunkeln-green/5 transition-colors disabled:opacity-20" title="Runter"><ChevronDown size={16} /></button>
                        </>
                      )}
                      <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(post.id); }} className="p-1.5 rounded-lg text-elbfunkeln-green/30 hover:text-elbfunkeln-rose hover:bg-elbfunkeln-rose/5 transition-colors" title="Löschen">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty states */}
        {filteredPosts.length === 0 && (searchQuery || filterTag) && (
          <div className="text-center py-16">
            <Search size={32} className="mx-auto text-elbfunkeln-green/20 mb-4" />
            <p className="font-inter text-elbfunkeln-green/50">Keine Beiträge gefunden.</p>
          </div>
        )}

        {posts.length === 0 && (
          <div className="text-center py-16">
            <ImagePlus size={48} className="mx-auto text-elbfunkeln-green/20 mb-4" />
            <p className="font-inter text-elbfunkeln-green/50 mb-4">Noch keine Beiträge vorhanden.</p>
            <Button onClick={openCreate} className="bg-elbfunkeln-green hover:bg-elbfunkeln-rose text-white">
              <Plus size={16} className="mr-2" /> Ersten Beitrag erstellen
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {(confirmDeleteId || confirmBulkDelete) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => { setConfirmDeleteId(null); setConfirmBulkDelete(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-2">
                {confirmBulkDelete ? `${selectedIds.size} Beiträge löschen?` : 'Beitrag löschen?'}
              </h3>
              <p className="font-inter text-sm text-elbfunkeln-green/60 mb-6">
                {confirmBulkDelete
                  ? 'Die ausgewählten Beiträge werden unwiderruflich entfernt.'
                  : 'Dieser Beitrag wird unwiderruflich entfernt.'}
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => { setConfirmDeleteId(null); setConfirmBulkDelete(false); }} className="border-elbfunkeln-green/20 text-elbfunkeln-green">
                  Abbrechen
                </Button>
                <Button
                  onClick={() => { if (confirmBulkDelete) handleBulkDelete(); else if (confirmDeleteId) handleDelete(confirmDeleteId); }}
                  className="bg-elbfunkeln-rose hover:bg-elbfunkeln-rose/80 text-white"
                >
                  <Trash2 size={14} className="mr-1" /> Löschen
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
