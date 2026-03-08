const LogoSVG = ({ className = "w-48 h-48", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    viewBox="0 0 200 250"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Pin outline: circle top + V bottom to point */}
    <path
      d="M100 16
         C56 16 22 50 22 90
         C22 110 30 126 42 142
         L100 214
         L158 142
         C170 126 178 110 178 90
         C178 50 144 16 100 16Z"
      stroke={color}
      strokeWidth="9"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />

    {/* Headband/strap arc across the top — connects to mask sides */}
    <path
      d="M52 82
         C52 50 72 34 100 34
         C128 34 148 50 148 82"
      stroke={color}
      strokeWidth="8"
      strokeLinecap="round"
      fill="none"
    />

    {/* Mask frame — continuous shape wrapping both lenses */}
    <path
      d="M48 84
         C48 72 56 66 68 66
         L88 66
         C92 66 95 68 97 72
         L100 76
         L103 72
         C105 68 108 66 112 66
         L132 66
         C144 66 152 72 152 84
         C152 96 144 106 132 108
         L120 108
         C112 108 106 104 103 98
         L100 94
         L97 98
         C94 104 88 108 80 108
         L68 108
         C56 108 48 96 48 84Z"
      stroke={color}
      strokeWidth="7"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Left lens inner shape */}
    <path
      d="M58 84
         C58 76 64 72 72 72
         L84 72
         C88 72 90 74 91 77
         C92 80 92 84 90 90
         C88 96 82 100 74 100
         C64 100 58 94 58 84Z"
      fill={color}
      opacity="0.12"
    />

    {/* Right lens inner shape */}
    <path
      d="M142 84
         C142 76 136 72 128 72
         L116 72
         C112 72 110 74 109 77
         C108 80 108 84 110 90
         C112 96 118 100 126 100
         C136 100 142 94 142 84Z"
      fill={color}
      opacity="0.12"
    />

    {/* Left strap connector / buckle */}
    <path
      d="M48 82 L42 78"
      stroke={color}
      strokeWidth="7"
      strokeLinecap="round"
    />

    {/* Right strap connector / buckle */}
    <path
      d="M152 82 L158 78"
      stroke={color}
      strokeWidth="7"
      strokeLinecap="round"
    />

    {/* Nose piece — prominent triangular shape */}
    <path
      d="M88 100
         C90 108 94 118 100 120
         C106 118 110 108 112 100"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Nose bridge detail */}
    <path
      d="M94 108 L100 116 L106 108"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Bottom dot */}
    <circle cx="100" cy="228" r="7" fill={color} />
  </svg>
);

const LogoPreview = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold text-foreground mb-8 text-center">Logo Preview — Aprueba antes de aplicar</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Dark on light */}
        <div className="bg-white rounded-2xl border border-border p-12 flex flex-col items-center gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dark on Light</h2>
          <LogoSVG className="w-48 h-60" color="#0f5e5a" />
          <div className="flex items-center gap-3 mt-4">
            <LogoSVG className="w-8 h-10" color="#0f5e5a" />
            <span className="text-xl font-bold" style={{ color: '#0f5e5a' }}>ScubaTrip</span>
          </div>
        </div>

        {/* Light on dark */}
        <div className="bg-ocean-900 rounded-2xl border border-border p-12 flex flex-col items-center gap-4">
          <h2 className="text-sm font-semibold text-ocean-300 uppercase tracking-wider">Light on Dark</h2>
          <LogoSVG className="w-48 h-60" color="white" />
          <div className="flex items-center gap-3 mt-4">
            <LogoSVG className="w-8 h-10" color="white" />
            <span className="text-xl font-bold text-white">ScubaTrip</span>
          </div>
        </div>

        {/* Reference comparison */}
        <div className="md:col-span-2 bg-muted rounded-2xl p-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 text-center">Tamaños en contexto (navbar, headers)</h2>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            <div className="flex items-center gap-2">
              <LogoSVG className="w-6 h-8" color="#0f5e5a" />
              <span className="font-bold text-foreground">ScubaTrip</span>
            </div>
            <div className="bg-ocean-900 rounded-lg px-4 py-2 flex items-center gap-2">
              <LogoSVG className="w-6 h-8" color="white" />
              <span className="font-bold text-white">ScubaTrip</span>
            </div>
            <div className="flex items-center gap-4">
              <LogoSVG className="w-5 h-7" color="#0f5e5a" />
              <LogoSVG className="w-8 h-10" color="#0f5e5a" />
              <LogoSVG className="w-12 h-16" color="#0f5e5a" />
              <LogoSVG className="w-20 h-24" color="#0f5e5a" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoPreview;
