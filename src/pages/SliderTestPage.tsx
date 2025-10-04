import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { useRouter } from '../components/Router';

export function SliderTestPage() {
  const { navigateTo } = useRouter();
  
  // Test-Slider-Werte
  const [brightness, setBrightness] = useState([60]);
  const [volume, setVolume] = useState([75]);
  const [priceRange, setPriceRange] = useState([25, 150]);

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-elbfunkeln-beige/20 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-cormorant text-4xl text-elbfunkeln-green mb-4">
            🎛️ Slider Test - Animationen & Hover-Effekte
          </h1>
          <p className="font-inter text-elbfunkeln-green/70">
            Testen Sie die erweiterten Slider-Animationen
          </p>
        </div>

        {/* Test Sliders */}
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Basic Slider */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label className="font-inter text-elbfunkeln-green">
                Helligkeit: {brightness[0]}%
              </Label>
              <Slider
                value={brightness}
                onValueChange={setBrightness}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-elbfunkeln-green/60 flex justify-between">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </Card>

          {/* Volume Slider */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label className="font-inter text-elbfunkeln-green">
                Lautstärke: {volume[0]}%
              </Label>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-elbfunkeln-green/60 flex justify-between">
                <span>Leise</span>
                <span>Normal</span>
                <span>Laut</span>
              </div>
            </div>
          </Card>

          {/* Range Slider */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label className="font-inter text-elbfunkeln-green">
                Preisbereich: €{priceRange[0]} - €{priceRange[1]}
              </Label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={200}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-elbfunkeln-green/60 flex justify-between">
                <span>€0</span>
                <span>€100</span>
                <span>€200</span>
              </div>
            </div>
          </Card>

          {/* Live Preview */}
          <Card className="p-6 bg-gradient-to-br from-elbfunkeln-beige/30 to-elbfunkeln-lavender/20">
            <h3 className="font-cormorant text-xl text-elbfunkeln-green mb-4 text-center">
              Live Preview
            </h3>
            <div className="text-center">
              <div 
                className="w-16 h-16 bg-gradient-to-br from-elbfunkeln-lavender to-elbfunkeln-rose rounded-full mx-auto mb-4 transition-all duration-300"
                style={{ 
                  filter: `brightness(${brightness[0]}%)`,
                  transform: `scale(${volume[0] / 100})` 
                }}
              />
              <p className="text-sm text-elbfunkeln-green/70">
                Helligkeit: {brightness[0]}% • Größe: {volume[0]}% • Preis: €{priceRange[0]}-€{priceRange[1]}
              </p>
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-6 bg-elbfunkeln-green/10">
            <h3 className="font-cormorant text-lg text-elbfunkeln-green mb-3">
              📝 Test-Anweisungen:
            </h3>
            <ul className="space-y-2 text-sm text-elbfunkeln-green/80">
              <li>• <strong>Hover:</strong> Bewegen Sie die Maus über die Slider-Elemente</li>
              <li>• <strong>Track:</strong> Sollte sich beim Hover aufhellen</li>
              <li>• <strong>Range:</strong> Gradient sollte sich umkehren</li>
              <li>• <strong>Thumb:</strong> Sollte sich vergrößern und einen Ring bekommen</li>
              <li>• <strong>Klick/Drag:</strong> Sollte aktiverbar und verschiebbar sein</li>
            </ul>
          </Card>

          {/* Navigation */}
          <div className="text-center">
            <Button
              onClick={() => navigateTo('admin-slider-test')}
              className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-rose hover:scale-105 active:scale-95 transition-all duration-300 mr-4"
            >
              Erweiterte Demo
            </Button>
            <Button
              onClick={() => navigateTo('shop')}
              variant="outline"
              className="border-elbfunkeln-green text-elbfunkeln-green hover:bg-elbfunkeln-green hover:text-white"
            >
              Zurück zum Shop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}