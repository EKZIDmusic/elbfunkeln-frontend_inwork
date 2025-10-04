import { useState, useEffect } from 'react';
import { useRouter } from './Router';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import elbfunkelnLogo from 'figma:asset/e83277e3db0e207c35dbfae5118b80ab62f44860.png';

const heroImages = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1712828001446-0c3cef1f4e9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kbWFkZSUyMHdpcmUlMjBqZXdlbHJ5JTIwZWxlZ2FudHxlbnwxfHx8fDE3NTc2MDc1ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    alt: 'Handgemachte Drahtkunst',
    size: 'large' // 320px
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1601057836844-a8a336439a27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpY2F0ZSUyMGdvbGQlMjBlYXJyaW5nc3xlbnwxfHx8fDE3NTc3MDMzNDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    alt: 'Zarte Ohrringe',
    size: 'medium' // 240px
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1708221269460-fc630272e54d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcmluZyUyMGpld2Vscnl8ZW58MXx8fHwxNzU3NzAzMzQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    alt: 'Minimalistische Ringe',
    size: 'small' // 180px
  }
];

export function HeroSection() {
  const { navigateTo } = useRouter();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCircleSize = (size: string) => {
    switch (size) {
      case 'large':
        return 'w-96 h-96'; // 384px
      case 'medium':
        return 'w-72 h-72'; // 288px
      case 'small':
        return 'w-56 h-56'; // 224px
      default:
        return 'w-72 h-72';
    }
  };

  return (
    <section className="relative min-h-screen bg-elbfunkeln-beige overflow-hidden">
      {/* Elbfunkeln Logo im Hintergrund mit Parallax */}
      <div 
        className="absolute inset-0 flex items-center justify-center z-0"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`
        }}
      >
        <img
          src={elbfunkelnLogo}
          alt="Elbfunkeln Logo"
          className="w-[600px] h-[600px] opacity-5 object-contain"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        
        {/* Title Section */}
        <div className="text-center mb-16">
          <h1 className="font-cormorant text-4xl md:text-6xl lg:text-7xl text-elbfunkeln-green mb-6">
            Handgemachte Drahtkunst
          </h1>
          <p className="font-inter text-lg md:text-xl text-elbfunkeln-green/80 max-w-2xl mx-auto mb-8">
            Einzigartige Schmuckstücke aus Hamburg, die deine Persönlichkeit unterstreichen
          </p>
          <Button 
            onClick={() => navigateTo('shop')}
            className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90 hover:scale-105 active:scale-95 transition-all duration-300 font-inter px-8 py-3 text-lg"
          >
            Kollektion entdecken
          </Button>
        </div>

        {/* Drei verschieden große Kreise */}
        <div className="relative w-full max-w-6xl mx-auto">
          {/* Großer Kreis - links */}
          <div className="absolute left-0 top-0 lg:-left-8 animate-float-medium">
            <div className={`${getCircleSize('large')} rounded-full overflow-hidden shadow-2xl border-4 border-white`}>
              <ImageWithFallback
                src={heroImages[0].image}
                alt={heroImages[0].alt}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Mittlerer Kreis - rechts oben */}
          <div className="absolute right-0 top-12 lg:-right-8 animate-float-gentle animate-delay-2">
            <div className={`${getCircleSize('medium')} rounded-full overflow-hidden shadow-xl border-4 border-white`}>
              <ImageWithFallback
                src={heroImages[1].image}
                alt={heroImages[1].alt}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Kleiner Kreis - rechts unten */}
          <div className="absolute right-16 bottom-8 lg:right-24 animate-float-strong animate-delay-4">
            <div className={`${getCircleSize('small')} rounded-full overflow-hidden shadow-lg border-4 border-white`}>
              <ImageWithFallback
                src={heroImages[2].image}
                alt={heroImages[2].alt}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Platzhalter für Höhe */}
          <div className="h-[500px] lg:h-[450px]"></div>
        </div>

        {/* Call-to-Action Sektion */}
        <div className="text-center mt-16">
          <p className="font-inter text-elbfunkeln-green/70 mb-4">
            Jedes Stück ist ein Unikat
          </p>
          <Button 
            onClick={() => navigateTo('about')}
            className="bg-elbfunkeln-green text-white hover:bg-elbfunkeln-green/90 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Mehr über uns erfahren
          </Button>
        </div>
      </div>
    </section>
  );
}