import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useRouter } from './Router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import apiService, { Category, Product } from '../services/apiService';

interface CategorySelectorProps {
  title?: string;
  subtitle?: string;
}

export function CategorySelector({ 
  title = 'Beliebte Schmuckstücke',
  subtitle = 'Entdecke unsere beliebtesten handgefertigten Drahtschmuck-Stücke.'
}: CategorySelectorProps) {
  const { navigateTo } = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.categories.getAll();
      // Only show top-level categories (without parent)
      const topCategories = categoriesData.filter(cat => !cat.parentId);
      setCategories(topCategories.slice(0, 4)); // Show max 4 categories
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    navigateTo('shop', { category: categorySlug });
  };

  const getCategoryImage = (categoryName: string): string => {
    // Use Unsplash images based on category name
    const imageMap: Record<string, string> = {
      'Ohrringe': 'https://images.unsplash.com/photo-1656109801168-699967cf3ba9?w=600',
      'Ringe': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600',
      'Armbänder': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600',
      'Ketten': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
    };
    
    return imageMap[categoryName] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600';
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-elbfunkeln-rose"></div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-cormorant text-elbfunkeln-green mb-4">
            {title}
          </h2>
          <p className="font-inter text-elbfunkeln-green/80 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card 
                className="h-full overflow-hidden bg-gradient-to-br from-white to-elbfunkeln-beige/20 shadow-xl hover:shadow-2xl transition-all duration-500 border-0 group-hover:-translate-y-2 cursor-pointer flex flex-col"
                onClick={() => handleCategoryClick(category.slug)}
              >
                <div className="relative overflow-hidden">
                  <ImageWithFallback
                    src={getCategoryImage(category.name)}
                    alt={category.name}
                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-xs font-inter text-elbfunkeln-green/60 uppercase tracking-wide">
                        {category.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-cormorant text-elbfunkeln-green mb-2 group-hover:text-elbfunkeln-rose transition-colors duration-300 min-h-[3.5rem] flex items-center">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="font-inter text-sm text-elbfunkeln-green/70 mb-4">
                          {category.description}
                        </p>
                      )}
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className="w-full bg-transparent border border-elbfunkeln-green text-elbfunkeln-green hover:bg-elbfunkeln-green hover:text-white hover:scale-105 active:scale-95 transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryClick(category.slug);
                        }}
                      >
                        {category.name} entdecken
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => navigateTo('shop')}
              className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-rose hover:scale-105 active:scale-95 transition-all duration-300 px-8 py-3 rounded-xl"
              size="lg"
            >
              Gesamte Kollektion ansehen
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
