import { useState, useEffect } from 'react';
import { FileText, Save, Edit3, Eye, Plus, Trash2, Search, Tag, BookOpen } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';

interface ProductContent {
  id: string;
  name: string;
  category: string;
  description: string;
  careInstructions: string;
  detailedDescription?: string;
  keyFeatures?: string[];
  materials?: string[];
  dimensions?: string;
  weight?: string;
  lastUpdated: string;
  updatedBy: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  category: string;
  descriptionTemplate: string;
  careTemplate: string;
  isDefault: boolean;
}

export function ProductContentManager() {
  const [selectedTab, setSelectedTab] = useState('products');
  const [products, setProducts] = useState<ProductContent[]>([]);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductContent | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    loadProducts();
    loadTemplates();
  }, []);

  const loadProducts = () => {
    // Mock products data
    const mockProducts: ProductContent[] = [
      {
        id: 'ELB-OH-001',
        name: 'Spiralen-Ohrringe "Elbe"',
        category: 'Ohrringe',
        description: 'Handgeformte Spiralen aus 925er Silberdraht mit zarten Perlenakzenten. Jedes Paar ist ein Unikat und spiegelt die Schönheit der Elbe wider.',
        careInstructions: 'Mit weichem Tuch trocken polieren. Vor Feuchtigkeit schützen. In Schmuckbox aufbewahren. Bei starker Verschmutzung mit mildem Seifenwasser reinigen.',
        detailedDescription: 'Diese eleganten Spiralen-Ohrringe entstehen in stundenlanger Handarbeit in unserer Hamburger Werkstatt. Jede Spirale wird individual geformt und mit sorgfältig ausgewählten Süßwasserperlen verziert.',
        keyFeatures: ['Handgefertigt', 'Unikat', '925er Silber', 'Süßwasserperlen'],
        materials: ['925er Silberdraht', 'Süßwasserperlen'],
        dimensions: '3cm x 1.5cm',
        weight: '2.5g',
        lastUpdated: '2024-01-15',
        updatedBy: 'Anna Schmidt'
      },
      {
        id: '2',
        name: 'Minimalistisches Armband',
        category: 'Armbänder',
        description: 'Ein zeitloses Armband im minimalistischen Design. Aus hochwertigem Golddraht gefertigt und perfekt für den modernen Lifestyle.',
        careInstructions: 'Sanft mit weichem Tuch reinigen. Vor Parfum und Cremes schützen. Einzeln aufbewahren um Kratzer zu vermeiden.',
        materials: ['14K Goldfüllung', 'Flexibler Draht'],
        dimensions: 'Verstellbar 16-20cm',
        lastUpdated: '2024-01-10',
        updatedBy: 'Marie Weber'
      },
      {
        id: '3',
        name: 'Eleganter Draht-Ring',
        category: 'Ringe',
        description: 'Eleganter Ring aus kunstvolle geformtem Draht. Jeder Ring ist ein Unikat und wird individuell an deine Fingergröße angepasst.',
        careInstructions: 'Regelmäßig polieren. Bei Bedarf professionell reinigen lassen. Nicht bei Hausarbeiten tragen.',
        materials: ['925 Sterling Silber', 'Handgeformter Draht'],
        dimensions: 'Größe 52-60',
        lastUpdated: '2024-01-08',
        updatedBy: 'Lisa Müller'
      }
    ];
    setProducts(mockProducts);
  };

  const loadTemplates = () => {
    const mockTemplates: ContentTemplate[] = [
      {
        id: 'template-ohrringe',
        name: 'Ohrringe Standard',
        category: 'Ohrringe',
        descriptionTemplate: 'Elegante Ohrringe aus {material}, handgefertigt in unserer Werkstatt. {besonderheit} verleiht diesem Schmuckstück seinen einzigartigen Charakter.',
        careTemplate: 'Mit weichem Tuch trocken polieren. Vor Feuchtigkeit und Chemikalien schützen. In Schmuckbox oder weichem Beutel aufbewahren.',
        isDefault: true
      },
      {
        id: 'template-ringe',
        name: 'Ringe Standard',
        category: 'Ringe',
        descriptionTemplate: 'Handgefertigter Ring aus {material}. {design} macht diesen Ring zu einem besonderen Schmuckstück für jeden Tag.',
        careTemplate: 'Regelmäßig mit weichem Tuch polieren. Bei starker Beanspruchung abnehmen. Professionelle Reinigung empfohlen.',
        isDefault: true
      },
      {
        id: 'template-armbänder',
        name: 'Armbänder Standard',
        category: 'Armbänder',
        descriptionTemplate: 'Zeitloses Armband aus {material}. {stil} vereint Eleganz mit Tragekomfort für den modernen Lifestyle.',
        careTemplate: 'Sanft mit weichem Tuch reinigen. Vor Parfum und Cremes schützen. Einzeln aufbewahren um Kratzer zu vermeiden.',
        isDefault: true
      }
    ];
    setTemplates(mockTemplates);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => typeof p.category === 'object' ? p.category.name : p.category)))];

  const handleSaveProduct = () => {
    if (!selectedProduct) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const updatedProducts = products.map(p => 
        p.id === selectedProduct.id 
          ? { ...selectedProduct, lastUpdated: new Date().toISOString().split('T')[0], updatedBy: 'Current User' }
          : p
      );
      setProducts(updatedProducts);
      setIsEditing(false);
      setLoading(false);
      toast.success('Produktinhalte erfolgreich gespeichert! 🎉');
    }, 1000);
  };

  const handleApplyTemplate = (template: ContentTemplate) => {
    if (!selectedProduct) return;

    const updatedProduct = {
      ...selectedProduct,
      description: template.descriptionTemplate,
      careInstructions: template.careTemplate
    };
    setSelectedProduct(updatedProduct);
    toast.success(`Vorlage "${template.name}" angewendet! 📝`);
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;

    const updatedTemplates = templates.map(t => 
      t.id === selectedTemplate.id ? selectedTemplate : t
    );
    setTemplates(updatedTemplates);
    toast.success('Vorlage gespeichert! 📄');
  };

  const handleCreateNewTemplate = () => {
    const newTemplate: ContentTemplate = {
      id: `template-${Date.now()}`,
      name: 'Neue Vorlage',
      category: 'Allgemein',
      descriptionTemplate: 'Beschreibungsvorlage für {kategorie}...',
      careTemplate: 'Pflegehinweise für {kategorie}...',
      isDefault: false
    };
    setTemplates([...templates, newTemplate]);
    setSelectedTemplate(newTemplate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-cormorant text-3xl text-elbfunkeln-green mb-2 flex items-center justify-center gap-2">
          <FileText size={32} />
          Produktbeschreibungen & Pflege
        </h2>
        <p className="font-inter text-elbfunkeln-green/70">
          Verwalten Sie alle Produktbeschreibungen und Pflegehinweise zentral
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 bg-elbfunkeln-beige/30">
          <TabsTrigger value="products" className="gap-2">
            <BookOpen size={16} />
            Produktinhalte
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText size={16} />
            Vorlagen
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Product List */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green">Produkte</h3>
                  <Badge variant="outline">{filteredProducts.length} Produkte</Badge>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Suchen</Label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-elbfunkeln-green/50" />
                      <Input
                        placeholder="Produktname oder Beschreibung..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white border-elbfunkeln-green/20"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Kategorie</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="bg-white border-elbfunkeln-green/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat === 'all' ? 'Alle Kategorien' : cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Product List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedProduct?.id === product.id
                          ? 'bg-elbfunkeln-lavender/20 border border-elbfunkeln-lavender'
                          : 'bg-elbfunkeln-beige/30 hover:bg-elbfunkeln-beige/50'
                      }`}
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsEditing(false);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-cormorant text-elbfunkeln-green">{product.name}</h4>
                          <p className="font-inter text-xs text-elbfunkeln-green/60 mb-2">
                            {typeof product.category === 'object' ? product.category.name : product.category} • SKU: {product.id}
                          </p>
                          <p className="font-inter text-sm text-elbfunkeln-green/70 line-clamp-2">
                            {product.description.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {product.lastUpdated}
                            </Badge>
                            <span className="font-inter text-xs text-elbfunkeln-green/50">
                              von {product.updatedBy}
                            </span>
                          </div>
                        </div>
                        <Tag size={16} className="text-elbfunkeln-lavender mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Product Editor */}
            <Card className="p-6">
              {selectedProduct ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-cormorant text-xl text-elbfunkeln-green">
                      {selectedProduct.name}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="border-elbfunkeln-green/30"
                      >
                        {isEditing ? <Eye size={14} /> : <Edit3 size={14} />}
                        {isEditing ? 'Ansicht' : 'Bearbeiten'}
                      </Button>
                      {isEditing && (
                        <Button
                          size="sm"
                          onClick={handleSaveProduct}
                          disabled={loading}
                          className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90"
                        >
                          <Save size={14} className="mr-1" />
                          Speichern
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Template Application */}
                  {isEditing && (
                    <div className="p-3 bg-elbfunkeln-beige/30 rounded-lg">
                      <Label className="text-sm mb-2 block">Vorlage anwenden</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {templates
                          .filter(t => t.category === selectedProduct.category || t.category === 'Allgemein')
                          .map(template => (
                            <Button
                              key={template.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handleApplyTemplate(template)}
                              className="text-xs border-elbfunkeln-lavender/50 text-elbfunkeln-green hover:bg-elbfunkeln-lavender/20"
                            >
                              {template.name}
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Product Content */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Kategorie</Label>
                        <Input
                          value={selectedProduct.category}
                          onChange={(e) => setSelectedProduct({
                            ...selectedProduct,
                            category: e.target.value
                          })}
                          disabled={!isEditing}
                          className="bg-white border-elbfunkeln-green/20"
                        />
                      </div>
                      <div>
                        <Label>SKU</Label>
                        <Input
                          value={selectedProduct.id}
                          disabled
                          className="bg-elbfunkeln-beige/30 border-elbfunkeln-green/20"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <Label>Produktbeschreibung</Label>
                      <Textarea
                        placeholder="Beschreibung des Produkts..."
                        value={selectedProduct.description}
                        onChange={(e) => setSelectedProduct({
                          ...selectedProduct,
                          description: e.target.value
                        })}
                        disabled={!isEditing}
                        rows={3}
                        className="bg-white border-elbfunkeln-green/20 resize-none"
                      />
                    </div>

                    {/* Detailed Description */}
                    <div>
                      <Label>Ausführliche Beschreibung</Label>
                      <Textarea
                        placeholder="Detaillierte Produktinformationen..."
                        value={selectedProduct.detailedDescription || ''}
                        onChange={(e) => setSelectedProduct({
                          ...selectedProduct,
                          detailedDescription: e.target.value
                        })}
                        disabled={!isEditing}
                        rows={3}
                        className="bg-white border-elbfunkeln-green/20 resize-none"
                      />
                    </div>

                    {/* Care Instructions */}
                    <div>
                      <Label>Pflegehinweise</Label>
                      <Textarea
                        placeholder="Anweisungen zur Pflege und Aufbewahrung..."
                        value={selectedProduct.careInstructions}
                        onChange={(e) => setSelectedProduct({
                          ...selectedProduct,
                          careInstructions: e.target.value
                        })}
                        disabled={!isEditing}
                        rows={3}
                        className="bg-white border-elbfunkeln-green/20 resize-none"
                      />
                    </div>

                    {/* Materials & Dimensions */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Materialien</Label>
                        <Input
                          placeholder="z.B. 925er Silber, Perlen..."
                          value={selectedProduct.materials?.join(', ') || ''}
                          onChange={(e) => setSelectedProduct({
                            ...selectedProduct,
                            materials: e.target.value.split(', ').filter(Boolean)
                          })}
                          disabled={!isEditing}
                          className="bg-white border-elbfunkeln-green/20"
                        />
                      </div>
                      <div>
                        <Label>Abmessungen</Label>
                        <Input
                          placeholder="z.B. 3cm x 1.5cm"
                          value={selectedProduct.dimensions || ''}
                          onChange={(e) => setSelectedProduct({
                            ...selectedProduct,
                            dimensions: e.target.value
                          })}
                          disabled={!isEditing}
                          className="bg-white border-elbfunkeln-green/20"
                        />
                      </div>
                    </div>

                    {/* Key Features */}
                    <div>
                      <Label>Besondere Merkmale</Label>
                      <Input
                        placeholder="z.B. Handgefertigt, Unikat, Nickelfrei..."
                        value={selectedProduct.keyFeatures?.join(', ') || ''}
                        onChange={(e) => setSelectedProduct({
                          ...selectedProduct,
                          keyFeatures: e.target.value.split(', ').filter(Boolean)
                        })}
                        disabled={!isEditing}
                        className="bg-white border-elbfunkeln-green/20"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto text-elbfunkeln-green/30 mb-4" />
                  <p className="font-inter text-elbfunkeln-green/60">
                    Wählen Sie ein Produkt aus der Liste aus
                  </p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Template List */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green">Vorlagen</h3>
                  <Button
                    size="sm"
                    onClick={handleCreateNewTemplate}
                    className="bg-elbfunkeln-lavender text-white hover:bg-elbfunkeln-lavender/90"
                  >
                    <Plus size={14} className="mr-1" />
                    Neue Vorlage
                  </Button>
                </div>

                <div className="space-y-3">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedTemplate?.id === template.id
                          ? 'bg-elbfunkeln-lavender/20 border border-elbfunkeln-lavender'
                          : 'bg-elbfunkeln-beige/30 hover:bg-elbfunkeln-beige/50'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-cormorant text-elbfunkeln-green">{template.name}</h4>
                          <p className="font-inter text-sm text-elbfunkeln-green/60">
                            {template.category}
                            {template.isDefault && ' • Standard'}
                          </p>
                        </div>
                        {template.isDefault && (
                          <Badge className="bg-elbfunkeln-green text-white">Standard</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Template Editor */}
            <Card className="p-6">
              {selectedTemplate ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-cormorant text-xl text-elbfunkeln-green">
                      Vorlage bearbeiten
                    </h3>
                    <Button
                      size="sm"
                      onClick={handleSaveTemplate}
                      className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90"
                    >
                      <Save size={14} className="mr-1" />
                      Speichern
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Name der Vorlage</Label>
                        <Input
                          value={selectedTemplate.name}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            name: e.target.value
                          })}
                          className="bg-white border-elbfunkeln-green/20"
                        />
                      </div>
                      <div>
                        <Label>Kategorie</Label>
                        <Input
                          value={selectedTemplate.category}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            category: e.target.value
                          })}
                          className="bg-white border-elbfunkeln-green/20"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Beschreibungsvorlage</Label>
                      <Textarea
                        placeholder="Verwenden Sie {platzhalter} für variable Inhalte..."
                        value={selectedTemplate.descriptionTemplate}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate,
                          descriptionTemplate: e.target.value
                        })}
                        rows={4}
                        className="bg-white border-elbfunkeln-green/20 resize-none"
                      />
                      <p className="font-inter text-xs text-elbfunkeln-green/50 mt-1">
                        Tipp: Verwenden Sie {'{material}'}, {'{design}'}, {'{besonderheit}'} als Platzhalter
                      </p>
                    </div>

                    <div>
                      <Label>Pflegevorlage</Label>
                      <Textarea
                        placeholder="Standard-Pflegehinweise für diese Kategorie..."
                        value={selectedTemplate.careTemplate}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate,
                          careTemplate: e.target.value
                        })}
                        rows={4}
                        className="bg-white border-elbfunkeln-green/20 resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTemplate.isDefault}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate,
                          isDefault: e.target.checked
                        })}
                        className="rounded border-elbfunkeln-lavender"
                      />
                      <Label className="text-sm">Als Standardvorlage markieren</Label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-elbfunkeln-green/30 mb-4" />
                  <p className="font-inter text-elbfunkeln-green/60">
                    Wählen Sie eine Vorlage aus oder erstellen Sie eine neue
                  </p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}