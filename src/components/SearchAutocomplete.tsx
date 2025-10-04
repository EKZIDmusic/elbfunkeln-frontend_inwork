import { useState, useRef, useEffect } from 'react';
import { Search, Clock, TrendingUp, X, ArrowRight, Filter } from 'lucide-react';
import { useSearch } from './SearchContext';
import { useRouter } from './Router';

interface SearchAutocompleteProps {
  placeholder?: string;
  showFilters?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchAutocomplete({ 
  placeholder = "Suchen Sie nach Produkten...", 
  showFilters = true,
  onSearch,
  className = ""
}: SearchAutocompleteProps) {
  const {
    searchQuery,
    setSearchQuery,
    searchSuggestions,
    isSearching,
    recentSearches,
    popularSearches,
    performSearch,
    clearRecentSearches
  } = useSearch();
  
  const { navigateTo } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setSelectedIndex(-1);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const suggestions = getSuggestionsList();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex]);
        } else if (searchQuery.trim()) {
          handleSearch(searchQuery);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const getSuggestionsList = () => {
    const suggestions = [];
    
    if (searchQuery.length < 2) {
      // Zeige beliebte Suchen und Historie wenn kein aktiver Suchbegriff
      if (recentSearches.length > 0) {
        suggestions.push({ type: 'section', label: 'Letzte Suchen' });
        recentSearches.slice(0, 5).forEach(search => {
          suggestions.push({ type: 'recent', value: search });
        });
      }
      
      suggestions.push({ type: 'section', label: 'Beliebte Suchen' });
      popularSearches.slice(0, 5).forEach(search => {
        suggestions.push({ type: 'popular', value: search });
      });
    } else {
      // Zeige Suchvorschläge basierend auf aktueller Eingabe
      if (searchSuggestions.length > 0) {
        suggestions.push({ type: 'section', label: 'Vorschläge' });
        searchSuggestions.forEach(suggestion => {
          suggestions.push(suggestion);
        });
      }
    }
    
    return suggestions;
  };

  const selectSuggestion = (suggestion: any) => {
    const query = suggestion.value || suggestion.product?.name;
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
  };

  const handleSearch = (query: string) => {
    setIsOpen(false);
    performSearch(query);
    onSearch?.(query);
    navigateTo('search');
    inputRef.current?.blur();
  };

  const clearInput = () => {
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const suggestions = getSuggestionsList();

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-elbfunkeln-green" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-white border border-elbfunkeln-rose/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-elbfunkeln-green/20 focus:border-elbfunkeln-green transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={clearInput}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-elbfunkeln-rose hover:text-elbfunkeln-green transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-elbfunkeln-green border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-elbfunkeln-rose/20 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {suggestions.length === 0 ? (
            <div className="p-4 text-center text-elbfunkeln-rose">
              {searchQuery.length >= 2 ? (
                <>
                  <Search className="h-8 w-8 mx-auto mb-2 text-elbfunkeln-rose/50" />
                  <p>Keine Ergebnisse für "{searchQuery}"</p>
                  <p className="text-sm text-elbfunkeln-rose/70 mt-1">
                    Versuchen Sie andere Suchbegriffe
                  </p>
                </>
              ) : (
                <p className="text-elbfunkeln-rose/70">
                  Beginnen Sie mit der Eingabe...
                </p>
              )}
            </div>
          ) : (
            <>
              {suggestions.map((suggestion, index) => {
                if (suggestion.type === 'section') {
                  return (
                    <div key={`section-${index}`} className="px-4 py-2 bg-elbfunkeln-beige/30 text-sm font-medium text-elbfunkeln-green border-b border-elbfunkeln-rose/10">
                      {suggestion.label}
                    </div>
                  );
                }

                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => selectSuggestion(suggestion)}
                    className={`w-full px-4 py-3 text-left hover:bg-elbfunkeln-beige/20 transition-colors ${
                      isSelected ? 'bg-elbfunkeln-beige/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {suggestion.type === 'recent' && (
                        <Clock className="h-4 w-4 text-elbfunkeln-rose/60" />
                      )}
                      {suggestion.type === 'popular' && (
                        <TrendingUp className="h-4 w-4 text-elbfunkeln-green/60" />
                      )}
                      {suggestion.type === 'product' && suggestion.product && (
                        <div className="w-8 h-8 bg-elbfunkeln-beige/50 rounded flex items-center justify-center">
                          <span className="text-xs text-elbfunkeln-green">P</span>
                        </div>
                      )}
                      {suggestion.type === 'category' && (
                        <Filter className="h-4 w-4 text-elbfunkeln-green/60" />
                      )}
                      {suggestion.type === 'tag' && (
                        <div className="w-6 h-6 bg-elbfunkeln-lavender/50 rounded-full flex items-center justify-center">
                          <span className="text-xs text-elbfunkeln-green">#</span>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="font-medium text-elbfunkeln-green">
                          {suggestion.value || suggestion.product?.name}
                        </div>
                        {suggestion.product && (
                          <div className="text-sm text-elbfunkeln-rose/70">
                            {suggestion.product.category} • {suggestion.product.price}€
                          </div>
                        )}
                        {suggestion.count && (
                          <div className="text-sm text-elbfunkeln-rose/70">
                            {suggestion.count} Produkte
                          </div>
                        )}
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-elbfunkeln-rose/40" />
                    </div>
                  </button>
                );
              })}
              
              {recentSearches.length > 0 && searchQuery.length < 2 && (
                <div className="border-t border-elbfunkeln-rose/10 p-2">
                  <button
                    onClick={clearRecentSearches}
                    className="w-full text-center text-sm text-elbfunkeln-rose/70 hover:text-elbfunkeln-rose py-2 rounded transition-colors"
                  >
                    Suchverlauf löschen
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}