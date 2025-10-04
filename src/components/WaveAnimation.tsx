export function WaveAnimation() {
  return (
    <div className="fixed top-[72px] left-0 right-0 z-40 h-2 overflow-hidden">
      <div className="relative w-full h-full">
        {/* Hauptwelle */}
        <div className="absolute inset-0 animate-wave-flow">
          <svg
            className="w-[200%] h-full"
            viewBox="0 0 400 8"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#68685f" stopOpacity="0.8" />
                <stop offset="25%" stopColor="#a67171" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#c4ccff" stopOpacity="1" />
                <stop offset="75%" stopColor="#a67171" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#68685f" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ddd4ce" stopOpacity="0.6" />
                <stop offset="33%" stopColor="#a67171" stopOpacity="0.7" />
                <stop offset="66%" stopColor="#68685f" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ddd4ce" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            
            {/* Hauptwelle */}
            <path
              d="M 0,4 Q 50,1 100,4 T 200,4 T 300,4 T 400,4"
              stroke="url(#waveGradient)"
              strokeWidth="3"
              fill="none"
              opacity="0.9"
            />
            
            {/* Zweite Welle für Tiefe */}
            <path
              d="M 0,4 Q 75,6 150,4 T 300,4 T 400,4"
              stroke="url(#waveGradient2)"
              strokeWidth="2"
              fill="none"
              opacity="0.7"
            />
            
            {/* Subtile dritte Welle */}
            <path
              d="M 0,4 Q 25,2.5 50,4 T 100,4 T 150,4 T 200,4 T 250,4 T 300,4 T 350,4 T 400,4"
              stroke="#c4ccff"
              strokeWidth="1"
              fill="none"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* Schimmernde Punkte */}
        <div className="absolute inset-0 animate-shimmer-flow">
          <div className="absolute top-1 left-[10%] w-1 h-1 bg-elbfunkeln-lavender rounded-full opacity-80 animate-pulse"></div>
          <div className="absolute top-0.5 left-[30%] w-0.5 h-0.5 bg-elbfunkeln-rose rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1.5 left-[50%] w-1 h-1 bg-elbfunkeln-green rounded-full opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-0.5 left-[70%] w-0.5 h-0.5 bg-elbfunkeln-lavender rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1 left-[90%] w-1 h-1 bg-elbfunkeln-rose rounded-full opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
}