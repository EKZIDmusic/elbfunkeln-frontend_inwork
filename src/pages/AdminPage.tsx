import { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  Mail, 
  Percent,
  Settings,
  TrendingUp,
  Eye,
  EyeOff,
  Sparkles,
  DollarSign,
  Star,
  Calendar,
  FileText
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ProductManager } from '../components/admin/ProductManager';
import { EnhancedProductManager } from '../components/admin/EnhancedProductManager';
import { ProductManagerWithArchive } from '../components/admin/ProductManagerWithArchive';
import { ProductContentManager } from '../components/admin/ProductContentManager';
import { AnalyticsManager } from '../components/admin/AnalyticsManager';
import { NewsletterManager } from '../components/admin/NewsletterManager';
import { DiscountManager } from '../components/admin/DiscountManager';
import { SalesManager } from '../components/admin/SalesManager';
import { OrderManagerSimple } from '../components/admin/OrderManagerSimple';
import { useRouter } from '../components/Router';

// AdminOverview Component
function AdminOverview() {
  const { navigateTo } = useRouter();

  const handleQuickAction = (action: string) => {
    if (action === 'slider-demo') {
      navigateTo('admin-slider-test');
    } else {
      // Handle other actions by setting the current view
      // This would be handled in the parent component normally
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-cormorant text-3xl text-elbfunkeln-green mb-2">
          Shop-Übersicht
        </h2>
        <p className="font-inter text-elbfunkeln-green/70">
          Willkommen in Ihrer Elbfunkeln Shop-Verwaltung
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Gesamtumsatz',
            value: '€2.847,50',
            icon: DollarSign,
            change: '+12.5%',
            changeType: 'positive'
          },
          {
            title: 'Bestellungen',
            value: '47',
            icon: ShoppingCart,
            change: '+8 diese Woche',
            changeType: 'positive'
          },
          {
            title: 'Produkte',
            value: '23',
            icon: Package,
            change: '3 aktiv',
            changeType: 'neutral'
          },
          {
            title: 'Newsletter',
            value: '156',
            icon: Mail,
            change: '+12 diese Woche',
            changeType: 'positive'
          }
        ].map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-inter text-sm text-elbfunkeln-green/70 mb-1">
                  {stat.title}
                </p>
                <h3 className="font-cormorant text-2xl text-elbfunkeln-green">
                  {stat.value}
                </h3>
                <p className={`font-inter text-xs mt-1 ${
                  stat.changeType === 'positive' 
                    ? 'text-green-600' 
                    : stat.changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-elbfunkeln-green/70'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className="p-3 bg-elbfunkeln-lavender/20 rounded-full">
                <stat.icon className="w-6 h-6 text-elbfunkeln-lavender" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
          Schnellaktionen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Neues Produkt',
              description: 'Fügen Sie ein neues Schmuckstück hinzu',
              icon: Package,
              action: 'products'
            },
            {
              title: 'Newsletter senden',
              description: 'Erstellen Sie eine neue Kampagne',
              icon: Mail,
              action: 'newsletter'
            },
            {
              title: 'Rabattcode',
              description: 'Erstellen Sie einen neuen Gutschein',
              icon: Percent,
              action: 'discounts'
            },
            {
              title: 'Sale starten',
              description: 'Neue Sale-Aktion einrichten',
              icon: Sparkles,
              action: 'sales'
            },
            {
              title: 'Bestellungen',
              description: 'Offene Bestellungen bearbeiten',
              icon: ShoppingCart,
              action: 'orders'
            },
            {
              title: 'Analysen',
              description: 'Verkaufsdaten analysieren',
              icon: TrendingUp,
              action: 'analytics'
            },
            {
              title: 'Slider Demo',
              description: 'Animierte Schieberegler testen',
              icon: Settings,
              action: 'slider-demo'
            }
          ].map((action, index) => (
            <Card 
              key={index} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer hover:scale-105 active:scale-95 duration-300"
              onClick={() => handleQuickAction(action.action)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-elbfunkeln-beige rounded-lg">
                  <action.icon className="w-5 h-5 text-elbfunkeln-green" />
                </div>
                <div className="flex-1">
                  <h4 className="font-cormorant text-lg text-elbfunkeln-green mb-1">
                    {action.title}
                  </h4>
                  <p className="font-inter text-sm text-elbfunkeln-green/70">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
          Letzte Aktivitäten
        </h3>
        <Card className="p-6">
          <div className="space-y-4">
            {[
              {
                icon: ShoppingCart,
                title: 'Neue Bestellung #1047',
                description: 'Sarah M. - Spiralen-Ohrringe "Elbe"',
                time: 'vor 2 Stunden',
                type: 'order'
              },
              {
                icon: Package,
                title: 'Produkt aktualisiert',
                description: 'Eleganter Ring - Preis geändert',
                time: 'vor 5 Stunden',
                type: 'product'
              },
              {
                icon: Mail,
                title: 'Newsletter gesendet',
                description: 'Frühjahr-Kollektion 2024 - 156 Empfänger',
                time: 'vor 1 Tag',
                type: 'newsletter'
              },
              {
                icon: Star,
                title: 'Neue Bewertung',
                description: '5 Sterne für Minimalistisches Armband',
                time: 'vor 2 Tagen',
                type: 'review'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 py-2">
                <div className={`p-2 rounded-full ${
                  activity.type === 'order' ? 'bg-green-100 text-green-600' :
                  activity.type === 'product' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'newsletter' ? 'bg-purple-100 text-purple-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h5 className="font-inter text-sm text-elbfunkeln-green">
                    {activity.title}
                  </h5>
                  <p className="font-inter text-xs text-elbfunkeln-green/70">
                    {activity.description}
                  </p>
                </div>
                <span className="font-inter text-xs text-elbfunkeln-green/50">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tips & Help */}
      <div>
        <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
          Tipps & Hilfe
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-elbfunkeln-beige/30">
            <h4 className="font-cormorant text-lg text-elbfunkeln-green mb-2">
              💡 Produktfotografie-Tipp
            </h4>
            <p className="font-inter text-sm text-elbfunkeln-green/80">
              Nutzen Sie natürliches Licht und einen neutralen Hintergrund für die besten Produktfotos. 
              Dies hebt die Details Ihrer handgefertigten Schmuckstücke hervor.
            </p>
          </Card>
          <Card className="p-4 bg-elbfunkeln-lavender/20">
            <h4 className="font-cormorant text-lg text-elbfunkeln-green mb-2">
              📈 Verkaufstipp
            </h4>
            <p className="font-inter text-sm text-elbfunkeln-green/80">
              Erstellen Sie regelmäßig Newsletter mit Styling-Tipps und neuen Kollektionen. 
              Dies baut Vertrauen auf und steigert die Kundenbindung.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function AdminPage() {
  const [currentView, setCurrentView] = useState('overview');
  const [showEnhancedProducts, setShowEnhancedProducts] = useState(false);

  const navigationItems = [
    {
      id: 'overview',
      label: 'Übersicht',
      icon: BarChart3,
      description: 'Dashboard und Statistiken'
    },
    {
      id: 'products',
      label: 'Produktverwaltung',
      icon: Package,
      description: 'Produkte erstellen und bearbeiten',
      badge: 'Erweitert'
    },
    {
      id: 'content',
      label: 'Beschreibungen',
      icon: FileText,
      description: 'Produktbeschreibungen und Pflege',
      badge: 'Neu'
    },
    {
      id: 'orders',
      label: 'Bestellungen',
      icon: ShoppingCart,
      description: 'Bestellverwaltung'
    },
    {
      id: 'analytics',
      label: 'Analysen',
      icon: TrendingUp,
      description: 'Verkaufsanalysen und Reports'
    },
    {
      id: 'newsletter',
      label: 'Newsletter',
      icon: Mail,
      description: 'Newsletter-Kampagnen verwalten'
    },
    {
      id: 'discounts',
      label: 'Rabattcodes',
      icon: Percent,
      description: 'Gutscheine und Rabatte'
    },
    {
      id: 'sales',
      label: 'Sale-Verwaltung',
      icon: Sparkles,
      description: 'Sale-Aktionen verwalten'
    }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <AdminOverview />;
      case 'products':
        return <ProductManagerWithArchive />;
      case 'content':
        return <ProductContentManager />;
      case 'orders':
        return <OrderManagerSimple />;
      case 'analytics':
        return <AnalyticsManager />;
      case 'newsletter':
        return <NewsletterManager />;
      case 'discounts':
        return <DiscountManager />;
      case 'sales':
        return <SalesManager />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-elbfunkeln-beige/20 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-cormorant text-4xl text-elbfunkeln-green mb-2">
            👩‍💼 Shop-Verwaltung
          </h1>
          <p className="font-inter text-elbfunkeln-green/70">
            Verwalten Sie Ihren Elbfunkeln Online-Shop
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-32">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      currentView === item.id
                        ? 'bg-elbfunkeln-lavender text-white shadow-md'
                        : 'hover:bg-elbfunkeln-beige/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-inter text-sm">{item.label}</span>
                          {item.badge && (
                            <Badge className="bg-elbfunkeln-rose text-white text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Enhanced Products Toggle */}
              {currentView === 'products' && (
                <div className="mt-6 pt-4 border-t border-elbfunkeln-lavender/20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEnhancedProducts(!showEnhancedProducts)}
                    className="w-full border-elbfunkeln-lavender text-elbfunkeln-green hover:bg-elbfunkeln-lavender hover:text-white"
                  >
                    {showEnhancedProducts ? (
                      <>
                        <EyeOff size={14} className="mr-2" />
                        Einfache Ansicht
                      </>
                    ) : (
                      <>
                        <Eye size={14} className="mr-2" />
                        Erweiterte Ansicht
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-elbfunkeln-green/60 mt-2 text-center">
                    {showEnhancedProducts 
                      ? 'Erweiterte Produktverwaltung mit anpassbaren Attributen'
                      : 'Wechseln zur erweiterten Produktverwaltung'
                    }
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6 min-h-[600px]">
              {renderContent()}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}