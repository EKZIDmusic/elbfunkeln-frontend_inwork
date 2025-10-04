import { motion } from 'motion/react';

interface RopeLineProps {
  className?: string;
  height?: number;
  thickness?: number;
  droop?: number;
  speed?: number;
  color?: string;
}

export function RopeLine({ 
  className = '',
  height = 8,
  thickness = 6,
  droop = 2,
  speed = 12,
  color = '#a67171'
}: RopeLineProps) {
  
  // Erstelle realistische Hafentau-Kurven mit natürlichem Durchhang
  const createRopeCurve = (sag: number = droop) => {
    const points: string[] = [`M 0 ${height/2}`];
    const segments = 8;
    
    for (let i = 1; i <= segments; i++) {
      const x = (i / segments) * 100;
      // Natürlicher Durchhang in der Mitte
      const sagEffect = Math.sin((i / segments) * Math.PI) * sag;
      const y = (height / 2) + sagEffect;
      
      if (i === 1) {
        points.push(`Q ${x/2} ${y} ${x} ${y}`);
      } else {
        points.push(`T ${x} ${y}`);
      }
    }
    
    return points.join(' ');
  };

  return (
    <div className={`w-full overflow-hidden ${className}`} style={{ height: `${height}px` }}>
      <svg 
        className="w-full h-full" 
        viewBox={`0 0 100 ${height}`} 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Geflochtene Tau-Textur */}
          <pattern id="ropePattern" patternUnits="userSpaceOnUse" width="3" height={height}>
            <path d={`M0,${height/2} Q1.5,${height/2-1} 3,${height/2}`} stroke="#a67171" strokeWidth="0.8" fill="none" opacity="0.8"/>
            <path d={`M0,${height/2} Q1.5,${height/2+1} 3,${height/2}`} stroke="#68685f" strokeWidth="0.6" fill="none" opacity="0.6"/>
            <path d={`M0,${height/2} L3,${height/2}`} stroke="#ddd4ce" strokeWidth="0.4" fill="none" opacity="0.3"/>
          </pattern>
        </defs>
        
        {/* Haupt-Tau mit Durchhang */}
        <motion.path
          initial={{ d: createRopeCurve(droop) }}
          animate={{ 
            d: [
              createRopeCurve(droop), 
              createRopeCurve(droop * 1.2), 
              createRopeCurve(droop * 0.8),
              createRopeCurve(droop)
            ]
          }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          stroke="url(#ropePattern)"
          strokeWidth={thickness}
          fill="none"
        />
        
        {/* Zweiter Tau-Strang für mehr Realismus */}
        <motion.path
          initial={{ d: createRopeCurve(droop * 0.8) }}
          animate={{ 
            d: [
              createRopeCurve(droop * 0.8), 
              createRopeCurve(droop * 1.1), 
              createRopeCurve(droop * 0.7),
              createRopeCurve(droop * 0.8)
            ]
          }}
          transition={{
            duration: speed * 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          stroke={color}
          strokeWidth={thickness * 0.7}
          fill="none"
          opacity={0.6}
        />
        
        {/* Dritter Strang für Tiefe */}
        <motion.path
          initial={{ d: createRopeCurve(droop * 0.6) }}
          animate={{ 
            d: [
              createRopeCurve(droop * 0.6), 
              createRopeCurve(droop * 0.9), 
              createRopeCurve(droop * 0.5),
              createRopeCurve(droop * 0.6)
            ]
          }}
          transition={{
            duration: speed * 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          stroke="#68685f"
          strokeWidth={thickness * 0.5}
          fill="none"
          opacity={0.4}
        />
      </svg>
    </div>
  );
}

// Vordefinierte Hafentau-Varianten
export function HeaderRope({ className }: { className?: string }) {
  return (
    <RopeLine 
      className={className}
      height={8}
      thickness={6}
      droop={2}
      speed={12}
      color="#a67171"
    />
  );
}

export function SubtleRope({ className }: { className?: string }) {
  return (
    <RopeLine 
      className={className}
      height={6}
      thickness={4}
      droop={1.5}
      speed={15}
      color="#68685f"
    />
  );
}

export function HarborRope({ className }: { className?: string }) {
  return (
    <div className={`relative w-full ${className}`} style={{ height: '8px' }}>
      <svg 
        className="w-full h-full absolute" 
        viewBox="0 0 400 8" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Realistische Tau-Textur */}
          <pattern id="harborRopeTexture" patternUnits="userSpaceOnUse" width="12" height="8">
            <path d="M0,4 Q3,2 6,4 T12,4" stroke="#a67171" strokeWidth="1.5" fill="none" opacity="0.8"/>
            <path d="M0,4 Q3,6 6,4 T12,4" stroke="#68685f" strokeWidth="1.2" fill="none" opacity="0.6"/>
            <path d="M0,4 Q3,3 6,4 T12,4" stroke="#ddd4ce" strokeWidth="0.8" fill="none" opacity="0.4"/>
          </pattern>
        </defs>
        
        {/* Haupt-Hafentau mit natürlichem Durchhang */}
        <motion.path
          d="M 0,4 Q 100,6 200,4 T 400,4"
          stroke="url(#harborRopeTexture)"
          strokeWidth="6"
          fill="none"
          animate={{
            d: [
              "M 0,4 Q 100,6 200,4 T 400,4",
              "M 0,4 Q 100,7 200,4 T 400,4",
              "M 0,4 Q 100,5.5 200,4 T 400,4",
              "M 0,4 Q 100,6 200,4 T 400,4"
            ]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Geflochtene Struktur - Strang 1 */}
        <motion.path
          d="M 0,4 Q 80,5.5 160,4 T 320,4 T 400,4"
          stroke="#a67171"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
          animate={{
            d: [
              "M 0,4 Q 80,5.5 160,4 T 320,4 T 400,4",
              "M 0,4 Q 80,6.2 160,4 T 320,4 T 400,4",
              "M 0,4 Q 80,5 160,4 T 320,4 T 400,4",
              "M 0,4 Q 80,5.5 160,4 T 320,4 T 400,4"
            ]
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Geflochtene Struktur - Strang 2 */}
        <motion.path
          d="M 0,4 Q 120,5 240,4 T 400,4"
          stroke="#68685f"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
          animate={{
            d: [
              "M 0,4 Q 120,5 240,4 T 400,4",
              "M 0,4 Q 120,5.8 240,4 T 400,4",
              "M 0,4 Q 120,4.5 240,4 T 400,4",
              "M 0,4 Q 120,5 240,4 T 400,4"
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>
    </div>
  );
}

// Legacy-Export für Kompatibilität (umbenennen von Wave zu Rope)
export const WaveLine = RopeLine;
export const HeaderWave = HeaderRope;
export const SubtleWave = SubtleRope;
export const WaterWaves = HarborRope;