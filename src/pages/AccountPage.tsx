import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Package, Heart, Settings, LogOut, Edit, Camera, Eye, EyeOff, Key, AlertTriangle, Bell, Shield, CreditCard, MapPin, Globe, Phone, Mail, Download, Trash2, Plus, Check, X } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useRouter } from '../components/Router';
import { useAuth } from '../components/AuthContext';
import { useCart } from '../components/CartContext';
import { useAccountSettings } from '../components/useAccountSettings';
import { getWebsiteProducts, type WebsiteProduct } from '../services/productService';
import { products } from '../data/products';
import { useState as useStateAsync, useEffect } from 'react';

const mockUser = {
  name: 'Sarah Müller',
  email: 'sarah.mueller@example.com',
  phone: '+49 40 123 456 789',
  address: {
    street: 'Musterstraße 123',
    city: 'Hamburg',
    postalCode: '20359',
    country: 'Deutschland'
  },
  memberSince: '2022-03-15',
  totalOrders: 7,
  totalSpent: 425.50
};

const mockOrders = [
  {
    id: 'EB-2024-001',
    date: '2024-01-10',
    status: 'Geliefert',
    total: 87.00,
    items: [
      { product: products[0], quantity: 1 },
      { product: products[2], quantity: 1 }
    ]
  },
  {
    id: 'EB-2024-002',
    date: '2024-01-05',
    status: 'Unterwegs',
    total: 65.00,
    items: [
      { product: products[3], quantity: 1 }
    ]
  },
  {
    id: 'EB-2023-156',
    date: '2023-12-20',
    status: 'Geliefert',
    total: 128.00,
    items: [
      { product: products[1], quantity: 2 },
      { product: products[4], quantity: 1 }
    ]
  }
];

const mockWishlist = [products[1], products[3], products[5]];

