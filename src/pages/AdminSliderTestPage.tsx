import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Monitor, Palette, Volume2, Zap } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { useRouter } from '../components/Router';

export function AdminSliderTestPage() {
  const { navigateTo } = useRouter();
  
  // Verschiedene Slider-Werte für Demozwecke
  const [volume, setVolume] = useState([75]);
  const [brightness, setBrightness] = useState([60]);
  const [priceRange, setPriceRange] = useState([20, 150]);
  const [discount, setDiscount] = useState([25]);
  const [quality, setQuality] = useState([85]);
  const [opacity, setOpacity] = useState([70]);

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-elbfunkeln-beige/20 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-cormorant text-4xl text-elbfunkeln-green mb-4">
            🎛️ Slider Demo - Admin Einstellungen
          </h1>
          <p className="font-inter text-elbfunkeln-green/70">
            Verschiedene Slider-Implementierungen mit erweiterten Animationen
          </p>
          <Button
            onClick={() => navigateTo('admin')}
            variant="ghost"
            className="mt-4 text-elbfunkeln-green hover:text-elbfunkeln-rose"
          >
            ← Zurück zur Admin-Verwaltung
          </Button>
        </motion.div>

        {/* Slider Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Volume Control */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-white to-elbfunkeln-beige/20 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-elbfunkeln-lavender/20 rounded-full">
                  <Volume2 className="w-6 h-6 text-elbfunkeln-lavender" />
                </div>
                <div>
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green">Lautstärke</h3>
                  <p className="text-sm text-elbfunkeln-green/70">Website Sounds</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="font-inter text-elbfunkeln-green">
                  Aktuell: {volume[0]}%
                </Label>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
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
          </motion.div>

          {/* Brightness Control */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-white to-elbfunkeln-lavender/20 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-elbfunkeln-rose/20 rounded-full">
                  <Monitor className="w-6 h-6 text-elbfunkeln-rose" />
                </div>
                <div>
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green">Helligkeit</h3>
                  <p className="text-sm text-elbfunkeln-green/70">Display Brightness</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="font-inter text-elbfunkeln-green">
                  Helligkeit: {brightness[0]}%
                </Label>
                <Slider
                  value={brightness}
                  onValueChange={setBrightness}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="text-xs text-elbfunkeln-green/60 flex justify-between">
                  <span>Dunkel</span>
                  <span>Standard</span>
                  <span>Hell</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Price Range Slider */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-white to-elbfunkeln-rose/20 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-elbfunkeln-green/20 rounded-full">
                  <Palette className="w-6 h-6 text-elbfunkeln-green" />
                </div>
                <div>
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green">Preisbereich</h3>
                  <p className="text-sm text-elbfunkeln-green/70">Produkt Filter</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="font-inter text-elbfunkeln-green">
                  €{priceRange[0]} - €{priceRange[1]}
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
          </motion.div>

          {/* Discount Slider */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-white to-elbfunkeln-green/20 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-500/20 rounded-full">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green">Rabatt</h3>
                  <p className="text-sm text-elbfunkeln-green/70">Aktuelle Aktion</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="font-inter text-elbfunkeln-green">
                  Rabatt: {discount[0]}%
                </Label>
                <Slider
                  value={discount}
                  onValueChange={setDiscount}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-elbfunkeln-green/60 flex justify-between">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quality Settings */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-white to-purple-100/50 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green">Bildqualität</h3>
                  <p className="text-sm text-elbfunkeln-green/70">Komprimierung</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="font-inter text-elbfunkeln-green">
                  Qualität: {quality[0]}%
                </Label>
                <Slider
                  value={quality}
                  onValueChange={setQuality}
                  max={100}
                  min={20}
                  step={5}
                  className="w-full"
                />
                <div className="text-xs text-elbfunkeln-green/60 flex justify-between">
                  <span>Niedrig</span>
                  <span>Mittel</span>
                  <span>Hoch</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Opacity Control */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="p-6 bg-gradient-to-br from-white to-pink-100/50 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-pink-500/20 rounded-full" style={{ opacity: opacity[0] / 100 }}>
                  <div className="w-6 h-6 bg-pink-500 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-cormorant text-xl text-elbfunkeln-green">Transparenz</h3>
                  <p className="text-sm text-elbfunkeln-green/70">Element Opacity</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="font-inter text-elbfunkeln-green">
                  Deckkraft: {opacity[0]}%
                </Label>
                <Slider
                  value={opacity}
                  onValueChange={setOpacity}
                  max={100}
                  min={10}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-elbfunkeln-green/60 flex justify-between">
                  <span>Transparent</span>
                  <span>Halbtransparent</span>
                  <span>Undurchsichtig</span>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>

        {/* Live Preview */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card className="p-8 bg-gradient-to-br from-elbfunkeln-beige/30 to-elbfunkeln-lavender/20">
            <h3 className="font-cormorant text-2xl text-elbfunkeln-green mb-6 text-center">
              Live Preview
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div 
                  className="w-20 h-20 bg-gradient-to-br from-elbfunkeln-lavender to-elbfunkeln-rose rounded-full mx-auto mb-4 transition-all duration-300"
                  style={{ 
                    filter: `brightness(${brightness[0]}%)`,
                    opacity: opacity[0] / 100 
                  }}
                />
                <p className="text-sm text-elbfunkeln-green/70">Helligkeit & Transparenz</p>
              </div>
              
              <div className="text-center">
                <div className="mb-4">
                  <div 
                    className="text-2xl font-cormorant text-elbfunkeln-green transition-all duration-300"
                    style={{ fontSize: `${volume[0] / 4 + 12}px` }}
                  >
                    Beispieltext
                  </div>
                </div>
                <p className="text-sm text-elbfunkeln-green/70">Schriftgröße (Lautstärke)</p>
              </div>
              
              <div className="text-center">
                <div className="mb-4">
                  <div className="text-lg font-inter text-elbfunkeln-green">
                    €{priceRange[0]}.00 - €{priceRange[1]}.00
                  </div>
                  <div className="text-sm text-elbfunkeln-rose">
                    -{discount[0]}% Rabatt
                  </div>
                </div>
                <p className="text-sm text-elbfunkeln-green/70">Preisbereich & Rabatt</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Speichern Button */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button 
            className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-rose hover:scale-105 active:scale-95 transition-all duration-300"
            size="lg"
          >
            Einstellungen speichern
          </Button>
        </motion.div>
      </div>
    </div>
  );
}