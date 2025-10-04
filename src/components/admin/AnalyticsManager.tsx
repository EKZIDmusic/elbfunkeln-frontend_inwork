import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, ShoppingCart, 
  Euro, Calendar, Filter, Download, RefreshCw, Eye, Clock,
  Package, MapPin, Star, Target, Zap, Award
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { mockAdminStats } from '../../data/adminData';
import { products } from '../../data/products';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  orders: {
    current: number;
    previous: number;
    growth: number;
  };
  customers: {
    current: number;
    previous: number;
    growth: number;
  };
  conversionRate: {
    current: number;
    previous: number;
    growth: number;
  };
}

interface ProductAnalytics {
  id: string;
  name: string;
  views: number;
  sales: number;
  revenue: number;
  conversionRate: number;
  trending: 'up' | 'down' | 'stable';
}

interface CustomerSegment {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
  color: string;
}

export function AnalyticsManager() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    revenue: { current: 12450.75, previous: 10820.30, growth: 15.1 },
    orders: { current: 156, previous: 143, growth: 9.1 },
    customers: { current: 89, previous: 78, growth: 14.1 },
    conversionRate: { current: 3.2, previous: 2.8, growth: 14.3 }
  };

  const productAnalytics: ProductAnalytics[] = [
    {
      id: '1',
      name: 'Zarte Draht-Ohrringe 🌸',
      views: 1250,
      sales: 45,
      revenue: 2025,
      conversionRate: 3.6,
      trending: 'up'
    },
    {
      id: '4',
      name: 'Handgefertigte Kette 🌟',
      views: 980,
      sales: 32,
      revenue: 2080,
      trending: 'up'
    },
    {
      id: '2',
      name: 'Minimalistisches Armband ✨',
      views: 765,
      sales: 28,
      revenue: 980,
      conversionRate: 3.7,
      trending: 'stable'
    },
    {
      id: '3',
      name: 'Eleganter Draht-Ring 💍',
      views: 654,
      sales: 23,
      revenue: 644,
      conversionRate: 3.5,
      trending: 'down'
    }
  ];

  const customerSegments: CustomerSegment[] = [
    { name: 'VIP Kunden', count: 12, revenue: 4500, percentage: 36, color: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
    { name: 'Stammkunden', count: 34, revenue: 5200, percentage: 42, color: 'bg-gradient-to-r from-green-400 to-green-600' },
    { name: 'Gelegenheitskäufer', count: 28, revenue: 1800, percentage: 15, color: 'bg-gradient-to-r from-blue-400 to-blue-600' },
    { name: 'Neukunden', count: 15, revenue: 950, percentage: 7, color: 'bg-gradient-to-r from-purple-400 to-purple-600' }
  ];

  const trafficSources = [
    { source: 'Direkt', visitors: 2340, percentage: 35, color: 'elbfunkeln-green' },
    { source: 'Google', visitors: 1890, percentage: 28, color: 'elbfunkeln-lavender' },
    { source: 'Social Media', visitors: 1240, percentage: 19, color: 'elbfunkeln-rose' },
    { source: 'E-Mail', visitors: 780, percentage: 12, color: 'elbfunkeln-beige' },
    { source: 'Andere', visitors: 400, percentage: 6, color: 'gray-400' }
  ];

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendingIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="font-cormorant text-2xl text-elbfunkeln-green mb-2">
            Analytics Dashboard 📊
          </h2>
          <p className="text-elbfunkeln-green/70">
            Umfassende Einblicke in Ihre Shop-Performance
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Tage</SelectItem>
              <SelectItem value="30d">30 Tage</SelectItem>
              <SelectItem value="90d">90 Tage</SelectItem>
              <SelectItem value="365d">1 Jahr</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Umsatz',
            value: `€${analyticsData.revenue.current.toLocaleString()}`,
            previous: `€${analyticsData.revenue.previous.toLocaleString()}`,
            growth: analyticsData.revenue.growth,
            icon: Euro,
            color: 'elbfunkeln-green'
          },
          {
            title: 'Bestellungen',
            value: analyticsData.orders.current.toString(),
            previous: analyticsData.orders.previous.toString(),
            growth: analyticsData.orders.growth,
            icon: ShoppingCart,
            color: 'elbfunkeln-lavender'
          },
          {
            title: 'Kunden',
            value: analyticsData.customers.current.toString(),
            previous: analyticsData.customers.previous.toString(),
            growth: analyticsData.customers.growth,
            icon: Users,
            color: 'elbfunkeln-rose'
          },
          {
            title: 'Conversion Rate',
            value: `${analyticsData.conversionRate.current}%`,
            previous: `${analyticsData.conversionRate.previous}%`,
            growth: analyticsData.conversionRate.growth,
            icon: Target,
            color: 'blue-500'
          }
        ].map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full bg-${metric.color === 'elbfunkeln-green' ? 'elbfunkeln-green' : metric.color}/10`}>
                  <metric.icon className={`w-6 h-6 text-${metric.color === 'elbfunkeln-green' ? 'elbfunkeln-green' : metric.color}`} />
                </div>
                {getGrowthIcon(metric.growth)}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-elbfunkeln-green/60">{metric.title}</p>
                <p className="text-2xl font-cormorant text-elbfunkeln-green font-semibold">
                  {metric.value}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${getGrowthColor(metric.growth)}`}>
                    {metric.growth > 0 ? '+' : ''}{metric.growth.toFixed(1)}%
                  </span>
                  <span className="text-xs text-elbfunkeln-green/40">
                    vs. vorherige Periode
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-elbfunkeln-beige/20">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="products">Produkte</TabsTrigger>
          <TabsTrigger value="customers">Kunden</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart Placeholder */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-cormorant text-lg text-elbfunkeln-green">
                  Umsatz-Entwicklung 📈
                </h3>
                <Badge variant="outline">Letzten {timeRange}</Badge>
              </div>
              <div className="h-64 bg-gradient-to-br from-elbfunkeln-beige/20 to-elbfunkeln-lavender/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-elbfunkeln-green/40 mx-auto mb-2" />
                  <p className="text-elbfunkeln-green/60">Umsatz-Chart</p>
                  <p className="text-sm text-elbfunkeln-green/40">Hier würde ein interaktives Diagramm angezeigt</p>
                </div>
              </div>
            </Card>

            {/* Orders Chart Placeholder */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-cormorant text-lg text-elbfunkeln-green">
                  Bestellungen 📦
                </h3>
                <Badge variant="outline">Letzten {timeRange}</Badge>
              </div>
              <div className="h-64 bg-gradient-to-br from-elbfunkeln-rose/20 to-elbfunkeln-lavender/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ShoppingCart className="w-12 h-12 text-elbfunkeln-rose/40 mx-auto mb-2" />
                  <p className="text-elbfunkeln-green/60">Bestellungs-Chart</p>
                  <p className="text-sm text-elbfunkeln-green/40">Hier würde ein interaktives Diagramm angezeigt</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-green-100">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-cormorant text-elbfunkeln-green">Bestseller</h4>
              </div>
              <div className="space-y-2">
                {mockAdminStats.topProducts.slice(0, 3).map((product, index) => (
                  <div key={product.id} className="flex justify-between items-center">
                    <span className="text-sm text-elbfunkeln-green">{product.name}</span>
                    <Badge variant="outline" className="text-xs">{product.sales}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-cormorant text-elbfunkeln-green">Letzte Aktivität</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-elbfunkeln-green/70">Neue Bestellung</span>
                  <span className="text-elbfunkeln-green/50">vor 2h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-elbfunkeln-green/70">Neuer Kunde</span>
                  <span className="text-elbfunkeln-green/50">vor 4h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-elbfunkeln-green/70">Newsletter Anmeldung</span>
                  <span className="text-elbfunkeln-green/50">vor 6h</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-purple-100">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-cormorant text-elbfunkeln-green">Performance</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-elbfunkeln-green/70">Ladezeit</span>
                    <span className="text-elbfunkeln-green">1.2s</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-elbfunkeln-green/70">SEO Score</span>
                    <span className="text-elbfunkeln-green">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <div className="p-6 border-b border-elbfunkeln-lavender/20">
              <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-2">
                Produkt-Performance 🏆
              </h3>
              <p className="text-elbfunkeln-green/70">
                Detaillierte Analyse Ihrer Produktleistung
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {productAnalytics.map((product, index) => (
                  <Card key={product.id} className="p-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-cormorant text-lg text-elbfunkeln-green">
                            {product.name}
                          </h4>
                          {getTrendingIcon(product.trending)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-elbfunkeln-green/60">Aufrufe:</span>
                            <div className="font-semibold text-elbfunkeln-green flex items-center gap-1">
                              <Eye size={14} />
                              {product.views.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-elbfunkeln-green/60">Verkäufe:</span>
                            <div className="font-semibold text-elbfunkeln-green flex items-center gap-1">
                              <ShoppingCart size={14} />
                              {product.sales}
                            </div>
                          </div>
                          <div>
                            <span className="text-elbfunkeln-green/60">Umsatz:</span>
                            <div className="font-semibold text-elbfunkeln-green flex items-center gap-1">
                              <Euro size={14} />
                              {product.revenue.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-elbfunkeln-green/60">Conversion:</span>
                            <div className="font-semibold text-elbfunkeln-green flex items-center gap-1">
                              <Target size={14} />
                              {product.conversionRate}%
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye size={14} className="mr-1" />
                          Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 size={14} className="mr-1" />
                          Report
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                Kundensegmente 👥
              </h3>
              <div className="space-y-4">
                {customerSegments.map((segment, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-elbfunkeln-green">{segment.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-elbfunkeln-green">
                          {segment.count} Kunden
                        </div>
                        <div className="text-xs text-elbfunkeln-green/60">
                          €{segment.revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${segment.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${segment.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-elbfunkeln-green/60">
                      {segment.percentage}% des Gesamtumsatzes
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                Kunden-Metriken 📊
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-elbfunkeln-green/70">Durchschnittlicher Warenkorbwert</span>
                    <span className="font-semibold text-elbfunkeln-green">€79.85</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-elbfunkeln-green/70">Wiederkäuferrate</span>
                    <span className="font-semibold text-elbfunkeln-green">34%</span>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-elbfunkeln-green/70">Kundenzufriedenheit</span>
                    <span className="font-semibold text-elbfunkeln-green">4.8/5</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-elbfunkeln-green/70">Newsletter-Abonnement-Rate</span>
                    <span className="font-semibold text-elbfunkeln-green">28%</span>
                  </div>
                  <Progress value={28} className="h-2" />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                Traffic-Quellen 🌐
              </h3>
              <div className="space-y-4">
                {trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${source.color}`} />
                      <span className="font-medium text-elbfunkeln-green">{source.source}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-elbfunkeln-green">
                        {source.visitors.toLocaleString()}
                      </div>
                      <div className="text-xs text-elbfunkeln-green/60">
                        {source.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
                Geografische Verteilung 🗺️
              </h3>
              <div className="space-y-3">
                {[
                  { country: 'Deutschland', visitors: 4200, percentage: 68 },
                  { country: 'Österreich', visitors: 890, percentage: 14 },
                  { country: 'Schweiz', visitors: 650, percentage: 11 },
                  { country: 'Niederlande', visitors: 230, percentage: 4 },
                  { country: 'Andere', visitors: 180, percentage: 3 }
                ].map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-elbfunkeln-green/60" />
                      <span className="text-elbfunkeln-green">{location.country}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-elbfunkeln-green">
                        {location.visitors.toLocaleString()}
                      </div>
                      <div className="text-xs text-elbfunkeln-green/60">
                        {location.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Device Analytics */}
          <Card className="p-6 mt-6">
            <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4">
              Geräte-Analyse 📱💻
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { device: 'Mobile', percentage: 58, visitors: 3625, color: 'elbfunkeln-lavender' },
                { device: 'Desktop', percentage: 34, visitors: 2125, color: 'elbfunkeln-green' },
                { device: 'Tablet', percentage: 8, visitors: 500, color: 'elbfunkeln-rose' }
              ].map((device, index) => (
                <div key={index} className="text-center">
                  <div className="mb-3">
                    <div className={`w-16 h-16 rounded-full bg-${device.color}/20 flex items-center justify-center mx-auto mb-2`}>
                      <span className={`text-2xl font-cormorant text-${device.color}`}>
                        {device.percentage}%
                      </span>
                    </div>
                    <h4 className="font-cormorant text-elbfunkeln-green">{device.device}</h4>
                    <p className="text-sm text-elbfunkeln-green/60">
                      {device.visitors.toLocaleString()} Besucher
                    </p>
                  </div>
                  <Progress value={device.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}