export function AccountPage() {
  const { navigateTo } = useRouter();
  const { user, logout, updatePassword, updateProfile, resetPassword, isShopOwner } = useAuth();
  const { favorites, toggleFavorite, isFavorite, addToCart } = useCart();
  const { 
    settings, 
    loading: settingsLoading, 
    error: settingsError,
    updateCommunicationSettings,
    updateShippingPaymentSettings,
    updateSecuritySettings,
    addDeliveryAddress,
    deleteDeliveryAddress,
    addPaymentMethod,
    deletePaymentMethod,
    deactivateAccount,
    requestAccountDeletion,
    getLoginActivities,
    clearError
  } = useAccountSettings();
  const [allProducts, setAllProducts] = useStateAsync<WebsiteProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(isShopOwner() ? "orders" : "profile");
  
  // Load products for favorites display
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const websiteProducts = await getWebsiteProducts();
        setAllProducts(websiteProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to static products
        setAllProducts(products);
      } finally {
        setProductsLoading(false);
      }
    };
    
    loadProducts();
  }, []);
  
  // Get favorite products from all products
  const favoriteProducts = allProducts.filter(product => isFavorite(product.id));
  
  // Safely merge user data with mockUser as fallback
  const [userInfo, setUserInfo] = useState(() => {
    if (!user) return mockUser;
    
    return {
      ...mockUser,
      ...user,
      // Ensure we use user data when available, fallback to mock data
      name: user.name || mockUser.name,
      email: user.email || mockUser.email,
      phone: user.phone || mockUser.phone,
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ')[1] || '',
      address: {
        street: user.address?.street || mockUser.address?.street || '',
        houseNumber: user.address?.houseNumber || '',
        zipCode: user.address?.zipCode || mockUser.address?.postalCode || '',
        city: user.address?.city || mockUser.address?.city || '',
        country: user.address?.country || mockUser.address?.country || 'Deutschland'
      },
      totalOrders: user.total_orders || mockUser.totalOrders,
      totalSpent: user.total_spent || mockUser.totalSpent,
      memberSince: user.memberSince || mockUser.memberSince
    };
  });
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Geliefert': 'bg-green-100 text-green-800',
      'Unterwegs': 'bg-blue-100 text-blue-800',
      'Verarbeitung': 'bg-yellow-100 text-yellow-800',
      'Storniert': 'bg-red-100 text-red-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const profileData = {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        address: {
          street: userInfo.address?.street || '',
          houseNumber: userInfo.address?.houseNumber || '',
          zipCode: userInfo.address?.zipCode || userInfo.address?.postalCode || '',
          city: userInfo.address?.city || '',
          country: userInfo.address?.country || 'Deutschland'
        }
      };

      const success = await updateProfile(profileData);
      
      if (success) {
        setEditMode(false);
        setMessage('✅ Profil erfolgreich aktualisiert!');
        
        // Update local state to reflect changes
        setUserInfo(prev => ({
          ...prev,
          ...profileData,
          address: {
            ...prev.address,
            ...profileData.address,
            postalCode: profileData.address.zipCode // Ensure compatibility
          }
        }));
      } else {
        setMessage('❌ Fehler beim Aktualisieren des Profils.');
      }
    } catch (error) {
      setMessage('❌ Verbindungsfehler. Bitte versuche es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setIsLoading(true);
    setMessage('');
    
    // Validierung
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setMessage('❌ Das neue Passwort muss mindestens 6 Zeichen lang sein.');
      setIsLoading(false);
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('❌ Die Passwörter stimmen nicht überein.');
      setIsLoading(false);
      return;
    }
    
    try {
      const success = await updatePassword(passwordData.newPassword);
      
      if (success) {
        setPasswordChangeMode(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setMessage('✅ Passwort erfolgreich geändert!');
      } else {
        setMessage('❌ Fehler beim Ändern des Passworts. Bitte prüfe deine Eingaben.');
      }
    } catch (error) {
      setMessage('❌ Verbindungsfehler. Bitte versuche es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Account page logout initiated...');
    
    // Show brief loading state
    setIsLoading(true);
    
    try {
      // Call logout function from AuthContext
      await logout();
      
      // Give a brief moment for state to update
      setTimeout(() => {
        console.log('🏠 Navigating to home after logout...');
        navigateTo('home');
        setIsLoading(false);
      }, 200);
      
    } catch (error) {
      console.error('Logout error in AccountPage:', error);
      // Even on error, try to navigate away
      navigateTo('home');
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const success = await resetPassword(user?.email || '');
      
      if (success) {
        setMessage('✅ Passwort-Reset-E-Mail wurde gesendet! Prüfe dein Postfach.');
      } else {
        setMessage('❌ Fehler beim Senden der Reset-E-Mail.');
      }
    } catch (error) {
      setMessage('❌ Verbindungsfehler. Bitte versuche es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-cormorant text-3xl md:text-4xl text-elbfunkeln-green">
            Mein Konto 👤
          </h1>
          <p className="font-inter text-elbfunkeln-green/70 mt-2">
            Verwalte deine Bestellungen und Einstellungen
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 border-0 shadow-lg sticky top-28">
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-elbfunkeln-lavender text-white text-2xl">
                      {userInfo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-4 -right-1 bg-elbfunkeln-rose text-white rounded-full p-2 shadow-lg hover:bg-elbfunkeln-rose/80 transition-colors">
                    <Camera size={12} />
                  </button>
                </div>
                <h3 className="font-cormorant text-xl text-elbfunkeln-green">
                  {userInfo.name}
                </h3>
                <p className="font-inter text-sm text-elbfunkeln-green/60">
                  Mitglied seit {new Date(userInfo.memberSince).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="font-cormorant text-2xl text-elbfunkeln-green">
                    {userInfo.totalOrders}
                  </div>
                  <div className="font-inter text-xs text-elbfunkeln-green/60">
                    Bestellungen
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-cormorant text-2xl text-elbfunkeln-green">
                    €{userInfo.totalSpent?.toFixed(0) || '0'}
                  </div>
                  <div className="font-inter text-xs text-elbfunkeln-green/60">
                    Ausgegeben
                  </div>
                </div>
              </div>

              <Separator className="mb-6 bg-elbfunkeln-lavender/20" />

              {/* Navigation */}
              <div className="space-y-2">
                {!isShopOwner() && (
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start transition-colors ${
                      activeTab === 'profile' 
                        ? 'bg-elbfunkeln-lavender/30 text-elbfunkeln-green' 
                        : 'text-elbfunkeln-green hover:bg-elbfunkeln-lavender/20'
                    }`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <User size={16} className="mr-3" />
                    Profil
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start transition-colors ${
                    activeTab === 'orders' 
                      ? 'bg-elbfunkeln-lavender/30 text-elbfunkeln-green' 
                      : 'text-elbfunkeln-green hover:bg-elbfunkeln-lavender/20'
                  }`}
                  onClick={() => setActiveTab('orders')}
                >
                  <Package size={16} className="mr-3" />
                  Bestellungen
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start transition-colors ${
                    activeTab === 'wishlist' 
                      ? 'bg-elbfunkeln-lavender/30 text-elbfunkeln-green' 
                      : 'text-elbfunkeln-green hover:bg-elbfunkeln-lavender/20'
                  }`}
                  onClick={() => setActiveTab('wishlist')}
                >
                  <Heart size={16} className="mr-3" />
                  Wunschliste
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-elbfunkeln-lavender/30 text-elbfunkeln-green' 
                      : 'text-elbfunkeln-green hover:bg-elbfunkeln-lavender/20'
                  }`}
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings size={16} className="mr-3" />
                  Einstellungen
                </Button>
                
                <Separator className="my-4 bg-elbfunkeln-lavender/20" />
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-elbfunkeln-rose hover:bg-red-50"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  <LogOut size={16} className="mr-3" />
                  Abmelden
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Profile Tab - only show for non-ShopOwner users */}
              {!isShopOwner() && (
                <TabsContent value="profile">
                  <Card className="p-8 border-0 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
                        Persönliche Informationen ℹ️
                      </h2>
                      <Button
                        variant={editMode ? "default" : "outline"}
                        onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                        className={editMode ? "bg-elbfunkeln-green text-white" : "border-elbfunkeln-lavender text-elbfunkeln-green"}
                      >
                        <Edit size={16} className="mr-2" />
                        {editMode ? 'Speichern' : 'Bearbeiten'}
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="font-inter text-elbfunkeln-green">Name</Label>
                        <Input
                          id="name"
                          value={userInfo.name}
                          readOnly={!editMode}
                          onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                          className={`mt-1 ${editMode ? 'border-elbfunkeln-lavender' : 'bg-gray-50'}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="font-inter text-elbfunkeln-green">E-Mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userInfo.email}
                          readOnly={!editMode}
                          onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                          className={`mt-1 ${editMode ? 'border-elbfunkeln-lavender' : 'bg-gray-50'}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="font-inter text-elbfunkeln-green">Telefon</Label>
                        <Input
                          id="phone"
                          value={userInfo.phone}
                          readOnly={!editMode}
                          onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                          className={`mt-1 ${editMode ? 'border-elbfunkeln-lavender' : 'bg-gray-50'}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor="street" className="font-inter text-elbfunkeln-green">Straße</Label>
                        <Input
                          id="street"
                          value={userInfo.address?.street || ''}
                          readOnly={!editMode}
                          onChange={(e) => setUserInfo({
                            ...userInfo, 
                            address: {...(userInfo.address || {}), street: e.target.value}
                          })}
                          className={`mt-1 ${editMode ? 'border-elbfunkeln-lavender' : 'bg-gray-50'}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor="houseNumber" className="font-inter text-elbfunkeln-green">Hausnummer</Label>
                        <Input
                          id="houseNumber"
                          value={userInfo.address?.houseNumber || ''}
                          readOnly={!editMode}
                          onChange={(e) => setUserInfo({
                            ...userInfo, 
                            address: {...(userInfo.address || {}), houseNumber: e.target.value}
                          })}
                          className={`mt-1 ${editMode ? 'border-elbfunkeln-lavender' : 'bg-gray-50'}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode" className="font-inter text-elbfunkeln-green">PLZ</Label>
                        <Input
                          id="postalCode"
                          value={userInfo.address?.zipCode || userInfo.address?.postalCode || ''}
                          readOnly={!editMode}
                          onChange={(e) => setUserInfo({
                            ...userInfo, 
                            address: {...(userInfo.address || {}), zipCode: e.target.value, postalCode: e.target.value}
                          })}
                          className={`mt-1 ${editMode ? 'border-elbfunkeln-lavender' : 'bg-gray-50'}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city" className="font-inter text-elbfunkeln-green">Stadt</Label>
                        <Input
                          id="city"
                          value={userInfo.address?.city || ''}
                          readOnly={!editMode}
                          onChange={(e) => setUserInfo({
                            ...userInfo, 
                            address: {...(userInfo.address || {}), city: e.target.value}
                          })}
                          className={`mt-1 ${editMode ? 'border-elbfunkeln-lavender' : 'bg-gray-50'}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" className="font-inter text-elbfunkeln-green">Land</Label>
                        <Input
                          id="country"
                          value={userInfo.address?.country || 'Deutschland'}
                          readOnly={!editMode}
                          onChange={(e) => setUserInfo({
                            ...userInfo, 
                            address: {...(userInfo.address || {}), country: e.target.value}
                          })}
                          className={`mt-1 ${editMode ? 'border-elbfunkeln-lavender' : 'bg-gray-50'}`}
                        />
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              )}

              {/* Orders Tab */}
              <TabsContent value="orders">
                <div className="space-y-6">
                  <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
                    Meine Bestellungen 📦
                  </h2>
                  
                  {mockOrders.map((order) => (
                    <Card key={order.id} className="p-6 border-0 shadow-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <div>
                          <h3 className="font-cormorant text-lg text-elbfunkeln-green">
                            Bestellung #{order.id}
                          </h3>
                          <p className="font-inter text-sm text-elbfunkeln-green/60">
                            {new Date(order.date).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusBadge(order.status)}>
                            {order.status}
                          </Badge>
                          <span className="font-inter text-lg text-elbfunkeln-green">
                            €{order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {order.items.map((item, index) => {
                          // Safe image access - handle both old mock data (image) and new API data (images)
                          const getProductImage = () => {
                            if (item.product?.image) return item.product.image;
                            if (item.product?.images?.[0]?.url) return item.product.images[0].url;
                            if (typeof item.product?.images?.[0] === 'string') return item.product.images[0];
                            return 'https://via.placeholder.com/400x400?text=Kein+Bild';
                          };

                          return (
                            <div key={index} className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden">
                                <ImageWithFallback
                                  src={getProductImage()}
                                  alt={item.product?.name || 'Produkt'}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-inter text-elbfunkeln-green">
                                  {item.product?.name || 'Unbekanntes Produkt'}
                                </h4>
                                <p className="font-inter text-sm text-elbfunkeln-green/60">
                                  Anzahl: {item.quantity} • €{item.product?.price || 0}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex gap-2 mt-4 pt-4 border-t border-elbfunkeln-lavender/20">
                        <Button variant="outline" size="sm" className="border-elbfunkeln-lavender text-elbfunkeln-green">
                          Details ansehen
                        </Button>
                        <Button variant="outline" size="sm" className="border-elbfunkeln-lavender text-elbfunkeln-green">
                          Erneut bestellen
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Wishlist Tab */}
              <TabsContent value="wishlist">
                <div className="space-y-6">
                  <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
                    Meine Wunschliste 💝
                  </h2>
                  
                  {productsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-elbfunkeln-green mr-3"></div>
                      <span className="text-elbfunkeln-green">Lade Favoriten...</span>
                    </div>
                  ) : favoriteProducts.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-elbfunkeln-beige/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-10 h-10 text-elbfunkeln-green/40" />
                      </div>
                      <h3 className="font-cormorant text-2xl text-elbfunkeln-green mb-4">
                        Noch keine Favoriten
                      </h3>
                      <p className="font-inter text-elbfunkeln-green/70 mb-8 max-w-md mx-auto">
                        Entdecke unsere wunderschönen handgemachten Schmuckstücke und sammle deine Lieblingsstücke
                      </p>
                      <Button
                        onClick={() => navigateTo('shop')}
                        className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90"
                      >
                        Schmuck entdecken
                      </Button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden border-0 shadow-lg group">
                          <div className="relative">
                            <ImageWithFallback
                              src={product.image}
                              alt={product.name}
                              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <button 
                              onClick={() => toggleFavorite(product.id)}
                              className="absolute top-4 right-4 bg-elbfunkeln-rose text-white rounded-full p-2 shadow-lg hover:bg-elbfunkeln-rose/80 transition-colors"
                            >
                              <Heart size={16} fill="currentColor" />
                            </button>
                          </div>
                          <div className="p-4">
                            <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-2">
                              {product.name}
                            </h3>
                            <p className="font-inter text-elbfunkeln-green mb-4">
                              €{product.price.toFixed(2)}
                            </p>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="flex-1 bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90"
                                onClick={() => navigateTo('product', { productId: product.id })}
                              >
                                Ansehen
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-elbfunkeln-lavender text-elbfunkeln-green hover:bg-elbfunkeln-green/10"
                                onClick={() => {
                                  const cartItem = {
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image,
                                    quantity: 1
                                  };
                                  addToCart(cartItem);
                                }}
                              >
                                In Warenkorb
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <div className="space-y-6">
                  {/* Message Display */}
                  {message && (
                    <Alert className={message.startsWith('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <AlertDescription className={message.startsWith('✅') ? 'text-green-700' : 'text-red-700'}>
                        {message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Kommunikationseinstellungen */}
                  <Card className="p-6 border-0 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <Bell className="w-6 h-6 text-elbfunkeln-green" />
                      <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
                        Kommunikation & Benachrichtigungen
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Newsletter Settings */}
                      <div className="p-4 bg-elbfunkeln-beige/20 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-inter text-elbfunkeln-green">Newsletter-Abonnements</h3>
                            <p className="font-inter text-sm text-elbfunkeln-green/60">
                              Wähle aus, welche Newsletter du erhalten möchtest
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div>
                              <h4 className="font-inter text-sm text-elbfunkeln-green">Neue Produkte</h4>
                              <p className="font-inter text-xs text-elbfunkeln-green/60">
                                Informationen über neue Schmuckstücke
                              </p>
                            </div>
                            <Switch />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div>
                              <h4 className="font-inter text-sm text-elbfunkeln-green">Sonderangebote</h4>
                              <p className="font-inter text-xs text-elbfunkeln-green/60">
                                Exklusive Rabatte und Aktionen
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div>
                              <h4 className="font-inter text-sm text-elbfunkeln-green">Pflegetipps</h4>
                              <p className="font-inter text-xs text-elbfunkeln-green/60">
                                Tipps zur Schmuckpflege und -aufbewahrung
                              </p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </div>

                      {/* E-Mail Benachrichtigungen */}
                      <div className="p-4 bg-elbfunkeln-beige/20 rounded-lg">
                        <h3 className="font-inter text-elbfunkeln-green mb-4">E-Mail-Benachrichtigungen</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-inter text-sm text-elbfunkeln-green">Bestellbestätigungen</span>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-inter text-sm text-elbfunkeln-green">Versandbenachrichtigungen</span>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-inter text-sm text-elbfunkeln-green">Rücksendungen</span>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-inter text-sm text-elbfunkeln-green">Kundensupport</span>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Liefer- & Zahlungseinstellungen */}
                  <Card className="p-6 border-0 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <CreditCard className="w-6 h-6 text-elbfunkeln-green" />
                      <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
                        Lieferung & Zahlung
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Standard-Lieferadresse */}
                      <div className="p-4 bg-elbfunkeln-beige/20 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-inter text-elbfunkeln-green">Standard-Lieferadresse</h3>
                            <p className="font-inter text-sm text-elbfunkeln-green/60">
                              {userInfo.address?.street} {userInfo.address?.houseNumber}, {userInfo.address?.zipCode} {userInfo.address?.city}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="border-elbfunkeln-lavender text-elbfunkeln-green">
                            <Edit size={16} className="mr-2" />
                            Bearbeiten
                          </Button>
                        </div>
                      </div>

                      {/* Alternative Adressen */}
                      <div className="p-4 bg-elbfunkeln-beige/20 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-inter text-elbfunkeln-green">Alternative Lieferadressen</h3>
                            <p className="font-inter text-sm text-elbfunkeln-green/60">
                              Verwalte zusätzliche Lieferadressen
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="border-elbfunkeln-lavender text-elbfunkeln-green">
                            <Plus size={16} className="mr-2" />
                            Hinzufügen
                          </Button>
                        </div>
                        
                        <div className="text-center py-8 text-elbfunkeln-green/60">
                          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="font-inter text-sm">Keine alternativen Adressen gespeichert</p>
                        </div>
                      </div>

                      {/* Zahlungsmethoden */}
                      <div className="p-4 bg-elbfunkeln-beige/20 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-inter text-elbfunkeln-green">Zahlungsmethoden</h3>
                            <p className="font-inter text-sm text-elbfunkeln-green/60">
                              Verwalte deine gespeicherten Zahlungsmethoden
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="border-elbfunkeln-lavender text-elbfunkeln-green">
                            <Plus size={16} className="mr-2" />
                            Hinzufügen
                          </Button>
                        </div>
                        
                        <div className="text-center py-8 text-elbfunkeln-green/60">
                          <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="font-inter text-sm">Keine Zahlungsmethoden gespeichert</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Sicherheit & Datenschutz */}
                  <Card className="p-6 border-0 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <Shield className="w-6 h-6 text-elbfunkeln-green" />
                      <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
                        Sicherheit & Datenschutz
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Passwort ändern - existiert bereits */}
                      <div className="p-4 bg-elbfunkeln-beige/20 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-inter text-elbfunkeln-green">Passwort ändern</h3>
                            <p className="font-inter text-sm text-elbfunkeln-green/60">
                              Aktualisiere dein Passwort für mehr Sicherheit
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            className="border-elbfunkeln-lavender text-elbfunkeln-green"
                            onClick={() => setPasswordChangeMode(!passwordChangeMode)}
                          >
                            <Key className="w-4 h-4 mr-2" />
                            {passwordChangeMode ? 'Abbrechen' : 'Ändern'}
                          </Button>
                        </div>

                        {passwordChangeMode && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4 border-t border-elbfunkeln-lavender/20"
                          >
                            {/* Current Password */}
                            <div>
                              <Label htmlFor="currentPassword" className="font-inter text-elbfunkeln-green">
                                Aktuelles Passwort
                              </Label>
                              <div className="relative mt-1">
                                <Input
                                  id="currentPassword"
                                  type={showPasswords.current ? 'text' : 'password'}
                                  value={passwordData.currentPassword}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                  className="pr-10 border-elbfunkeln-lavender/30 bg-white"
                                  placeholder="••••••••"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-elbfunkeln-green/40"
                                >
                                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="newPassword" className="font-inter text-elbfunkeln-green">
                                Neues Passwort
                              </Label>
                              <div className="relative mt-1">
                                <Input
                                  id="newPassword"
                                  type={showPasswords.new ? 'text' : 'password'}
                                  value={passwordData.newPassword}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                  className="pr-10 border-elbfunkeln-lavender/30 bg-white"
                                  placeholder="••••••••"
                                  minLength={6}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-elbfunkeln-green/40"
                                >
                                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="confirmPassword" className="font-inter text-elbfunkeln-green">
                                Passwort bestätigen
                              </Label>
                              <div className="relative mt-1">
                                <Input
                                  id="confirmPassword"
                                  type={showPasswords.confirm ? 'text' : 'password'}
                                  value={passwordData.confirmPassword}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                  className="pr-10 border-elbfunkeln-lavender/30 bg-white"
                                  placeholder="••••••••"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-elbfunkeln-green/40"
                                >
                                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                              <Button
                                onClick={handlePasswordChange}
                                className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-rose"
                                disabled={isLoading}
                              >
                                {isLoading ? 'Wird geändert...' : 'Passwort ändern'}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={handlePasswordReset}
                                className="border-elbfunkeln-lavender text-elbfunkeln-green"
                                disabled={isLoading}
                              >
                                Reset-E-Mail senden
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Login-Aktivitäten */}
                      <div className="p-4 bg-elbfunkeln-beige/20 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-inter text-elbfunkeln-green">Login-Aktivitäten</h3>
                            <p className="font-inter text-sm text-elbfunkeln-green/60">
                              Überprüfe deine letzten Anmeldungen
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="border-elbfunkeln-lavender text-elbfunkeln-green">
                            <Eye size={16} className="mr-2" />
                            Anzeigen
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Account Management */}
                  <Card className="p-6 border-0 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <AlertTriangle className="w-6 h-6 text-elbfunkeln-rose" />
                      <h2 className="font-cormorant text-2xl text-elbfunkeln-green">
                        Account-Verwaltung
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Account temporär deaktivieren */}
                      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div>
                          <h3 className="font-inter text-yellow-800">Account temporär deaktivieren</h3>
                          <p className="font-inter text-sm text-yellow-700">
                            Dein Account wird vorübergehend deaktiviert, kann aber reaktiviert werden
                          </p>
                        </div>
                        <Button variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-50">
                          Deaktivieren
                        </Button>
                      </div>

                      {/* Account permanent löschen */}
                      <Dialog>
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                          <div>
                            <h3 className="font-inter text-red-700">Account permanent löschen</h3>
                            <p className="font-inter text-sm text-red-600">
                              Alle deine Daten werden unwiderruflich gelöscht
                            </p>
                          </div>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Löschen
                            </Button>
                          </DialogTrigger>
                        </div>
                        
                        <DialogContent aria-describedby="delete-account-description">
                          <DialogHeader>
                            <DialogTitle className="text-red-700">Account wirklich löschen?</DialogTitle>
                            <DialogDescription id="delete-account-description">
                              Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten, 
                              Bestellungen und Einstellungen werden permanent gelöscht.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Abbrechen</Button>
                            <Button variant="destructive">
                              Account löschen
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}