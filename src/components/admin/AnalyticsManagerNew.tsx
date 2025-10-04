import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Users, Eye, ShoppingBag, Calendar, Download, Settings, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';
import { setAnalyticsConfig, getCurrentAnalyticsConfig, initializeAnalytics } from '../../utils/analytics-init';

export function AnalyticsManagerNew() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [trackingSettings, setTrackingSettings] = useState({
    pageViews: true,
    userEvents: true,
    ecommerce: true,
    conversions: true
  });

  const [analyticsIds, setAnalyticsIds] = useState({
    GA_MEASUREMENT_ID: '',
    FB_PIXEL_ID: '',
    HOTJAR_ID: ''
  });

  const [configStatus, setConfigStatus] = useState({
    ga: false,
    fb: false,
    hotjar: false
  });

  // Load current configuration on mount
  useEffect(() => {
    const currentConfig = getCurrentAnalyticsConfig();
    setAnalyticsIds({
      GA_MEASUREMENT_ID: currentConfig.GA_MEASUREMENT_ID || '',
      FB_PIXEL_ID: currentConfig.FB_PIXEL_ID || '',
      HOTJAR_ID: currentConfig.HOTJAR_ID || ''
    });

    // Check configuration status
    setConfigStatus({
      ga: !!(currentConfig.GA_MEASUREMENT_ID && currentConfig.GA_MEASUREMENT_ID.startsWith('G-')),
      fb: !!(currentConfig.FB_PIXEL_ID && currentConfig.FB_PIXEL_ID.length > 5),
      hotjar: !!(currentConfig.HOTJAR_ID && currentConfig.HOTJAR_ID.length > 3)
    });
  }, []);

  // Mock analytics data
  const pageViewsData = [
    { name: 'Jan', views: 4000, users: 2400 },
    { name: 'Feb', views: 3000, users: 1398 },
    { name: 'Mar', views: 2000, users: 9800 },
    { name: 'Apr', views: 2780, users: 3908 },
    { name: 'May', views: 1890, users: 4800 },
    { name: 'Jun', views: 2390, users: 3800 }
  ];

  const trafficSources = [
    { name: 'Organic', value: 45, color: '#8884d8' },
    { name: 'Direct', value: 30, color: '#82ca9d' },
    { name: 'Social', value: 15, color: '#ffc658' },
    { name: 'Email', value: 10, color: '#ff7300' }
  ];

  const topPages = [
    { page: '/shop', views: 1240, conversion: '3.2%' },
    { page: '/', views: 890, conversion: '2.1%' },
    { page: '/product/elegant-earrings', views: 456, conversion: '8.9%' },
    { page: '/about', views: 234, conversion: '1.5%' },
    { page: '/contact', views: 123, conversion: '4.2%' }
  ];

  const handleSettingChange = (setting: string, value: boolean) => {
    setTrackingSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    toast.success(`${setting} tracking ${value ? 'aktiviert' : 'deaktiviert'}`);
  };

  const handleAnalyticsIdChange = (key: string, value: string) => {
    setAnalyticsIds(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const validateIds = () => {
    const errors = [];
    
    if (analyticsIds.GA_MEASUREMENT_ID && !analyticsIds.GA_MEASUREMENT_ID.startsWith('G-')) {
      errors.push('Google Analytics ID muss mit "G-" beginnen');
    }
    
    if (analyticsIds.FB_PIXEL_ID && (!/^\d+$/.test(analyticsIds.FB_PIXEL_ID) || analyticsIds.FB_PIXEL_ID.length < 6)) {
      errors.push('Facebook Pixel ID muss eine numerische ID mit mindestens 6 Ziffern sein');
    }
    
    if (analyticsIds.HOTJAR_ID && (!/^\d+$/.test(analyticsIds.HOTJAR_ID) || analyticsIds.HOTJAR_ID.length < 4)) {
      errors.push('Hotjar ID muss eine numerische ID mit mindestens 4 Ziffern sein');
    }

    return errors;
  };

  const saveAnalyticsConfig = () => {
    const errors = validateIds();
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    // Filter out empty values
    const configToSave = Object.fromEntries(
      Object.entries(analyticsIds).filter(([key, value]) => value.trim() !== '')
    );

    const success = setAnalyticsConfig(configToSave);
    
    if (success) {
      toast.success('Analytics-Konfiguration gespeichert!');
      
      // Update status
      setConfigStatus({
        ga: !!(configToSave.GA_MEASUREMENT_ID && configToSave.GA_MEASUREMENT_ID.startsWith('G-')),
        fb: !!(configToSave.FB_PIXEL_ID && configToSave.FB_PIXEL_ID.length > 5),
        hotjar: !!(configToSave.HOTJAR_ID && configToSave.HOTJAR_ID.length > 3)
      });

      // Reinitialize analytics with new config
      try {
        initializeAnalytics();
        toast.success('Analytics wurde mit neuer Konfiguration initialisiert');
      } catch (error) {
        console.error('Analytics reinitialization failed:', error);
        toast.warning('Konfiguration gespeichert, aber Neuinitialisierung fehlgeschlagen');
      }
    } else {
      toast.error('Fehler beim Speichern der Konfiguration');
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-elbfunkeln-green" />
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green">Analytics & Tracking</h2>
        </div>
        <Badge variant={analyticsEnabled ? 'default' : 'secondary'}>
          {analyticsEnabled ? 'Aktiv' : 'Inaktiv'}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="ecommerce">E-Commerce</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Configuration Status */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Analytics-Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(configStatus.ga)}
                <span className="text-sm">Google Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(configStatus.fb)}
                <span className="text-sm">Facebook Pixel</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(configStatus.hotjar)}
                <span className="text-sm">Hotjar</span>
              </div>
            </div>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Seitenaufrufe</p>
                  <p className="text-2xl font-bold">12,345</p>
                  <p className="text-xs text-green-600">+15% vs. letzter Monat</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Unique Visitors</p>
                  <p className="text-2xl font-bold">3,456</p>
                  <p className="text-xs text-green-600">+8% vs. letzter Monat</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Conversions</p>
                  <p className="text-2xl font-bold">123</p>
                  <p className="text-xs text-green-600">+22% vs. letzter Monat</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">3.6%</p>
                  <p className="text-xs text-red-600">-2% vs. letzter Monat</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Top Seiten</h3>
            <div className="space-y-2">
              {topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{page.page}</p>
                    <p className="text-sm text-gray-600">{page.views} Aufrufe</p>
                  </div>
                  <Badge variant="outline">{page.conversion}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* E-Commerce Tab */}
        <TabsContent value="ecommerce" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Gesamtumsatz</h4>
              <p className="text-3xl font-bold text-green-600">€4,567</p>
              <p className="text-sm text-gray-600">Dieser Monat</p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-2">Ø Bestellwert</h4>
              <p className="text-3xl font-bold text-blue-600">€37.12</p>
              <p className="text-sm text-gray-600">+€2.45 vs. letzter Monat</p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-2">Abbruchrate</h4>
              <p className="text-3xl font-bold text-orange-600">68%</p>
              <p className="text-sm text-gray-600">Warenkorb-Abbrüche</p>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Tracking-Einstellungen
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics-enabled">Analytics aktiviert</Label>
                  <p className="text-sm text-gray-600">Grundlegende Website-Analytics</p>
                </div>
                <Switch
                  id="analytics-enabled"
                  checked={analyticsEnabled}
                  onCheckedChange={setAnalyticsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pageviews">Seitenaufrufe tracken</Label>
                  <p className="text-sm text-gray-600">Verfolge alle Seitenaufrufe</p>
                </div>
                <Switch
                  id="pageviews"
                  checked={trackingSettings.pageViews}
                  onCheckedChange={(value) => handleSettingChange('pageViews', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="user-events">Nutzer-Events</Label>
                  <p className="text-sm text-gray-600">Clicks, Scrolls, etc.</p>
                </div>
                <Switch
                  id="user-events"
                  checked={trackingSettings.userEvents}
                  onCheckedChange={(value) => handleSettingChange('userEvents', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ecommerce-tracking">E-Commerce Tracking</Label>
                  <p className="text-sm text-gray-600">Käufe, Warenkorb-Events</p>
                </div>
                <Switch
                  id="ecommerce-tracking"
                  checked={trackingSettings.ecommerce}
                  onCheckedChange={(value) => handleSettingChange('ecommerce', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="conversions">Conversion Tracking</Label>
                  <p className="text-sm text-gray-600">Goals und Conversions</p>
                </div>
                <Switch
                  id="conversions"
                  checked={trackingSettings.conversions}
                  onCheckedChange={(value) => handleSettingChange('conversions', value)}
                />
              </div>
            </div>
          </Card>

          {/* Analytics IDs Configuration */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Analytics IDs konfigurieren
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="ga-id">Google Analytics Measurement ID</Label>
                  {getStatusIcon(configStatus.ga)}
                </div>
                <Input 
                  id="ga-id" 
                  placeholder="G-XXXXXXXXXX" 
                  value={analyticsIds.GA_MEASUREMENT_ID}
                  onChange={(e) => handleAnalyticsIdChange('GA_MEASUREMENT_ID', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">Format: G-XXXXXXXXXX</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="fb-pixel">Facebook Pixel ID</Label>
                  {getStatusIcon(configStatus.fb)}
                </div>
                <Input 
                  id="fb-pixel" 
                  placeholder="1234567890" 
                  value={analyticsIds.FB_PIXEL_ID}
                  onChange={(e) => handleAnalyticsIdChange('FB_PIXEL_ID', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">Numerische ID aus Facebook Events Manager</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="hotjar-id">Hotjar Site ID</Label>
                  {getStatusIcon(configStatus.hotjar)}
                </div>
                <Input 
                  id="hotjar-id" 
                  placeholder="3456789" 
                  value={analyticsIds.HOTJAR_ID}
                  onChange={(e) => handleAnalyticsIdChange('HOTJAR_ID', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">Site ID aus Hotjar Dashboard</p>
              </div>

              <Button 
                onClick={saveAnalyticsConfig}
                className="w-full bg-elbfunkeln-green text-white"
              >
                Analytics-Konfiguration speichern
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}