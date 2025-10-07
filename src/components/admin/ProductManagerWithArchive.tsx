// ProductManager mit integriertem Archiv-Tab
import React from 'react';
import { Package, Archive } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ProductManager } from './ProductManager';
import { ProductArchive } from './ProductArchive';

export function ProductManagerWithArchive() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cormorant text-3xl text-elbfunkeln-green mb-2">
            Produktverwaltung
          </h2>
          <p className="font-inter text-elbfunkeln-green/70">
            Verwalten Sie Ihre Produkte und archivierte Artikel
          </p>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white border border-elbfunkeln-green/20">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Aktive Produkte
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Produktarchiv
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <ProductManager />
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <ProductArchive />
        </TabsContent>
      </Tabs>
    </div>
  );
}
