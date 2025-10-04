import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, X, Filter, SlidersHorizontal, Grid, List } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { useRouter } from '../components/Router';
import { useSearch } from '../components/SearchContext';
import { SearchAutocomplete } from '../components/SearchAutocomplete';

export function SearchPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const { navigateTo } = useRouter();
  
  const {
    searchQuery,
    searchResults,
    isSearching,
    searchFilters,
    setSearchFilters,
    clearSearch,
    performSearch,
    searchStats
  } = useSearch();

  // Categories and availability options for filters
  const categories = ['Ringe', 'Ohrringe', 'Ketten', 'Armbänder', 'Anhänger'];
  const availabilityOptions = [
    { value: 'in_stock', label: 'Auf Lager' },
    { value: 'low_stock', label: 'Wenige verfügbar' },
    { value: 'out_of_stock', label: 'Ausverkauft' }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleCategoryFilter = (category: string) => {
    const newCategory = searchFilters.category === category ? '' : category;
    setSearchFilters({ category: newCategory });
  };

  const handleAvailabilityFilter = (availability: string, checked: boolean) => {
    const newAvailability = checked
      ? [...searchFilters.availability, availability]
      : searchFilters.availability.filter(a => a !== availability);
    setSearchFilters({ availability: newAvailability });
  };

  const resetFilters = () => {
    setSearchFilters({
      category: '',
      priceRange: [0, 1000],
      availability: [],
      sortBy: 'relevance'
    });
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
          <h1 className="font-cormorant text-3xl text-elbfunkeln-green mb-4 text-center">
            Schmuck suchen
          </h1>
          <p className="font-inter text-elbfunkeln-green/70 mb-6 text-center">
            Finde den perfekten Schmuck für jeden Anlass
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchAutocomplete 
              placeholder="Suche nach Ringen, Ketten, Ohrringen..."
              showFilters={true}
            />
          </div>
        </motion.div>

        {/* Search Results Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="font-inter text-elbfunkeln-green/70">
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-elbfunkeln-green border-t-transparent rounded-full"></div>
                    Suche läuft...
                  </span>
                ) : (
                  <>
                    {searchResults.length} Produkte gefunden
                    {searchQuery && (
                      <span className="ml-2">
                        für "<span className="font-medium text-elbfunkeln-green">{searchQuery}</span>"
                      </span>
                    )}
                    {searchStats.searchTime > 0 && (
                      <span className="text-xs ml-2">
                        ({searchStats.searchTime}ms)
                      </span>
                    )}
                  </>
                )}
              </p>
              
              {searchQuery && (
                <Button
                  onClick={clearSearch}
                  variant="outline"
                  size="sm"
                  className="border-elbfunkeln-lavender/30 hover:bg-elbfunkeln-beige/20"
                >
                  <X className="h-4 w-4 mr-1" />
                  Zurücksetzen
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Toggle */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className={`border-elbfunkeln-rose/30 ${showFilters ? 'bg-elbfunkeln-beige/30' : ''}`}
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Filter
              </Button>

              {/* Sort Options */}
              <select
                value={searchFilters.sortBy}
                onChange={(e) => setSearchFilters({ sortBy: e.target.value as any })}
                className="px-3 py-2 text-sm border border-elbfunkeln-rose/30 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-elbfunkeln-green/20"
              >
                <option value="relevance">Relevanz</option>
                <option value="price_low">Preis aufsteigend</option>
                <option value="price_high">Preis absteigend</option>
                <option value="name">Name A-Z</option>
                <option value="newest">Neueste</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-elbfunkeln-rose/30 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-elbfunkeln-green text-white' 
                      : 'bg-white text-elbfunkeln-green hover:bg-elbfunkeln-beige/20'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-elbfunkeln-green text-white' 
                      : 'bg-white text-elbfunkeln-green hover:bg-elbfunkeln-beige/20'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              className="mt-4 p-4 bg-white border border-elbfunkeln-rose/20 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <h4 className="font-medium text-elbfunkeln-green mb-3">Kategorie</h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label
                        key={category}
                        className="flex items-center cursor-pointer hover:text-elbfunkeln-rose transition-colors"
                      >
                        <Checkbox
                          checked={searchFilters.category === category}
                          onChange={() => handleCategoryFilter(category)}
                          className="mr-2"
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h4 className="font-medium text-elbfunkeln-green mb-3">Preisspanne</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={searchFilters.priceRange[0]}
                        onChange={(e) => setSearchFilters({
                          priceRange: [Number(e.target.value), searchFilters.priceRange[1]]
                        })}
                        className="w-full px-3 py-2 text-sm border border-elbfunkeln-rose/30 rounded focus:outline-none focus:ring-2 focus:ring-elbfunkeln-green/20"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={searchFilters.priceRange[1]}
                        onChange={(e) => setSearchFilters({
                          priceRange: [searchFilters.priceRange[0], Number(e.target.value)]
                        })}
                        className="w-full px-3 py-2 text-sm border border-elbfunkeln-rose/30 rounded focus:outline-none focus:ring-2 focus:ring-elbfunkeln-green/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <h4 className="font-medium text-elbfunkeln-green mb-3">Verfügbarkeit</h4>
                  <div className="space-y-2">
                    {availabilityOptions.map(option => (
                      <label
                        key={option.value}
                        className="flex items-center cursor-pointer hover:text-elbfunkeln-rose transition-colors"
                      >
                        <Checkbox
                          checked={searchFilters.availability.includes(option.value)}
                          onChange={(checked) => handleAvailabilityFilter(option.value, checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-elbfunkeln-rose/10">
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  size="sm"
                  className="text-elbfunkeln-rose border-elbfunkeln-rose/30 hover:bg-elbfunkeln-rose/10"
                >
                  Filter zurücksetzen
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Search Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {isSearching ? (
            /* Loading Skeleton */
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card className="p-4">
                    {viewMode === 'grid' ? (
                      <>
                        <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </>
                    ) : (
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            /* No Results */
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-elbfunkeln-beige rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-elbfunkeln-green/40" />
              </div>
              <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-2">
                {searchQuery ? 'Keine Ergebnisse gefunden' : 'Beginne deine Suche'}
              </h3>
              <p className="font-inter text-elbfunkeln-green/70 mb-4">
                {searchQuery 
                  ? 'Versuche es mit anderen Suchbegriffen oder passe deine Filter an'
                  : 'Verwende die Suchleiste oben, um Produkte zu finden'
                }
              </p>
              <Button
                onClick={() => navigateTo('shop')}
                className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90"
              >
                Alle Produkte ansehen
              </Button>
            </div>
          ) : (
            /* Products Results */
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {searchResults.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                >
                  <Card className={`group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden border-0 bg-white/80 backdrop-blur-sm ${
                    viewMode === 'list' ? 'p-4' : ''
                  }`}>
                    <div 
                      className={viewMode === 'grid' ? "relative" : "flex gap-4 items-center"}
                      onClick={() => navigateTo('product', { productId: product.id })}
                    >
                      {/* Product Image */}
                      <div className={viewMode === 'grid' 
                        ? "aspect-square overflow-hidden" 
                        : "w-24 h-24 overflow-hidden rounded-lg flex-shrink-0"
                      }>
                        <img
                          src={product.images?.[0] || '/placeholder-product.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className={viewMode === 'grid' ? "p-4" : "flex-1 min-w-0"}>
                        <div className="mb-2">
                          <Badge variant="outline" className="text-xs text-elbfunkeln-green/70 border-elbfunkeln-green/20">
                            {product.category}
                          </Badge>
                        </div>
                        <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-2 group-hover:text-elbfunkeln-rose transition-colors truncate">
                          {product.name}
                        </h3>
                        <p className="font-inter text-sm text-elbfunkeln-green/70 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-cormorant text-xl text-elbfunkeln-green">
                            {formatPrice(product.price)}
                          </span>
                          <Button
                            size="sm"
                            className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90 hover:scale-105 active:scale-95 transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateTo('product', { productId: product.id });
                            }}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <Button
            variant="ghost"
            onClick={() => navigateTo('shop')}
            className="text-elbfunkeln-green hover:text-elbfunkeln-rose"
          >
            ← Zurück zum Shop
          </Button>
        </div>
      </div>
    </div>
  );
}