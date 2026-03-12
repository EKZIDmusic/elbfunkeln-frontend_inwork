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
  AlertTriangle,
  Images,
  Tag,
  Gem,
  FileText,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { galleryService, GalleryPost } from '../services/galleryService';
import { useRouter } from '../components/Router';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list';
type SortMode = 'order' | 'newest' | 'oldest' | 'featured';
type EditorView = 'overview' | 'create' | 'edit';

/* ── Removable Pill ── */
function RemovablePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="editor-pill">
      {label}
      <button type="button" onClick={onRemove} className="editor-pill-remove" title={`${label} entfernen`}>
        <X size={10} />
      </button>
    </span>
  );
}

/* ── Section Card ── */
function SectionCard({ icon, title, children, className = '' }: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`editor-section ${className}`}>
      <div className="editor-section-header">
        {icon}
        <span className="editor-section-title">{title}</span>
      </div>
      {children}
    </div>
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
  const [dragImageIndex, setDragImageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { navigateTo } = useRouter();

  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [p, t, m] = await Promise.all([
        galleryService.getAll(),
        galleryService.getAllTags(),
        galleryService.getAllMaterials(),
      ]);
      setPosts(p);
      setAllTags(t);
      setAllMaterials(m);
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Laden der Galerie');
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

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

  /* ── Image upload ── */
  const handleFormFile = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) { toast.error('Bitte nur Bilddateien.'); return; }
    setUploading(true);
    try {
      const newImages: string[] = [];
      for (const file of imageFiles) {
        const url = await galleryService.uploadImage(file);
        newImages.push(url);
      }
      setFormImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} Bild${newImages.length > 1 ? 'er' : ''} hinzugefügt`);
    } catch (err: any) { toast.error(err.message || 'Fehler beim Hochladen.'); }
    finally { setUploading(false); }
  };

  const handleFormDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleFormDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleFormDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFormFile(e.dataTransfer.files);
  }, []);

  const removeFormImage = (index: number) => setFormImages(prev => prev.filter((_, i) => i !== index));

  /* Image reorder within form */
  const handleImageDragStart = (index: number) => setDragImageIndex(index);
  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragImageIndex === null || dragImageIndex === index) return;
    setFormImages(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragImageIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragImageIndex(index);
  };
  const handleImageDragEnd = () => setDragImageIndex(null);

  /* ── Tags & Materials ── */
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

  /* ── Save ── */
  const handleSave = async () => {
    if (!formTitle.trim()) { toast.error('Bitte gib einen Titel ein.'); return; }
    if (formImages.length === 0) { toast.error('Bitte lade mindestens ein Bild hoch.'); return; }

    setLoading(true);
    try {
      if (editorView === 'edit' && editingPost) {
        await galleryService.update(editingPost.id, {
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
        await galleryService.add({
          images: formImages,
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          tags: formTags,
          materials: formMaterials,
        });
        toast.success('Beitrag erstellt');
      }
      await refresh();
      backToOverview();
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Speichern.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFromEdit = async () => {
    if (editingPost) {
      try {
        await galleryService.remove(editingPost.id);
        await refresh();
        toast.success('Beitrag entfernt');
        backToOverview();
      } catch (err: any) {
        toast.error(err.message || 'Fehler beim Löschen.');
      }
    }
  };

  /* ── Overview actions ── */
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const selectAll = () => {
    if (selectedIds.size === filteredPosts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPosts.map(p => p.id)));
    }
  };
  const handleToggleFeatured = async (id: string) => {
    try {
      const is = await galleryService.toggleFeatured(id);
      await refresh();
      toast.success(is ? 'Highlight markiert' : 'Highlight entfernt');
    } catch (err: any) { toast.error(err.message || 'Fehler.'); }
  };
  const handleDelete = async (id: string) => {
    try {
      await galleryService.remove(id);
      await refresh();
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      setConfirmDeleteId(null);
      toast.success('Beitrag entfernt');
    } catch (err: any) { toast.error(err.message || 'Fehler beim Löschen.'); }
  };
  const handleBulkDelete = async () => {
    try {
      await galleryService.bulkRemove(Array.from(selectedIds));
      await refresh();
      setSelectedIds(new Set()); setConfirmBulkDelete(false);
      toast.success(`${selectedIds.size} Beiträge entfernt`);
    } catch (err: any) { toast.error(err.message || 'Fehler beim Löschen.'); }
  };

  /* ── Drag reorder (overview) ── */
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
  const handleDropItem = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== targetId) {
      const targetIdx = posts.findIndex(p => p.id === targetId);
      if (targetIdx !== -1) {
        try {
          await galleryService.moveImage(sourceId, targetIdx);
          await refresh();
        } catch (err: any) { toast.error(err.message || 'Fehler beim Verschieben.'); }
      }
    }
    setDragOverId(null);
    setDraggingId(null);
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

  const formatDate = (d: string) => new Date(d).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const formatDateLong = (d: string) => new Date(d).toLocaleDateString('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  // ════════════════════════════════════════
  //  CREATE / EDIT
  // ════════════════════════════════════════
  if (editorView === 'create' || editorView === 'edit') {
    return (
      <div className="min-h-screen bg-elbfunkeln-beige pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="editor-topbar"
          >
            <div className="editor-topbar-left">
              <button
                type="button"
                onClick={backToOverview}
                className="editor-back-btn"
                title="Zurück zur Übersicht"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="font-cormorant editor-page-title">
                  {editorView === 'edit' ? 'Beitrag bearbeiten' : 'Neuer Beitrag'}
                </h1>
                {editorView === 'edit' && editingPost && (
                  <p className="font-inter editor-meta-line">
                    Erstellt {formatDateLong(editingPost.createdAt)}
                  </p>
                )}
              </div>
            </div>

            <div className="editor-topbar-actions">
              {editorView === 'edit' && editingPost && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(editingPost.id)}
                  className="editor-delete-btn"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">Löschen</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={uploading || loading}
                className="editor-save-btn"
              >
                {editorView === 'edit' ? (
                  <><Save size={14} /> <span>Speichern</span></>
                ) : (
                  <><Upload size={14} /> <span>Veröffentlichen</span></>
                )}
              </button>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
              {/* Left — Main content */}
              <div className="lg:col-span-2 space-y-5">
                {/* Title */}
                <SectionCard icon={<Pencil size={14} />} title="Titel *">
                  <Input
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="z.B. Goldene Wellen — Neue Kollektion"
                    className="editor-input"
                  />
                </SectionCard>

                {/* Images */}
                <SectionCard icon={<Images size={14} />} title={`Bilder${formImages.length > 0 ? ` (${formImages.length})` : ''}`}>
                  {formImages.length > 0 && (
                    <div className="editor-image-grid">
                      {formImages.map((img, i) => (
                        <div
                          key={`${i}-${img.slice(-20)}`}
                          className={`editor-image-thumb ${dragImageIndex === i ? 'editor-image-thumb--dragging' : ''}`}
                          draggable
                          onDragStart={() => handleImageDragStart(i)}
                          onDragOver={(e) => handleImageDragOver(e, i)}
                          onDragEnd={handleImageDragEnd}
                        >
                          <img src={img} alt={`Bild ${i + 1}`} className="editor-image-thumb-img" />
                          {i === 0 && (
                            <span className="editor-cover-badge">Cover</span>
                          )}
                          <div className="editor-image-thumb-overlay">
                            <button
                              type="button"
                              onClick={() => removeFormImage(i)}
                              className="editor-image-remove-btn"
                              title="Entfernen"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <div className="editor-image-grip">
                            <GripVertical size={12} />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="editor-image-add-btn"
                        title="Weitere Bilder hinzufügen"
                      >
                        <Plus size={20} />
                        <span className="font-inter editor-image-add-label">Hinzufügen</span>
                      </button>
                    </div>
                  )}

                  {formImages.length === 0 && (
                    <div
                      onDragOver={handleFormDragOver}
                      onDragLeave={handleFormDragLeave}
                      onDrop={handleFormDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`editor-dropzone ${isDragging ? 'editor-dropzone--active' : ''}`}
                    >
                      {uploading ? (
                        <div className="editor-spinner" />
                      ) : (
                        <>
                          <ImagePlus size={32} className="editor-dropzone-icon" />
                          <p className="font-inter editor-dropzone-text">
                            Bilder hierher ziehen oder klicken zum Auswählen
                          </p>
                          <p className="font-inter editor-dropzone-hint">
                            JPG, PNG, WebP — max. 10 MB pro Bild
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    aria-label="Bilder auswählen"
                    onChange={e => e.target.files && handleFormFile(e.target.files)}
                    className="hidden"
                  />
                </SectionCard>

                {/* Description */}
                <SectionCard icon={<FileText size={14} />} title="Beschreibung">
                  <textarea
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Erzähle die Geschichte hinter diesem Beitrag..."
                    rows={5}
                    className="editor-textarea"
                  />
                  <p className="font-inter editor-char-count">
                    {formDescription.length} Zeichen
                  </p>
                </SectionCard>
              </div>

              {/* Right — Sidebar */}
              <div className="space-y-5">
                {/* Tags */}
                <SectionCard icon={<Tag size={14} />} title="Tags">
                  {formTags.length > 0 && (
                    <div className="editor-pill-wrap">
                      {formTags.map(tag => (
                        <RemovablePill key={tag} label={tag} onRemove={() => removeTag(tag)} />
                      ))}
                    </div>
                  )}
                  <Input
                    value={formTagInput}
                    onChange={e => setFormTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Tag eingeben + Enter"
                    className="editor-input editor-input--sm"
                  />
                  {allTags.filter(t => !formTags.includes(t)).length > 0 && (
                    <div className="editor-suggestions">
                      {allTags.filter(t => !formTags.includes(t)).slice(0, 8).map(tag => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => addTag(tag)}
                          className="editor-suggestion-btn"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </SectionCard>

                {/* Materials */}
                <SectionCard icon={<Gem size={14} />} title="Materialien">
                  {formMaterials.length > 0 && (
                    <div className="editor-pill-wrap">
                      {formMaterials.map(mat => (
                        <RemovablePill key={mat} label={mat} onRemove={() => removeMaterial(mat)} />
                      ))}
                    </div>
                  )}
                  <Input
                    value={formMaterialInput}
                    onChange={e => setFormMaterialInput(e.target.value)}
                    onKeyDown={handleMaterialKeyDown}
                    placeholder="Material eingeben + Enter"
                    className="editor-input editor-input--sm"
                  />
                  {allMaterials.filter(m => !formMaterials.includes(m)).length > 0 && (
                    <div className="editor-suggestions">
                      {allMaterials.filter(m => !formMaterials.includes(m)).slice(0, 6).map(mat => (
                        <button
                          type="button"
                          key={mat}
                          onClick={() => addMaterial(mat)}
                          className="editor-suggestion-btn editor-suggestion-btn--italic"
                        >
                          + {mat}
                        </button>
                      ))}
                    </div>
                  )}
                </SectionCard>

                {/* Featured */}
                <SectionCard icon={<Star size={14} />} title="Optionen">
                  <button
                    type="button"
                    onClick={() => setFormFeatured(!formFeatured)}
                    className={`editor-featured-btn ${formFeatured ? 'editor-featured-btn--active' : ''}`}
                  >
                    <Star
                      size={18}
                      fill={formFeatured ? 'currentColor' : 'none'}
                      className={formFeatured ? 'editor-featured-icon--active' : 'editor-featured-icon'}
                    />
                    <div className="editor-featured-text">
                      <p className="font-inter editor-featured-label">
                        {formFeatured ? 'Highlight aktiv' : 'Als Highlight markieren'}
                      </p>
                      <p className="font-inter editor-featured-hint">
                        Wird oben in der Galerie angezeigt
                      </p>
                    </div>
                  </button>

                  {editorView === 'edit' && editingPost && (
                    <div className="editor-timestamps">
                      <div className="editor-timestamp-row">
                        <Clock size={11} />
                        <span>Erstellt: {formatDateLong(editingPost.createdAt)}</span>
                      </div>
                      <div className="editor-timestamp-row">
                        <CheckCircle2 size={11} />
                        <span>Bearbeitet: {formatDateLong(editingPost.updatedAt)}</span>
                      </div>
                    </div>
                  )}
                </SectionCard>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Delete modal */}
        <AnimatePresence>
          {confirmDeleteId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="editor-modal-overlay"
              onClick={() => setConfirmDeleteId(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="editor-modal"
                onClick={e => e.stopPropagation()}
              >
                <div className="editor-modal-icon">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="font-cormorant editor-modal-title">Beitrag löschen?</h3>
                <p className="font-inter editor-modal-text">
                  Dieser Beitrag wird unwiderruflich entfernt. Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <div className="editor-modal-actions">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="editor-modal-cancel"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editorView === 'edit') handleDeleteFromEdit();
                      else handleDelete(confirmDeleteId);
                    }}
                    className="editor-modal-confirm"
                  >
                    <Trash2 size={13} /> Löschen
                  </button>
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
    <div className="min-h-screen bg-elbfunkeln-beige pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="font-cormorant editor-overview-title">Galerie-Editor</h1>
              <p className="font-inter editor-overview-subtitle">
                {posts.length} {posts.length === 1 ? 'Beitrag' : 'Beiträge'}
                {posts.filter(p => p.featured).length > 0 && (
                  <> &middot; {posts.filter(p => p.featured).length} Highlights</>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigateTo('gallery')}
                className="editor-header-btn editor-header-btn--outline"
              >
                <Eye size={15} /> Galerie ansehen
              </button>
              <button
                type="button"
                onClick={openCreate}
                className="editor-header-btn editor-header-btn--primary"
              >
                <Plus size={15} /> Neuer Beitrag
              </button>
            </div>
          </div>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="editor-toolbar"
        >
          <div className="editor-toolbar-row">
            <div className="editor-search-wrap">
              <Search size={15} className="editor-search-icon" />
              <Input
                placeholder="Suchen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="editor-input editor-search-input"
              />
            </div>
            <div className="editor-toolbar-controls">
              {allTags.length > 0 && (
                <select
                  value={filterTag}
                  onChange={e => setFilterTag(e.target.value)}
                  aria-label="Tag-Filter"
                  className="editor-select"
                >
                  <option value="">Alle Tags</option>
                  {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              )}
              <select
                value={sortMode}
                onChange={e => setSortMode(e.target.value as SortMode)}
                aria-label="Sortierung"
                className="editor-select"
              >
                <option value="order">Reihenfolge</option>
                <option value="newest">Neueste</option>
                <option value="oldest">Älteste</option>
                <option value="featured">Highlights</option>
              </select>
              <div className="editor-view-toggle">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`editor-view-btn ${viewMode === 'grid' ? 'editor-view-btn--active' : ''}`}
                  title="Rasteransicht"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`editor-view-btn ${viewMode === 'list' ? 'editor-view-btn--active' : ''}`}
                  title="Listenansicht"
                >
                  <LayoutList size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk actions bar */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="editor-bulk-bar">
                  <span className="font-inter editor-bulk-count">
                    {selectedIds.size} ausgewählt
                  </span>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="editor-bulk-btn"
                  >
                    {selectedIds.size === filteredPosts.length ? 'Keine' : 'Alle'} auswählen
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        for (const id of selectedIds) {
                          const p = posts.find(x => x.id === id);
                          if (p && !p.featured) await galleryService.toggleFeatured(id);
                        }
                        await refresh();
                        setSelectedIds(new Set());
                        toast.success('Highlights markiert');
                      } catch (err: any) { toast.error(err.message || 'Fehler.'); }
                    }}
                    className="editor-bulk-btn"
                  >
                    <Star size={12} /> Highlight
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmBulkDelete(true)}
                    className="editor-bulk-btn editor-bulk-btn--danger"
                  >
                    <Trash2 size={12} /> Löschen
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Grid view */}
        {viewMode === 'grid' && filteredPosts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: draggingId === post.id ? 0.5 : 1,
                  scale: dragOverId === post.id ? 1.03 : 1,
                  y: 0,
                }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                draggable={sortMode === 'order'}
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, post.id)}
                onDragOver={(e) => handleDragOverItem(e as unknown as React.DragEvent, post.id)}
                onDrop={(e) => handleDropItem(e as unknown as React.DragEvent, post.id)}
                onDragEnd={handleDragEnd}
              >
                <div className={`editor-card ${
                  selectedIds.has(post.id) ? 'editor-card--selected' : ''
                } ${dragOverId === post.id ? 'editor-card--dragover' : ''}`}>
                  {/* Image */}
                  <div className="editor-card-image-wrap" onClick={() => openEdit(post)}>
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="editor-card-image"
                      loading="lazy"
                    />
                    <div className="editor-card-image-hover" />

                    {/* Select checkbox */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleSelect(post.id); }}
                      title="Auswählen"
                      className={`editor-card-select ${selectedIds.has(post.id) ? 'editor-card-select--active' : ''}`}
                    >
                      <CheckCircle2 size={16} />
                    </button>

                    {/* Badges */}
                    <div className="editor-card-badges">
                      {post.featured && (
                        <div className="editor-card-badge-star">
                          <Star size={10} fill="currentColor" />
                        </div>
                      )}
                      {post.images.length > 1 && (
                        <div className="editor-card-badge-multi">
                          {post.images.slice(0, 4).map((_, i) => (
                            <Circle key={i} size={3} fill="white" />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick actions */}
                    <div className="editor-card-actions">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleToggleFeatured(post.id); }}
                        className="editor-card-action-btn"
                        title="Highlight"
                      >
                        <Star size={12} fill={post.featured ? 'currentColor' : 'none'} className={post.featured ? 'editor-star--active' : ''} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(post.id); }}
                        className="editor-card-action-btn editor-card-action-btn--danger"
                        title="Löschen"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Drag grip */}
                    {sortMode === 'order' && (
                      <div className="editor-card-grip">
                        <GripVertical size={16} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="editor-card-info" onClick={() => openEdit(post)}>
                    <h3 className="font-cormorant editor-card-title">{post.title}</h3>
                    <span className="font-inter editor-card-date">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && filteredPosts.length > 0 && (
          <div className="editor-list mt-5">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.2) }}
                className={`editor-list-item ${selectedIds.has(post.id) ? 'editor-list-item--selected' : ''}`}
                onClick={() => openEdit(post)}
              >
                <div className="editor-list-item-left">
                  {sortMode === 'order' && (
                    <GripVertical size={14} className="editor-list-grip" />
                  )}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); toggleSelect(post.id); }}
                    title="Auswählen"
                    className={`editor-list-select ${selectedIds.has(post.id) ? 'editor-list-select--active' : ''}`}
                  >
                    <CheckCircle2 size={16} />
                  </button>
                </div>

                <div className="editor-list-thumb">
                  <img src={post.imageUrl} alt={post.title} className="editor-list-thumb-img" />
                </div>

                <div className="editor-list-content">
                  <div className="editor-list-title-row">
                    <p className="font-cormorant editor-list-title">{post.title}</p>
                    {post.featured && <Star size={12} className="editor-star--active" fill="currentColor" />}
                    {post.images.length > 1 && (
                      <span className="font-inter editor-list-image-count">{post.images.length} Bilder</span>
                    )}
                  </div>
                  <div className="editor-list-meta">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="editor-list-tag">{tag}</span>
                    ))}
                    <span className="font-inter editor-list-date">{formatDate(post.createdAt)}</span>
                  </div>
                </div>

                <div className="editor-list-actions">
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); openEdit(post); }}
                    className="editor-list-action-btn"
                    title="Bearbeiten"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleToggleFeatured(post.id); }}
                    className="editor-list-action-btn"
                    title="Highlight"
                  >
                    <Star size={14} fill={post.featured ? 'currentColor' : 'none'} className={post.featured ? 'editor-star--active' : ''} />
                  </button>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setConfirmDeleteId(post.id); }}
                    className="editor-list-action-btn editor-list-action-btn--danger"
                    title="Löschen"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty states */}
        {filteredPosts.length === 0 && (searchQuery || filterTag) && (
          <div className="editor-empty">
            <Search size={28} className="editor-empty-icon" />
            <p className="font-inter editor-empty-text">Keine Beiträge gefunden.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setFilterTag(''); }}
              className="font-inter editor-empty-reset"
            >
              Filter zurücksetzen
            </button>
          </div>
        )}

        {posts.length === 0 && (
          <div className="editor-empty">
            <ImagePlus size={40} className="editor-empty-icon" />
            <p className="font-inter editor-empty-text">Noch keine Beiträge vorhanden.</p>
            <button
              type="button"
              onClick={openCreate}
              className="editor-header-btn editor-header-btn--primary editor-empty-cta"
            >
              <Plus size={15} /> Ersten Beitrag erstellen
            </button>
          </div>
        )}
      </div>

      {/* Delete modals */}
      <AnimatePresence>
        {(confirmDeleteId || confirmBulkDelete) && editorView === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="editor-modal-overlay"
            onClick={() => { setConfirmDeleteId(null); setConfirmBulkDelete(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="editor-modal"
              onClick={e => e.stopPropagation()}
            >
              <div className="editor-modal-icon">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-cormorant editor-modal-title">
                {confirmBulkDelete ? `${selectedIds.size} Beiträge löschen?` : 'Beitrag löschen?'}
              </h3>
              <p className="font-inter editor-modal-text">
                {confirmBulkDelete
                  ? 'Die ausgewählten Beiträge werden unwiderruflich entfernt.'
                  : 'Dieser Beitrag wird unwiderruflich entfernt.'}
              </p>
              <div className="editor-modal-actions">
                <button
                  type="button"
                  onClick={() => { setConfirmDeleteId(null); setConfirmBulkDelete(false); }}
                  className="editor-modal-cancel"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirmBulkDelete) handleBulkDelete();
                    else if (confirmDeleteId) handleDelete(confirmDeleteId);
                  }}
                  className="editor-modal-confirm"
                >
                  <Trash2 size={13} /> Löschen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
